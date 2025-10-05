// Import Aptos SDK from locally installed package following MCP guidance
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Contract constants - hardcoded values from your CLI command
const CONTRACT_ADDRESS = "0x3b0c1f2a3f9f281f3a654afd1cc07dfcdfa8facee967b196cc77cdd20b98c829";
const MARKET_ADDRESS = "0x305f65ce0586f4cf101774497acacf98d041022ddbd9906ba8428bcc9637d9ef";

// Trade parameters - exact values from your CLI command
const TRADE_PARAMS = {
    marketAddress: MARKET_ADDRESS,
    mean: "500000000000000000",
    stdDev: "800000000000000000",
    meanIsNegative: false,
    tradeCost: "20000000",
    optimalX: "563256000000000000"
};

// Initialize Aptos client following MCP guidance
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Wallet state
let currentWallet = null;
let currentAccount = null;

// DOM elements
const connectWalletBtn = document.getElementById('connectWalletBtn');
const executeTradeBtn = document.getElementById('executeTradeBtn');
const statusDiv = document.getElementById('statusDiv');
const walletInfo = document.getElementById('walletInfo');
const walletStatus = document.getElementById('walletStatus');

// Utility function to show status messages
function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Update wallet UI state
function updateWalletUI() {
    if (currentAccount) {
        walletStatus.textContent = `Connected: ${currentAccount.address.slice(0, 8)}...${currentAccount.address.slice(-6)}`;
        walletInfo.style.display = 'block';
        connectWalletBtn.textContent = 'Wallet Connected';
        connectWalletBtn.disabled = true;
        executeTradeBtn.disabled = false;
    } else {
        walletStatus.textContent = 'Not connected';
        walletInfo.style.display = 'block';
        connectWalletBtn.textContent = 'Connect Wallet';
        connectWalletBtn.disabled = false;
        executeTradeBtn.disabled = true;
    }
}

// Connect wallet function following MCP guidance
async function connectWallet() {
    try {
        showStatus('Connecting to wallet...', 'info');
        
        // Check if Petra wallet is available
        if (typeof window.aptos === 'undefined') {
            throw new Error('Petra wallet not found. Please install Petra wallet extension.');
        }

        // Connect to wallet following MCP pattern
        const response = await window.aptos.connect();
        currentAccount = response;
        currentWallet = window.aptos;
        
        updateWalletUI();
        showStatus('Wallet connected successfully!', 'success');
        
        console.log('Connected account:', currentAccount);
        
    } catch (error) {
        console.error('Wallet connection failed:', error);
        showStatus(`Failed to connect wallet: ${error.message}`, 'error');
        currentWallet = null;
        currentAccount = null;
        updateWalletUI();
    }
}

// Execute trade function following MCP guidance for transaction signing
async function executeTrade() {
    if (!currentAccount || !currentWallet) {
        showStatus('Please connect your wallet first', 'error');
        return;
    }

    try {
        executeTradeBtn.disabled = true;
        executeTradeBtn.textContent = 'Executing...';
        
        showStatus('Preparing transaction...', 'info');

        // Create the transaction payload in the new format
        const transaction = {
            type: 'entry_function_payload',
            function: `${CONTRACT_ADDRESS}::distribution_markets::trade_with_apt`,
            type_arguments: [],
            arguments: [
                TRADE_PARAMS.marketAddress,
                TRADE_PARAMS.mean,
                TRADE_PARAMS.stdDev,
                TRADE_PARAMS.meanIsNegative,
                TRADE_PARAMS.tradeCost,
                TRADE_PARAMS.optimalX
            ]
        };

        console.log('Transaction payload:', transaction);
        
        showStatus('Please approve the transaction in your wallet...', 'info');

        // Sign and submit the transaction using the new API format
        const response = await currentWallet.signAndSubmitTransaction(transaction);
        
        console.log('Transaction response:', response);
        
        showStatus('Transaction submitted! Waiting for confirmation...', 'info');
        
        // Wait for transaction confirmation following MCP guidance
        try {
            await aptos.waitForTransaction({ transactionHash: response.hash });
            showStatus('Trade executed successfully!', 'success');
            
            // Display transaction hash
            const hashDiv = document.createElement('div');
            hashDiv.className = 'transaction-hash';
            hashDiv.innerHTML = `<strong>Transaction Hash:</strong><br>${response.hash}`;
            statusDiv.appendChild(hashDiv);
            
        } catch (waitError) {
            console.error('Transaction wait error:', waitError);
            showStatus(`Transaction submitted but confirmation failed: ${waitError.message}`, 'error');
        }

    } catch (error) {
        console.error('Trade execution failed:', error);
        showStatus(`Trade execution failed: ${error.message}`, 'error');
    } finally {
        executeTradeBtn.disabled = false;
        executeTradeBtn.textContent = 'Execute Trade';
    }
}

// Event listeners
connectWalletBtn.addEventListener('click', connectWallet);
executeTradeBtn.addEventListener('click', executeTrade);

// Initialize app
function initializeApp() {
    updateWalletUI();
    showStatus('App initialized. Connect your wallet to start trading.', 'info');
    
    // Check if wallet is already connected on page load
    if (typeof window.aptos !== 'undefined') {
        window.aptos.account()
            .then(account => {
                if (account) {
                    currentAccount = account;
                    currentWallet = window.aptos;
                    updateWalletUI();
                    showStatus('Wallet already connected', 'success');
                }
            })
            .catch(() => {
                // Wallet not connected, which is fine
                console.log('Wallet not previously connected');
            });
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}