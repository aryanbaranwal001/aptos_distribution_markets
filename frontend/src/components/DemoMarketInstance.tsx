"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useWallet,
  type InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useThemeStore, getThemeClasses } from "@/store/themeStore";
import NormalDistributionChart from "@/components/NormalDistributionChart";
import { formatDate } from "@/utils/formatters";
import { useMarket } from "@/hooks/useMarkets";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import AIHelperButton from "@/components/AIHelperButton";
import AIChatSidebar from "@/components/AIChatSidebar";
import BookmarkIcon from "@/components/BookmarkIcon";
import { WalletSelector } from "@/components/WalletSelector";
import { bookmarkStorage } from "@/utils/bookmarkStorage";
import { Bool } from "@aptos-labs/ts-sdk";
import * as numeric from "numeric";

// Extend Window interface to include aptos wallet
declare global {
  interface Window {
    aptos?: any;
  }
}

// Contract configuration
const CONTRACT_ADDRESS =
  "0x3b0c1f2a3f9f281f3a654afd1cc07dfcdfa8facee967b196cc77cdd20b98c829";
const MARKET_ADDRESS =
  "0x305f65ce0586f4cf101774497acacf98d041022ddbd9906ba8428bcc9637d9ef";

// Aptos SDK configuration
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

const DemoMarketInstance = () => {
  const params = useParams();
  const { color } = useThemeStore();
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [currentWallet, setCurrentWallet] = useState<any>(null);
  const [marketId, setMarketId] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [iconSrc, setIconSrc] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);

  const [marketState, setMarketState] = useState<any>(null);
  const [marketParams, setMarketParams] = useState<any>(null);
  const [minStdDev, setMinStdDev] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);

  // Use the new API hook
  const { data: market, loading, error } = useMarket(marketId);

  // Set current wallet when connected
  useEffect(() => {
    if (connected && typeof window !== "undefined" && window.aptos) {
      setCurrentWallet(window.aptos);
    } else {
      setCurrentWallet(null);
    }
  }, [connected]);

  // Check bookmark status when market loads
  useEffect(() => {
    if (market) {
      setIsBookmarked(bookmarkStorage.isBookmarked(market.id));
    }
  }, [market]);

  // Slider states for mean and std dev - dynamically set to market values for zero delta
  const [userMean, setUserMean] = useState(market?.market_mean || 0);
  const [userStdDev, setUserStdDev] = useState(
    market?.market_standard_deviation || 0
  );
  const [activeTab, setActiveTab] = useState("trade");
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [aptAmount, setAptAmount] = useState<string>("");
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [calculatedCost, setCalculatedCost] = useState<number>(0);
  const [optimalX, setOptimalX] = useState<number>(0);
  const [chartData, setChartData] = useState<any>({
    marketData: [],
    userProposalData: [],
    differenceData: [],
  });

  // Calculate lambda using the formula: lambda = sqrt(2 * sigma * sqrt(pi))
  const calculateLambda = (sigma: number) => {
    return Math.sqrt(2 * Math.abs(sigma) * Math.sqrt(Math.PI));
  };

  // Calculate probability and cumulative values using the specified formula
  // p(x) = lambda * (1/(sqrt(2*pi*sigma))) * e^(-((x-mu)^2)/(2*(sigma^2)))
  const calculateProbabilityAtPoint = (x: number) => {
    if (!market) return { probability: 0, cumulative: 0 };

    const lambda = calculateLambda(userStdDev);
    const sigma = Math.abs(userStdDev);
    const mu = userMean;

    // Correctly calculate probability using the component's normalPDF function
    const probability = lambda * normalPDF(x, mu, sigma);

    // Simple cumulative calculation (approximation)
    const cumulative =
      0.5 *
      (1 +
        Math.sign(x - userMean) *
          Math.sqrt(
            1 -
              Math.exp(
                (-2 * Math.pow((x - userMean) / Math.abs(userStdDev), 2)) /
                  Math.PI
              )
          ));

    return {
      probability,
      cumulative: Math.max(0, Math.min(1, cumulative)),
    };
  };

  // Calculate lambda for market parameters (for display under Cap & Scale)
  const marketLambda = market
    ? calculateLambda(market.market_standard_deviation)
    : 0;

  // Calculate normal distribution PDF: (1/sqrt(2*pi*sigma^2)) * exp(-(x-mu)^2/(2*sigma^2))
  const normalPDF = (x: number, mu: number, sigma: number) => {
    if (sigma <= 0) return 0;
    const absSigma = Math.abs(sigma);
    const coefficient = 1 / (absSigma * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mu) / absSigma, 2);
    return coefficient * Math.exp(exponent);
  };

  // Generate data points for λ * pdf curve
  const generateScaledCurveData = (
    mean: number,
    stdDev: number,
    lambda: number,
    min: number,
    max: number,
    points: number = 200
  ) => {
    const step = (max - min) / points;
    const data: Array<{ x: number; y: number }> = [];

    for (let i = 0; i <= points; i++) {
      const x = min + i * step;
      const y = lambda * normalPDF(x, mean, stdDev);
      data.push({ x, y });
    }

    return data;
  };

  const currentStats =
    hoverValue !== null
      ? calculateProbabilityAtPoint(hoverValue)
      : calculateProbabilityAtPoint(userMean);

  const theme = getThemeClasses(color);

  // View call helper
  async function callView(functionName: string, args: any[] = []) {
    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::distribution_markets::${functionName}`,
        type_arguments: [],
        functionArguments: args,
      };
      const result = await aptos.view({ payload });
      return result;
    } catch (e) {
      console.error("View call failed:", e);
      throw e;
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const marketStateData = await callView("get_market_state", [
          MARKET_ADDRESS,
        ]);
        setMarketState(marketStateData[0]);

        const marketParamsData = await callView("get_amm_holdings", [
          MARKET_ADDRESS,
        ]);
        setMarketParams(marketParamsData[0]);

        const minStdDevData = await callView("get_min_standard_deviation", [
          MARKET_ADDRESS,
        ]);
        setMinStdDev(minStdDevData[0]);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const fetchPositions = async () => {
    if (!account) return;
    setPositionsLoading(true);
    try {
      const positionsData = await callView("get_all_trader_positions", [
        account.address,
        MARKET_ADDRESS,
      ]);
      setPositions(positionsData[0]);
    } catch (error) {
      console.error("Failed to fetch positions:", error);
    } finally {
      setPositionsLoading(false);
    }
  };

  // First, we need to find the market ID from the slug
  // For now, we'll use the slug as the ID since we don't have a slug-to-ID mapping
  useEffect(() => {
    if (params.slug) {
      // Convert slug back to a potential market ID
      // This is a temporary solution - ideally we'd have a proper slug-to-ID mapping
      setMarketId(params.slug as string);
    }
  }, [params.slug]);

  // Update component state when market data is loaded
  useEffect(() => {
    if (market && marketParams && minStdDev) {
      setIsBookmarked(market.isBookmarked || false);

      // Set initial icon source - use PNG directly
      const pngSrc = market.iconName
        ? `/icons/${market.iconName.replace(".svg", ".png")}`
        : "/icons/default.png";
      setIconSrc(pngSrc);

      const newMarketMean = Number(marketParams[0]) / 1e18;
      const newMarketStdDev = Number(marketParams[1]) / 1e18;
      const newMinStdDev = Number(minStdDev) / 1e18;

      // Initialize sliders to center positions for zero delta
      setUserMean(newMarketMean);
      setUserStdDev(newMarketStdDev);

      const marketMeanDeviation = market.market_mean_deviation;
      const marketMeanMin =
        newMarketMean - (marketMeanDeviation * newMarketMean) / 100;
      const marketMeanMax =
        newMarketMean + (marketMeanDeviation * newMarketMean) / 100;

      // Update market object with on-chain data
      const updatedMarket = {
        ...market,
        market_mean: newMarketMean,
        market_standard_deviation: newMarketStdDev,
        market_standard_deviation_min: newMinStdDev,
        market_standard_deviation_max:
          newMarketStdDev + (newMarketStdDev - newMinStdDev),
        market_mean_min: marketMeanMin,
        market_mean_max: marketMeanMax,
      };
      // This is a bit of a hack to avoid changing the whole structure
      Object.assign(market, updatedMarket);
    }
  }, [market, marketParams, minStdDev]);

  // Recalculate chart data and cost whenever user parameters change
  useEffect(() => {
    if (!market) return;

    // 1. Generate data for chart
    const minX = Math.min(
      market.market_mean - 4 * Math.abs(market.market_standard_deviation),
      userMean - 4 * Math.abs(userStdDev)
    );
    const maxX = Math.max(
      market.market_mean + 4 * Math.abs(market.market_standard_deviation),
      userMean + 4 * Math.abs(userStdDev)
    );

    const lambdaMarket = calculateLambda(market.market_standard_deviation);
    const lambdaUser = calculateLambda(userStdDev);

    const marketData = generateScaledCurveData(
      market.market_mean,
      market.market_standard_deviation,
      lambdaMarket,
      minX,
      maxX
    );
    const userProposalData = generateScaledCurveData(
      userMean,
      userStdDev,
      lambdaUser,
      minX,
      maxX
    );
    const differenceData = marketData.map((point, index) => ({
      x: point.x,
      y: userProposalData[index].y - point.y,
    }));

    setChartData({ marketData, userProposalData, differenceData });

    // 2. Calculate cost from difference data
    if (differenceData.length > 0) {
      // Find the minimum y-value in the difference curve
      const minPoint = differenceData.reduce(
        (min, p) => (p.y < min.y ? p : min),
        differenceData[0]
      );

      // Cost is the absolute value of the minimum difference
      const cost = Math.abs(minPoint.y);

      setCalculatedCost(cost);
      setOptimalX(minPoint.x);
    }
  }, [market, userMean, userStdDev]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      // Use default icon when PNG fails to load
      setIconSrc("/icons/default.png");
    }
  };

  const handleBookmark = () => {
    if (!market) return;

    if (isBookmarked) {
      bookmarkStorage.removeBookmark(market.id);
      setIsBookmarked(false);
    } else {
      bookmarkStorage.addBookmark({
        id: market.id,
        title: market.title,
        description: market.description,
        volume: market.volume,
        categories: market.categories,
        iconName: market.iconName,
      });
      setIsBookmarked(true);
    }
  };

  // Trading function to call the smart contract
  const handleTrade = async () => {
    console.log("=== TRADE DEBUG INFO ===");
    console.log("currentWallet:", currentWallet);
    console.log("account:", account);
    console.log("connected:", connected);
    console.log(
      "window.aptos:",
      typeof window !== "undefined" ? window.aptos : "undefined"
    );

    if (!currentWallet || !account) {
      console.error("Please connect your wallet first");
      console.error("currentWallet:", currentWallet);
      console.error("account:", account);
      return;
    }

    if (!market || !marketId) {
      console.error("Market not loaded");
      return;
    }

    setIsTrading(true);

    try {
      // DYNAMIC VALUES - Let's debug what's different
      console.log("=== DYNAMIC VALUES DEBUG ===");
      console.log("userMean:", userMean);
      console.log("userStdDev:", userStdDev);
      console.log("calculatedCost:", calculatedCost);
      console.log("optimalX:", optimalX);

      // Convert values to the format expected by the smart contract
      // Mean: convert to 18-decimal precision (multiply by 10^18)
      const targetMean = Math.floor(Math.abs(userMean) * Math.pow(10, 18));

      // Standard deviation: convert to 18-decimal precision (multiply by 10^18)
      const targetStdDev = Math.floor(userStdDev * Math.pow(10, 18));

      // Mean is negative flag
      const targetMeanIsNegative = userMean < 0;

      // Trade cost in APT octas (8-decimal) - using calculated cost plus fees
      const totalCost = calculatedCost + 0.002; // Add protocol fee and gas
      const tradeCost = Math.floor(totalCost * Math.pow(10, 8));

      // Optimal x value from fmin calculation (convert to 18-decimal precision)
      const optimalXValue = Math.floor(Math.abs(optimalX) * Math.pow(10, 18));

      console.log("=== CONVERTED VALUES ===");
      console.log("targetMean:", targetMean.toString());
      console.log("targetStdDev:", targetStdDev.toString());
      console.log("targetMeanIsNegative:", targetMeanIsNegative);
      console.log("tradeCost:", tradeCost.toString());
      console.log("optimalXValue:", optimalXValue.toString());

      // Compare with hardcoded values that work
      console.log("=== COMPARISON WITH WORKING VALUES ===");
      console.log("Hardcoded targetMean: 500000000000000000");
      console.log("Dynamic targetMean:", targetMean.toString());
      console.log("Match:", targetMean.toString() === "500000000000000000");

      console.log("Hardcoded targetStdDev: 800000000000000000");
      console.log("Dynamic targetStdDev:", targetStdDev.toString());
      console.log("Match:", targetStdDev.toString() === "800000000000000000");

      console.log("Hardcoded tradeCost: 20000000");
      console.log("Dynamic tradeCost:", tradeCost.toString());
      console.log("Match:", tradeCost.toString() === "20000000");

      console.log("Hardcoded optimalXValue: 563256000000000000");
      console.log("Dynamic optimalXValue:", optimalXValue.toString());
      console.log("Match:", optimalXValue.toString() === "563256000000000000");

      console.log("Trade parameters (DYNAMIC VALUES):", {
        contractAddress: CONTRACT_ADDRESS,
        marketAddress: MARKET_ADDRESS,
        targetMean: targetMean.toString(),
        targetStdDev: targetStdDev.toString(),
        targetMeanIsNegative,
        tradeCost: tradeCost.toString(),
        optimalX: optimalXValue.toString(),
      });

      // Create the transaction payload in the new format
      const transaction = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::distribution_markets::trade_with_apt`,
        type_arguments: [],
        arguments: [
          MARKET_ADDRESS, // market_addr: address
          targetMean.toString(), // target_mean: u128 (dynamic)
          targetStdDev.toString(), // target_std_dev: u64 (dynamic)
          targetMeanIsNegative, // target_mean_is_negative: bool (dynamic)
          tradeCost.toString(), // trade_cost: u64 (dynamic)
          optimalXValue.toString(), // optimal_x: u128 (dynamic)
        ],
      };

      console.log("Transaction payload:", transaction);

      try {
        console.log("About to call currentWallet.signAndSubmitTransaction...");
        console.log(
          "Transaction object:",
          JSON.stringify(transaction, null, 2)
        );

        // Sign and submit the transaction using the current wallet
        const response = await currentWallet.signAndSubmitTransaction(
          transaction
        );

        console.log("Transaction response:", response);
        console.log("Transaction hash:", response.hash);

        // Wait for transaction confirmation
        try {
          console.log("Waiting for transaction confirmation...");
          await aptos.waitForTransaction({
            transactionHash: response.hash,
          });
          console.log("Trade executed successfully!");
        } catch (waitError: any) {
          console.error("Transaction wait error:", waitError);
          console.error(
            `Transaction submitted but confirmation failed: ${waitError.message}`
          );
        }
      } catch (error: any) {
        console.error("Transaction failed:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          stack: error.stack,
        });
      }
    } catch (error) {
      console.error("Trade failed:", error);
    } finally {
      setIsTrading(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!currentWallet || !account) {
      console.error("Please connect your wallet first");
      return;
    }
    if (!aptAmount || parseFloat(aptAmount) <= 0) {
      console.error("Please enter a valid amount of APT");
      return;
    }

    setIsAddingLiquidity(true);
    try {
      const y = BigInt(Math.floor(parseFloat(aptAmount) * 1e18));
      const aptAmountInOctas = BigInt(Math.floor(parseFloat(aptAmount) * 1e8));

      const transaction = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::distribution_markets::add_liquidity_with_apt`,
        type_arguments: [],
        arguments: [
          MARKET_ADDRESS,
          y.toString(),
          aptAmountInOctas.toString(),
        ],
      };

      console.log("Submitting add liquidity transaction:", transaction);

      const response = await currentWallet.signAndSubmitTransaction(transaction);

      console.log("Transaction response:", response);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      console.log("Liquidity added successfully!");
      setAptAmount("");
    } catch (error) {
      console.error("Failed to add liquidity:", error);
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  if (loading || !marketParams || !minStdDev) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text}`}>
        <Navbar />
        <CategoryNav />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text}`}>
        <Navbar />
        <CategoryNav />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {error
                ? "Error Loading Market"
                : "Market Not Found"}
            </h1>
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <Link
              href="/"
              className={`${theme.primary} hover:underline`}
            >
              Return to Markets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate deltas for display (removed unused variable)

  if (typeof market.market_mean_deviation !== 'number') {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text}`}>
        <Navbar />
        <CategoryNav />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Market Data Error
            </h1>
            <p className="text-red-400 mb-4">
              The required 'market_mean_deviation' is missing for this market.
            </p>
            <Link
              href="/"
              className={`${theme.primary} hover:underline`}
            >
              Return to Markets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <Navbar />
      <CategoryNav />

      {/* Market Content */}
      <main
        className="pt-12 px-3 max-w-6xl transition-all duration-300"
        style={{
          marginLeft: "auto",
          marginRight: isChatOpen ? "calc(384px + auto)" : "auto",
          transform: isChatOpen ? "translateX(-192px)" : "translateX(0)", // Half of chat width to center
        }}
      >
        {/* Back Button */}
        <div className="mb-4">
          <Link
            href="/"
            className={`inline-flex items-center space-x-1.5 p-1.5 mt-8 rounded-lg ${theme.hoverBg} transition-colors`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-lg">Back to Markets</span>
          </Link>
        </div>

        {/* Market Header - Outside Container */}
        <div className="mb-4">
          <div className="flex items-start space-x-4">
            {/* Market Icon */}
            <div className="flex-shrink-0">
              {iconSrc && (
                <Image
                  src={iconSrc}
                  alt="Market icon"
                  width={60}
                  height={60}
                  className="w-15 h-15 rounded-full"
                  onError={handleImageError}
                />
              )}
            </div>

            {/* Title and Description */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold">{market.title}</h1>
                <button
                  onClick={handleBookmark}
                  className={`p-1.5 rounded-full transition-colors ${
                    isBookmarked
                      ? `${theme.textSecondary}`
                      : `${theme.textSecondary} hover:${theme.primary}`
                  }`}
                >
                  <BookmarkIcon
                    filled={isBookmarked}
                    className="w-5 h-5"
                    themeColor={theme.primary}
                  />
                </button>
              </div>
              <p className={`${theme.textSecondary} text-sm leading-relaxed`}>
                {market.description}
              </p>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div
          className="rounded-lg border border-gray-500/20 p-4 mb-12"
          style={{ backgroundColor: "#1a1a1f" }}
        >
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:h-auto">
            {/* Left Container - Graph and Data (3/4 width) */}
            <div className="lg:col-span-3">
              {/* Combined Stats, Graph and Market Parameters Container */}
              <div
                className="rounded-lg border border-gray-500/20 p-4 h-full flex flex-col"
                style={{ backgroundColor: "#1a1a1f" }}
              >
                {/* Stats Row - Inline Values */}
                <div className="grid grid-cols-3 divide-x divide-gray-500/20 mb-4">
                  <div className="pr-4">
                    <div className={`text-xs ${theme.textSecondary}`}>
                      Value ({market.x_axis_short_form}):{" "}
                      <span className="font-bold text-white">
                        {hoverValue !== null
                          ? hoverValue.toFixed(2)
                          : userMean.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="px-4">
                    <div className={`text-xs ${theme.textSecondary}`}>
                      Probability:{" "}
                      <span className="font-bold text-white">
                        {(currentStats.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="pl-4">
                    <div className={`text-xs ${theme.textSecondary}`}>
                      Cumulative:{" "}
                      <span className="font-bold text-white">
                        {(currentStats.cumulative * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="border-t border-gray-500/20 mb-4" />

                {/* Graph Section - Flexible Height */}
                <div className="flex-1 mb-3 min-h-[300px]">
                  {activeTab === "trade" && (
                    <NormalDistributionChart
                      marketData={chartData.marketData}
                      userProposalData={chartData.userProposalData}
                      differenceData={chartData.differenceData}
                      onHover={setHoverValue}
                      xAxisLabel={market.x_axis_field_name}
                    />
                  )}
                  {activeTab === "positions" &&
                    (positionsLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
                      </div>
                    ) : positions.length > 0 ? (
                      <div className="flex flex-col h-[400px] overflow-y-auto gap-y-20">
                        {positions.map((position, index) => {
                          const traderMean = Number(position[0]) / 1e18;
                          const traderStdDev = Number(position[1]) / 1e18;
                          const marketMean = Number(position[3]) / 1e18;
                          const marketStdDev = Number(position[4]) / 1e18;

                          const lambdaTrader = calculateLambda(traderStdDev);
                          const lambdaMarket = calculateLambda(marketStdDev);

                          const minX = Math.min(
                            marketMean - 4 * marketStdDev,
                            traderMean - 4 * traderStdDev
                          );
                          const maxX = Math.max(
                            marketMean + 4 * marketStdDev,
                            traderMean + 4 * traderStdDev
                          );

                          const traderData = generateScaledCurveData(
                            traderMean,
                            traderStdDev,
                            lambdaTrader,
                            minX,
                            maxX
                          );
                          const marketData = generateScaledCurveData(
                            marketMean,
                            marketStdDev,
                            lambdaMarket,
                            minX,
                            maxX
                          );

                          return (
                            <div key={index} className="h-60">
                              <h3 className="text-sm font-bold mb-2 text-center">
                                Position {index + 1}
                              </h3>
                              <NormalDistributionChart
                                marketData={marketData}
                                userProposalData={traderData}
                                differenceData={[]}
                                onHover={() => {}}
                                xAxisLabel={market.x_axis_field_name}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                          <p>No positions to display.</p>
                          <p className="text-xs">
                            Your positions will be shown here.
                          </p>
                        </div>
                      </div>
                    ))}                </div>

                <hr className="border-t border-gray-500/20 mb-3" />

                {/* Market Parameters */}
                {activeTab === 'trade' && (
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-500/20">
                  {/* Stiffness Section */}
                  <div className="py-2 md:py-0 md:pr-3">
                    <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide">
                      STIFFNESS (LOCAL)
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>
                          S
                        </span>
                        <span className="font-mono text-xs">{market.s}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>
                          μ per σ1
                        </span>
                        <span className="font-mono text-xs">
                          {market.mu_per_one}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>
                          σ per σ1
                        </span>
                        <span className="font-mono text-xs">
                          {market.sigma_per_one}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cap & Scale Section */}
                  <div className="py-3 md:py-0 md:px-4">
                    <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide">
                      CAP & SCALE (λ)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>
                          Peak P
                        </span>
                        <span className="font-mono text-xs">
                          {market.peak_p}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>
                          Headroom
                        </span>
                        <span className="font-mono text-xs">
                          {market.headroom}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>
                          λ
                        </span>
                        <span className="font-mono text-xs">
                          {marketLambda.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lifecycle Section */}
                  <div className="py-3 md:py-0 md:pl-4">
                    <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide">
                      LIFECYCLE
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>
                          Status
                        </span>
                        <span
                          className={`${
                            marketState?.is_active
                              ? "text-green-500"
                              : "text-red-500"
                          } text-xs`}
                        >
                          {marketState?.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>
                          Expires
                        </span>
                        <span className="text-xs">
                          {formatDate(market.endDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>
                          Created
                        </span>
                        <span className="text-xs">
                          {formatDate(market.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Right Container - Sidebar (1/4 width) */}
            <div className="lg:col-span-1">
              {/* Trading Panel - Single Container */}
              <div
                className="rounded-lg border border-gray-500/20 p-3 h-full flex flex-col"
                style={{ backgroundColor: "#1a1a1f" }}
              >
                {/* Trade Actions */}
                <div className="mb-3">
                  <div
                    className="flex gap-0.5 p-0.5 rounded-lg"
                    style={{ backgroundColor: "#2a2a2f" }}
                  >
                    <button
                      onClick={() => setActiveTab("trade")}
                      className={`flex-1 py-1.5 px-1 rounded-lg transition-all duration-200 text-xs font-semibold ${
                        activeTab === "trade"
                          ? `${theme.primaryBg} text-black`
                          : "hover:bg-gray-600/50 text-gray-300"
                      }`}
                    >
                      Trade
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("positions");
                        fetchPositions();
                      }}
                      className={`flex-1 py-1.5 px-1 rounded-lg transition-all duration-200 text-xs font-semibold ${
                        activeTab === "positions"
                          ? `${theme.primaryBg} text-black`
                          : "hover:bg-gray-600/50 text-gray-300"
                      }`}
                    >
                      Positions
                    </button>
                    <button
                      onClick={() => setActiveTab("liquidity")}
                      className={`flex-1 py-1.5 px-1 rounded-lg transition-all duration-200 text-xs font-semibold ${
                        activeTab === "liquidity"
                          ? `${theme.primaryBg} text-black`
                          : "hover:bg-gray-600/50 text-gray-300"
                      }`}
                    >
                      Add Liquidity
                    </button>
                  </div>
                </div>

                {/* Tab Content - Fixed Height Container */}
                <div className="flex-1 overflow-y-auto">
                  {activeTab === "trade" && (
                    <>
                      {/* Delta Values Display */}
                      <div className="mb-3">
                        <div className="mb-2">
                          <span
                            className={`text-xs font-semibold ${theme.textSecondary}`}
                          >
                            PROPOSED
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className={`${theme.textSecondary} text-xs`}>
                              Δμ
                            </span>
                            <span className="font-mono text-xs">
                              {(userMean - market.market_mean).toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${theme.textSecondary} text-xs`}>
                              Δσ
                            </span>
                            <span className="font-mono text-xs">
                              {(
                                userStdDev - market.market_standard_deviation
                              ).toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <hr className="border-t border-gray-500/20 mb-3" />

                      {/* Mean Slider */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold">
                            MEAN (M)
                          </label>
                          <span className="text-sm font-bold">
                            {userMean.toFixed(3)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={market.market_mean_min}
                          max={market.market_mean_max}
                          step="0.001"
                          value={userMean}
                          onChange={(e) => setUserMean(Number(e.target.value))}
                          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-600 slider-${color}`}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{market.market_mean_min.toFixed(3)}</span>
                          <span>{market.market_mean.toFixed(3)}</span>
                          <span>{market.market_mean_max.toFixed(3)}</span>
                        </div>{" "}
                      </div>

                      <hr className="border-t border-gray-500/20 mb-3" />

                      {/* Sigma Slider */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold">
                            SIGMA (σ)
                          </label>
                          <span className="text-sm font-bold">
                            {userStdDev.toFixed(3)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={market.market_standard_deviation_min}
                          max={market.market_standard_deviation_max}
                          step="0.001"
                          value={userStdDev}
                          onChange={(e) =>
                            setUserStdDev(Number(e.target.value))
                          }
                          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-600 slider-${color}`}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>
                            {market.market_standard_deviation_min.toFixed(3)}
                          </span>
                          <span>
                            {market.market_standard_deviation.toFixed(3)}
                          </span>
                          <span>
                            {market.market_standard_deviation_max.toFixed(3)}
                          </span>
                        </div>
                      </div>

                      <hr className="border-t border-gray-500/20 mb-3" />

                      {/* Collateral Required */}
                      <div className="mb-3">
                        <h3 className="text-xs font-semibold mb-2">
                          COLLATERAL REQUIRED
                        </h3>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className={`${theme.textSecondary} text-xs`}>
                              Trade Cost
                            </span>
                            <span className="font-mono text-xs">
                              {calculatedCost.toFixed(6)} APT
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${theme.textSecondary} text-xs`}>
                              Protocol Fee
                            </span>
                            <span className="font-mono text-xs">0.001 APT</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${theme.textSecondary} text-xs`}>
                              Gas Estimate
                            </span>
                            <span className="font-mono text-xs">0.001 APT</span>
                          </div>
                          <hr className="border-t border-gray-500/20 my-1.5" />
                          <div className="flex justify-between text-xs">
                            <span>Total Required</span>
                            <span className="font-mono text-sm font-bold">
                              {(calculatedCost + 0.002).toFixed(6)} APT
                            </span>
                          </div>
                        </div>
                      </div>

                      <hr className="border-t border-gray-500/20 mb-3" />

                      {/* Connect Wallet or Trade Button */}
                      {!connected ? (
                        <div className="wallet-selector-wrapper">
                          <div className="w-full [&>*]:w-full">
                            <WalletSelector />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleTrade}
                          disabled={isTrading}
                          className={`w-full px-3 py-2 rounded-lg ${theme.primaryBg} text-black text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isTrading ? "Trading..." : "Execute Trade"}
                        </button>
                      )}
                    </>
                  )}

                  {activeTab === "positions" && (
                    <div className="text-center py-8">
                      <div className={`${theme.textSecondary} text-sm`}>
                        Your positions are shown to the left.
                      </div>
                    </div>
                  )}

                  {activeTab === "liquidity" && (
                    <>
                      {!connected ? (
                        <div className="text-center py-8">
                          <div
                            className={`${theme.textSecondary} text-sm mb-4`}
                          >
                            Connect your wallet to add liquidity
                          </div>
                          <div className="wallet-selector-wrapper">
                            <div className="w-full [&>*]:w-full">
                              <WalletSelector />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* APT Amount Input */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-xs font-semibold">
                                AMOUNT (APT)
                              </label>
                              <span className="text-xs text-gray-500">
                                Balance:{" "}
                                {account?.address ? "12.45 APT" : "0.00 APT"}
                              </span>
                            </div>
                            <div className="relative">
                              <input
                                type="number"
                                value={aptAmount}
                                onChange={(e) => setAptAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                              />
                              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300">
                                MAX
                              </button>
                            </div>
                          </div>

                          <hr className="border-t border-gray-500/20 mb-4" />

                          {/* Slippage Tolerance */}
                          <div className="mb-4">
                            <label className="text-xs font-semibold mb-2 block">
                              SLIPPAGE TOLERANCE
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              {[0.1, 0.2, 0.5, 1].map((value) => (
                                <button
                                  key={value}
                                  onClick={() => setSlippageTolerance(value)}
                                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                    slippageTolerance === value
                                      ? `${theme.primaryBg} text-black`
                                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  }`}
                                >
                                  {value}%
                                </button>
                              ))}
                            </div>
                          </div>

                          <hr className="border-t border-gray-500/20 mb-4" />

                          {/* Liquidity Position Summary */}
                          <div className="mb-2">
                            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide">
                              POSITION SUMMARY
                            </h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span
                                  className={`${theme.textSecondary} text-xs`}
                                >
                                  Expected LP Shares
                                </span>
                                <span className="font-mono text-xs">
                                  {aptAmount ? (parseFloat(aptAmount) * 1e8).toLocaleString() : "0"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span
                                  className={`${theme.textSecondary} text-xs`}
                                >
                                  Pool Share
                                </span>
                                <span className="font-mono text-xs">
                                  {aptAmount && parseFloat(aptAmount) > 0
                                    ? (parseFloat(aptAmount) / 1 * 100).toFixed(4)
                                    : "0.0000"}
                                  %
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span
                                  className={`${theme.textSecondary} text-xs`}
                                >
                                  Current Pool Size
                                </span>
                                <span className="font-mono text-xs">
                                  1 APT
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span
                                  className={`${theme.textSecondary} text-xs`}
                                >
                                  Est. APY
                                </span>
                                <span className="font-mono text-xs text-green-400">
                                  4.7%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Add Liquidity Button */}
                          <button
                            onClick={handleAddLiquidity}
                            className={`w-full px-4 py-3 rounded-xl ${theme.primaryBg} text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={
                              !aptAmount ||
                              parseFloat(
                                aptAmount
                              ) <= 0 || isAddingLiquidity
                            }
                          >
                            {isAddingLiquidity ? 'Adding...' : 'Add Liquidity'}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Spacer */}
      <div className="h-20"></div>

      {/* AI Chat Sidebar */}
      <AIChatSidebar
        isOpen={isChatOpen}
        marketId={marketId || ""}
        aiContext={market?.aicontext || ""}
        onClose={() => setIsChatOpen(false)}
      />

      {/* AI Helper Button */}
      <AIHelperButton
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />
    </div>
  );
};

export default DemoMarketInstance;
