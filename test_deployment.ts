import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  Ed25519PrivateKey,
  InputTransactionData,
} from "@aptos-labs/ts-sdk";

// Configuration
const NETWORK = Network.TESTNET;
const CONTRACT_ADDRESS = "0x9b783241eb139a9dae6abeb3114f7f97a9d928eeda91cd2790f0c62aa324e04d";
const ADMIN_PRIVATE_KEY = "0x3bf2e0988632e0395e1370a7b9dfb23f74176dae959fd2a6868357f9e3257794";

// Initialize Aptos client
const aptos = new Aptos(new AptosConfig({ network: NETWORK }));

// Create admin account from private key
const adminAccount = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(ADMIN_PRIVATE_KEY),
});

console.log("Admin Account:", adminAccount.accountAddress.toString());
console.log("Contract Address:", CONTRACT_ADDRESS);

async function testDeployedContract() {
  try {
    console.log("\n=== Testing Deployed Distribution Markets Contract ===\n");

    // Step 1: Check account balance
    console.log("1. Checking admin account balance...");
    const balance = await aptos.getAccountAPTAmount({
      accountAddress: adminAccount.accountAddress,
    });
    console.log(`Admin APT Balance: ${balance / 100000000} APT`);

    // Step 2: Create a test fungible asset for collateral
    console.log("\n2. Creating test fungible asset...");
    
    const createFATransaction: InputTransactionData = {
      data: {
        function: "0x1::primary_fungible_store::create_primary_store_enabled_fungible_asset",
        typeArguments: [],
        functionArguments: [
          "Test Distribution Token", // name
          "TDT", // symbol
          8, // decimals
          "", // icon_uri
          "", // project_uri
        ],
      },
    };

    const createFAResponse = await aptos.signAndSubmitTransaction({
      signer: adminAccount,
      transaction: createFATransaction,
    });

    await aptos.waitForTransaction({ transactionHash: createFAResponse.hash });
    console.log(`Test FA created: ${createFAResponse.hash}`);

    // Get the metadata address from the transaction
    const txnDetails = await aptos.getTransactionByHash({ transactionHash: createFAResponse.hash });
    console.log("Transaction details:", JSON.stringify(txnDetails, null, 2));

    // Step 3: Test view functions
    console.log("\n3. Testing view functions...");
    
    // Test protocol invariant
    const protocolInvariant = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::distribution_markets::get_protocol_invariant`,
        typeArguments: [],
        functionArguments: [],
      },
    });
    console.log("Protocol Invariant K:", protocolInvariant[0]);

    console.log("\n✅ Basic deployment tests completed successfully!");
    console.log("\nNext steps:");
    console.log("- Create a fungible asset for collateral");
    console.log("- Initialize a distribution market");
    console.log("- Test trading functionality");
    console.log("- Test liquidity provision");

  } catch (error) {
    console.error("❌ Error testing deployed contract:", error);
  }
}

// Run the test
testDeployedContract();
