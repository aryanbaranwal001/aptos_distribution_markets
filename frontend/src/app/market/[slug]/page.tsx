'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { markets, Market } from '@/data/markets';
import MarketDetailSkeleton from '@/components/MarketDetailSkeleton';

const MarketDetailPage = () => {
  const params = useParams();
  const { color } = useThemeStore();
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iconSrc, setIconSrc] = useState('');
  const [hasError, setHasError] = useState(false);
  
  // Slider states
  const [mean, setMean] = useState(50);
  const [stdDev, setStdDev] = useState(15);
  
  // Graph interaction states
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [xAxisValue, setXAxisValue] = useState(50);
  const [probability, setProbability] = useState(0.5);
  const [cumulativeProbability, setCumulativeProbability] = useState(0.5);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = getThemeClasses(color);
  
  // Market-specific hardcoded values
  const marketData = {
    currentMean: 45,
    currentStdDev: 12,
    collateralRequired: 1250,
    maxPayout: 2500,
    tradingFee: 0.02,
    liquidityPool: 125000,
    marketId: market?.id || "Loading..."
  };

  useEffect(() => {
    if (params.slug) {
      // Find market by slug
      const foundMarket = markets.find(m => m.slug === params.slug);
      
      if (foundMarket) {
        setMarket(foundMarket);
        setIconSrc(`/icons/${foundMarket.iconName.replace('.svg', '.png')}`);
      }
      setIsLoading(false);
    }
  }, [params.slug]);

  const handleImageError = () => {
    if (!hasError && market) {
      setHasError(true);
      const svgSrc = iconSrc.replace('.png', '.svg');
      setIconSrc(svgSrc);
    }
  };

  // Normal distribution function
  const normalPDF = (x: number, mean: number, stdDev: number) => {
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
    return coefficient * Math.exp(exponent);
  };

  // Cumulative distribution function
  const normalCDF = (x: number, mean: number, stdDev: number) => {
    return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
  };

  // Error function approximation
  const erf = (x: number) => {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const canvasWidth = canvas.width;
    
    // Convert canvas x to data x (0-100 range)
    const dataX = (x / canvasWidth) * 100;
    setMouseX(x);
    setXAxisValue(Math.round(dataX));
    setProbability(normalPDF(dataX, mean, stdDev));
    setCumulativeProbability(normalCDF(dataX, mean, stdDev));
  };

  const handleCanvasMouseLeave = () => {
    setMouseX(null);
  };

  // Draw the normal distribution curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up drawing parameters
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Draw current market distribution (blue)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i <= graphWidth; i++) {
      const x = (i / graphWidth) * 100; // 0 to 100 range
      const y = normalPDF(x, marketData.currentMean, marketData.currentStdDev);
      const canvasX = padding + i;
      const canvasY = height - padding - (y * graphHeight * 100); // Scale for visibility
      
      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();

    // Draw proposed distribution (red)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i <= graphWidth; i++) {
      const x = (i / graphWidth) * 100; // 0 to 100 range
      const y = normalPDF(x, mean, stdDev);
      const canvasX = padding + i;
      const canvasY = height - padding - (y * graphHeight * 100); // Scale for visibility
      
      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();

    // Draw mouse hover dot if mouse is over canvas
    if (mouseX !== null) {
      const dataX = (mouseX / width) * 100;
      const y = normalPDF(dataX, mean, stdDev);
      const canvasY = height - padding - (y * graphHeight * 100);
      
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(mouseX, canvasY, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Add labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis labels
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * graphWidth;
      const value = i * 10;
      ctx.fillText(value.toString(), x, height - padding + 20);
    }

    // Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Current Market', padding, 20);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Proposed', padding + 120, 20);

  }, [mean, stdDev, mouseX, marketData.currentMean, marketData.currentStdDev]);

  // Show loading skeleton while loading or if market not found
  if (isLoading || !market) {
    return <MarketDetailSkeleton />;
  }

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/" className={`${theme.textSecondary} hover:${theme.primary} mr-4`}>
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center">
            <div className="w-8 h-8 mr-3 relative">
              {iconSrc && !hasError ? (
                <Image
                  src={iconSrc}
                  alt={market.title}
                  fill
                  className="rounded-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className={`w-full h-full rounded-full ${theme.cardBg} flex items-center justify-center text-xs font-bold`}>
                  {market.title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold break-words">{market.title}</h1>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Graph and Stats */}
          <div className="xl:col-span-2 space-y-6">
            {/* Graph Stats Display */}
            <div className={`p-4 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-500">X-Axis Value</div>
                  <div className="text-xl font-bold">{xAxisValue}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Probability</div>
                  <div className="text-xl font-bold">{probability.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Cumulative</div>
                  <div className="text-xl font-bold">{cumulativeProbability.toFixed(4)}</div>
                </div>
              </div>
            </div>

            {/* Graph */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Current Market Distribution</h3>
              <div className="relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={300}
                  className="w-full max-w-full border rounded cursor-crosshair"
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={handleCanvasMouseLeave}
                />
              </div>
            </div>

            {/* Proposed vs Current */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Proposed vs Current</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Current Market</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={theme.textSecondary}>Mean:</span>
                      <span>{marketData.currentMean}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme.textSecondary}>Std Dev:</span>
                      <span>{marketData.currentStdDev}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Proposed</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={theme.textSecondary}>Mean:</span>
                      <span className="flex items-center">
                        {mean}
                        <span className={`ml-2 text-sm ${
                          mean - marketData.currentMean > 0 ? 'text-green-500' : mean - marketData.currentMean < 0 ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          ({mean - marketData.currentMean > 0 ? '+' : ''}{mean - marketData.currentMean})
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme.textSecondary}>Std Dev:</span>
                      <span className="flex items-center">
                        {stdDev}
                        <span className={`ml-2 text-sm ${
                          stdDev - marketData.currentStdDev > 0 ? 'text-green-500' : stdDev - marketData.currentStdDev < 0 ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          ({stdDev - marketData.currentStdDev > 0 ? '+' : ''}{stdDev - marketData.currentStdDev})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Information */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Market Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Market ID:</span>
                    <span>#{marketData.marketId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Liquidity Pool:</span>
                    <span>${marketData.liquidityPool.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Created:</span>
                    <span>Nov 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textSecondary}>Resolution:</span>
                    <span>Dec 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="xl:col-span-1 space-y-6">
            {/* Mean Slider */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <label className="text-lg font-semibold">MEAN (M): {mean}</label>
                <div className="text-sm text-gray-500">Min: 0 | Max: 100</div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mean}
                onChange={(e) => setMean(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Std Dev Slider */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <label className="text-lg font-semibold">STD DEV: {stdDev}</label>
                <div className="text-sm text-gray-500">Min: 1 | Max: 30</div>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={stdDev}
                onChange={(e) => setStdDev(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Collateral Required */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-lg font-semibold mb-4">Collateral Required</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Amount:</span>
                  <span className="font-semibold">${marketData.collateralRequired}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Max Payout:</span>
                  <span className="font-semibold">${marketData.maxPayout}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Trading Fee:</span>
                  <span className="font-semibold">{(marketData.tradingFee * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className={`w-full py-3 px-4 rounded-lg ${theme.primaryBg} text-black font-semibold hover:opacity-90 transition-opacity`}>
                Trade
              </button>
              <button className={`w-full py-3 px-4 rounded-lg border ${theme.border} ${theme.text} font-semibold hover:${theme.hoverBg} transition-colors`}>
                Positions
              </button>
              <button className={`w-full py-3 px-4 rounded-lg border ${theme.border} ${theme.text} font-semibold hover:${theme.hoverBg} transition-colors`}>
                Add Liquidity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetailPage;
