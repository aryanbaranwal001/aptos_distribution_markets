// Import Aptos SDK from locally installed package following MCP guidance
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Contract constants - hardcoded values from your CLI command
const CONTRACT_ADDRESS =
	"0x3b0c1f2a3f9f281f3a654afd1cc07dfcdfa8facee967b196cc77cdd20b98c829";
const MARKET_ADDRESS =
	"0x305f65ce0586f4cf101774497acacf98d041022ddbd9906ba8428bcc9637d9ef";

// Liquidity parameters are now calculated inside the addLiquidity function

// Trade parameters - exact values from your CLI command
const TRADE_PARAMS = {
	marketAddress: MARKET_ADDRESS,
	mean: "500000000000000000",
	stdDev: "800000000000000000",
	meanIsNegative: false,
	tradeCost: "20000000",
	optimalX: "563256000000000000",
};

// Initialize Aptos client following MCP guidance
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Wallet state
let currentWallet = null;
let currentAccount = null;

// DOM elements
const connectWalletBtn = document.getElementById("connectWalletBtn");
const executeTradeBtn = document.getElementById("executeTradeBtn");
const statusDiv = document.getElementById("statusDiv");
const walletInfo = document.getElementById("walletInfo");
const walletStatus = document.getElementById("walletStatus");

// Dynamically added buttons
let fetchMarketStateBtn;
let fetchMarketParamsBtn;
let fetchPositionsBtn;
let fetchMinStdDevBtn;
let addLiquidityBtn;

// Utility function to show status messages
function showStatus(message, type = "info") {
	statusDiv.textContent = message;
	statusDiv.className = `status ${type}`;
	statusDiv.style.display = "block";
	console.log(`[${type.toUpperCase()}] ${message}`);
}

// Append JSON result below status
function showJsonResult(title, obj) {
	const pre = document.createElement("pre");
	pre.className = "transaction-hash";
	pre.textContent = `${title}:
${JSON.stringify(obj, null, 2)}`;
	statusDiv.appendChild(pre);
}

// Update wallet UI state
function updateWalletUI() {
	if (currentAccount) {
		walletStatus.textContent = `Connected: ${currentAccount.address.slice(
			0,
			8
		)}...${currentAccount.address.slice(-6)}`;
		walletInfo.style.display = "block";
		connectWalletBtn.textContent = "Wallet Connected";
		connectWalletBtn.disabled = true;
		executeTradeBtn.disabled = false;
		if (addLiquidityBtn) addLiquidityBtn.disabled = false;
	} else {
		walletStatus.textContent = "Not connected";
		walletInfo.style.display = "block";
		connectWalletBtn.textContent = "Connect Wallet";
		connectWalletBtn.disabled = false;
		executeTradeBtn.disabled = true;
		if (addLiquidityBtn) addLiquidityBtn.disabled = true;
	}
}

// Connect wallet function following MCP guidance
async function connectWallet() {
	try {
		showStatus("Connecting to wallet...", "info");

		// Check if Petra wallet is available
		if (typeof window.aptos === "undefined") {
			throw new Error(
				"Petra wallet not found. Please install Petra wallet extension."
			);
		}

		// Connect to wallet following MCP pattern
		const response = await window.aptos.connect();
		currentAccount = response;
		currentWallet = window.aptos;

		updateWalletUI();
		showStatus("Wallet connected successfully!", "success");

		console.log("Connected account:", currentAccount);
	} catch (error) {
		console.error("Wallet connection failed:", error);
		showStatus(`Failed to connect wallet: ${error.message}`, "error");
		currentWallet = null;
		currentAccount = null;
		updateWalletUI();
	}
}

// Execute trade function following MCP guidance for transaction signing
async function executeTrade() {
	if (!currentAccount || !currentWallet) {
		showStatus("Please connect your wallet first", "error");
		return;
	}

	try {
		executeTradeBtn.disabled = true;
		executeTradeBtn.textContent = "Executing...";

		showStatus("Preparing transaction...", "info");

		// Create the transaction payload in the new format
		const transaction = {
			type: "entry_function_payload",
			function: `${CONTRACT_ADDRESS}::distribution_markets::trade_with_apt`,
			type_arguments: [],
			arguments: [
				TRADE_PARAMS.marketAddress,
				TRADE_PARAMS.mean,
				TRADE_PARAMS.stdDev,
				TRADE_PARAMS.meanIsNegative,
				TRADE_PARAMS.tradeCost,
				TRADE_PARAMS.optimalX,
			],
		};

		console.log("Transaction payload:", transaction);

		showStatus("Please approve the transaction in your wallet...", "info");

		// Sign and submit the transaction using the new API format
		const response = await currentWallet.signAndSubmitTransaction(
			transaction
		);

		console.log("Transaction response:", response);

		showStatus(
			"Transaction submitted! Waiting for confirmation...",
			"info"
		);

		// Wait for transaction confirmation following MCP guidance
		try {
			await aptos.waitForTransaction({ transactionHash: response.hash });
			showStatus("Trade executed successfully!", "success");

			// Display transaction hash
			const hashDiv = document.createElement("div");
			hashDiv.className = "transaction-hash";
			hashDiv.innerHTML = `<strong>Transaction Hash:</strong><br>${response.hash}`;
			statusDiv.appendChild(hashDiv);
		} catch (waitError) {
			console.error("Transaction wait error:", waitError);
			showStatus(
				`Transaction submitted but confirmation failed: ${waitError.message}`,
				"error"
			);
		}
	} catch (error) {
		console.error("Trade execution failed:", error);
		showStatus(`Trade execution failed: ${error.message}`, "error");
	} finally {
		executeTradeBtn.disabled = false;
		executeTradeBtn.textContent = "Execute Trade";
	}
}

// Execute add liquidity function
async function addLiquidity() {
	if (!currentAccount || !currentWallet) {
		showStatus("Please connect your wallet first", "error");
		return;
	}

	try {
		addLiquidityBtn.disabled = true;
		addLiquidityBtn.textContent = "Adding Liquidity...";

		showStatus("Preparing transaction...", "info");

		// These values would be dynamic in a real application
		const aptAmountToAdd = 1; // Example: 1 APT
		const poolSize = 1; // As per instruction

		// y = (amount of APT / pool size) * 10^18
		const y = BigInt(Math.floor((aptAmountToAdd / poolSize) * 1e18));
		// apt_amount = amount * 10^8
		const aptAmountOctas = BigInt(Math.floor(aptAmountToAdd * 1e8));


		// Create the transaction payload
		const transaction = {
			type: "entry_function_payload",
			function: `${CONTRACT_ADDRESS}::distribution_markets::add_liquidity_with_apt`,
			type_arguments: [],
			arguments: [
				MARKET_ADDRESS,
				y.toString(),
				aptAmountOctas.toString(),
			],
		};

		console.log("Transaction payload:", transaction);

		showStatus("Please approve the transaction in your wallet...", "info");

		// Sign and submit the transaction
		const response = await currentWallet.signAndSubmitTransaction(
			transaction
		);

		console.log("Transaction response:", response);

		showStatus(
			"Transaction submitted! Waiting for confirmation...",
			"info"
		);

		// Wait for transaction confirmation
		try {
			await aptos.waitForTransaction({ transactionHash: response.hash });
			showStatus("Liquidity added successfully!", "success");

			// Display transaction hash
			const hashDiv = document.createElement("div");
			hashDiv.className = "transaction-hash";
			hashDiv.innerHTML = `<strong>Transaction Hash:</strong><br>${response.hash}`;
			statusDiv.appendChild(hashDiv);
		} catch (waitError) {
			console.error("Transaction wait error:", waitError);
			showStatus(
				`Transaction submitted but confirmation failed: ${waitError.message}`,
				"error"
			);
		}
	} catch (error) {
		console.error("Add liquidity failed:", error);
		showStatus(`Add liquidity failed: ${error.message}`, "error");
	} finally {
		addLiquidityBtn.disabled = false;
		addLiquidityBtn.textContent = "Add Liquidity";
	}
}

// View call helper
async function callView(functionName, args = []) {
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

// Fetch market state
async function fetchMarketState() {
	try {
		showStatus("Fetching market state...", "info");
		const result = await callView("get_market_state", [MARKET_ADDRESS]);
		showStatus("Fetched market state", "success");
		showJsonResult("Market State", result);
	} catch (e) {
		showStatus(`Failed to fetch market state: ${e.message}`, "error");
	}
}

// Fetch market params (use get_amm_holdings as the current market params)
async function fetchMarketParams() {
	try {
		showStatus("Fetching market params...", "info");
		const result = await callView("get_amm_holdings", [MARKET_ADDRESS]);
		showStatus("Fetched market params", "success");
		showJsonResult("Market Params (amm_holdings)", result);
	} catch (e) {
		showStatus(`Failed to fetch market params: ${e.message}`, "error");
	}
}

// Fetch positions for connected address
async function fetchPositions() {
	try {
		if (!currentAccount) {
			throw new Error("Connect wallet first");
		}
		showStatus("Fetching positions for connected address...", "info");
		const trader = currentAccount.address;
		// Use the detailed list view to get multiple fields
		const result = await callView("get_all_trader_positions", [
			trader,
			MARKET_ADDRESS,
		]);
		showStatus("Fetched positions", "success");
		showJsonResult("Positions (all_trader_positions)", result);
	} catch (e) {
		showStatus(`Failed to fetch positions: ${e.message}`, "error");
	}
}

// Fetch minimum standard deviation
async function fetchMinStdDev() {
	try {
		showStatus("Fetching minimum standard deviation...", "info");
		const result = await callView("get_min_standard_deviation", [
			MARKET_ADDRESS,
		]);
		showStatus("Fetched minimum standard deviation", "success");
		showJsonResult("Min Standard Deviation", result);
	} catch (e) {
		showStatus(`Failed to fetch min std dev: ${e.message}`, "error");
	}
}

// Event listeners
connectWalletBtn.addEventListener("click", connectWallet);
executeTradeBtn.addEventListener("click", executeTrade);

// Initialize app
function initializeApp() {
	updateWalletUI();
	showStatus(
		"App initialized. Connect your wallet to start trading.",
		"info"
	);

	// Check if wallet is already connected on page load
	if (typeof window.aptos !== "undefined") {
		window.aptos
			.account()
			.then((account) => {
				if (account) {
					currentAccount = account;
					currentWallet = window.aptos;
					updateWalletUI();
					showStatus("Wallet already connected", "success");
				}
			})
			.catch(() => {
				// Wallet not connected, which is fine
				console.log("Wallet not previously connected");
			});
	}
	// Create and insert fetch buttons
	const container = document.querySelector(".container");
	const btnWrap = document.createElement("div");
	btnWrap.style.marginTop = "16px";

	fetchMarketStateBtn = document.createElement("button");
	fetchMarketStateBtn.textContent = "Fetch Market State";
	fetchMarketStateBtn.addEventListener("click", fetchMarketState);

	fetchMarketParamsBtn = document.createElement("button");
	fetchMarketParamsBtn.textContent = "Fetch Market Params";
	fetchMarketParamsBtn.addEventListener("click", fetchMarketParams);

	fetchPositionsBtn = document.createElement("button");
	fetchPositionsBtn.textContent = "Fetch My Positions";
	fetchPositionsBtn.addEventListener("click", fetchPositions);

	fetchMinStdDevBtn = document.createElement("button");
	fetchMinStdDevBtn.textContent = "Fetch Min Std Dev";
	fetchMinStdDevBtn.addEventListener("click", fetchMinStdDev);

	addLiquidityBtn = document.createElement("button");
	addLiquidityBtn.textContent = "Add Liquidity";
	addLiquidityBtn.disabled = true;
	addLiquidityBtn.addEventListener("click", addLiquidity);

	btnWrap.appendChild(fetchMarketStateBtn);
	btnWrap.appendChild(fetchMarketParamsBtn);
	btnWrap.appendChild(fetchPositionsBtn);
	btnWrap.appendChild(fetchMinStdDevBtn);
	btnWrap.appendChild(addLiquidityBtn);
	container.appendChild(btnWrap);
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initializeApp);
} else {
	initializeApp();
}
