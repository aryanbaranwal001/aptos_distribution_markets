const { Aptos, AptosConfig, Network, Ed25519PrivateKey, Account } = require("@aptos-labs/ts-sdk");

const NETWORK = Network.TESTNET;
const MODULE_ADDRESS = "0x9b783241eb139a9dae6abeb3114f7f97a9d928eeda91cd2790f0c62aa324e04d";

async function findMarketAddress() {
    console.log("🔍 Finding Market Address from Transaction...");
    
    try {
        const config = new AptosConfig({ network: NETWORK });
        const aptos = new Aptos(config);

        // Get the transaction details
        const txHash = "0x62975b0cba3cac03f4d6da312ee6fd98fa46051d11e86e4856ed3cb9d2ac537e";
        
        console.log(`📋 Transaction Hash: ${txHash}`);
        
        const transaction = await aptos.getTransactionByHash({ transactionHash: txHash });
        
        console.log("📊 Transaction Details:");
        console.log(`   Success: ${transaction.success}`);
        console.log(`   Gas Used: ${transaction.gas_used}`);
        console.log(`   Sender: ${transaction.sender}`);
        
        // Look for events
        if (transaction.events) {
            console.log("\n🎯 Events Found:");
            for (let i = 0; i < transaction.events.length; i++) {
                const event = transaction.events[i];
                console.log(`\n   Event ${i + 1}:`);
                console.log(`   Type: ${event.type}`);
                console.log(`   Data:`, JSON.stringify(event.data, null, 4));
                
                // Look for MarketInitialized event
                if (event.type.includes("MarketInitialized")) {
                    const marketAddress = event.data.market_address;
                    console.log(`\n🎉 FOUND MARKET ADDRESS: ${marketAddress}`);
                    
                    // Test the market by querying its state
                    await testMarketQueries(aptos, marketAddress);
                    return marketAddress;
                }
            }
        }
        
        // If no events found, look in changes
        if (transaction.changes) {
            console.log("\n📝 Changes Found:");
            for (let i = 0; i < transaction.changes.length; i++) {
                const change = transaction.changes[i];
                console.log(`\n   Change ${i + 1}:`);
                console.log(`   Type: ${change.type}`);
                console.log(`   Address: ${change.address}`);
                
                if (change.type === "write_resource" && change.data && change.data.type) {
                    if (change.data.type.includes("distribution_markets::Market")) {
                        console.log(`\n🎉 FOUND MARKET ADDRESS: ${change.address}`);
                        await testMarketQueries(aptos, change.address);
                        return change.address;
                    }
                }
            }
        }
        
        console.log("❌ Market address not found in transaction details");
        
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

async function testMarketQueries(aptos, marketAddress) {
    console.log(`\n🧪 Testing Market Queries for: ${marketAddress}`);
    
    try {
        // Test 1: Check if market is active
        const isActive = await aptos.view({
            function: `${MODULE_ADDRESS}::distribution_markets::market_is_active`,
            functionArguments: [marketAddress],
        });
        console.log(`   ✅ Market Active: ${isActive[0]}`);
        
        // Test 2: Check if market is resolved
        const isResolved = await aptos.view({
            function: `${MODULE_ADDRESS}::distribution_markets::market_is_resolved`,
            functionArguments: [marketAddress],
        });
        console.log(`   ✅ Market Resolved: ${isResolved[0]}`);
        
        // Test 3: Get total LP shares
        const totalShares = await aptos.view({
            function: `${MODULE_ADDRESS}::distribution_markets::get_total_lp_shares`,
            functionArguments: [marketAddress],
        });
        console.log(`   ✅ Total LP Shares: ${totalShares[0]} (${totalShares[0] / 100000000} APT)`);
        
        // Test 4: Get LP share balance for initial LP (0x123)
        const lpBalance = await aptos.view({
            function: `${MODULE_ADDRESS}::distribution_markets::get_lp_share_balance`,
            functionArguments: ["0x123", marketAddress],
        });
        console.log(`   ✅ LP Balance (0x123): ${lpBalance[0]} shares`);
        
        // Test 5: Get market state
        const marketState = await aptos.view({
            function: `${MODULE_ADDRESS}::distribution_markets::get_market_state`,
            functionArguments: [marketAddress],
        });
        console.log(`   ✅ Market State:`, marketState[0]);
        
        console.log("\n🎉 All Market Queries Successful!");
        
    } catch (error) {
        console.error("❌ Market query failed:", error);
    }
}

// Run the finder
findMarketAddress().catch(console.error);
