# Distribution Markets - Market Initialization Test

This directory contains a comprehensive test suite for verifying the market initialization functionality of the Distribution Markets smart contract on Aptos.

## Files

- `test_market_init.js` - Main test script for market initialization verification
- `package.json` - Node.js dependencies and test scripts
- `contracts/` - Smart contract source code

## Test Coverage

The test script verifies all aspects of market initialization:

### ✅ Balance Verification
- Checks account balance before market creation
- Calculates expected balance decrease (1 APT + gas fees)

### ✅ Market State Validation
- Admin assignment
- Initial backing amount (1 APT = 100,000,000 octas)
- Protocol invariant K (1.0 × 10^18)
- Total collateral and LP shares
- Market active/resolved status

### ✅ Treasury Management
- Resource account creation with seed "market_treasury"
- Treasury receives initial backing (1 APT)
- SignerCapability for market control

### ✅ LP Shares Distribution
- Initial LP receives shares equal to backing amount
- 1:1 ratio (1 share = 1 octa backing)
- Timestamp tracking

### ✅ Initial Position Creation
- Position parameters match AMM holdings
- Zero collateral for initial LP
- Lambda calculations for distribution scaling

### ✅ Mathematical Validations
- Standard deviation constraints
- AMM invariant maintenance
- Fixed-point arithmetic precision (18 decimals)

## Running the Test

```bash
# Install dependencies
npm install

# Run market initialization test
npm run test:init
```

## Test Parameters

- **Initial Backing**: 1 APT (100,000,000 octas)
- **Distribution**: Normal(μ=0, σ=1.0, negative=false)
- **Initial LP**: 0x123 (test address)
- **Network**: Aptos Testnet
- **Contract**: 0x9b783241eb139a9dae6abeb3114f7f97a9d928eeda91cd2790f0c62aa324e04d

## Expected Output

The test provides comprehensive verification of:
1. Current account balance
2. Expected market state after creation
3. Treasury account details
4. LP shares distribution
5. Initial position calculations
6. Mathematical validations
7. Resource account creation details

## Smart Contract Functions Tested

- `initialize_market()` - Core market creation function
- Treasury management via resource accounts
- LP share allocation
- Initial position creation
- Event emission verification

This test framework serves as both documentation and validation for the Distribution Markets initialization process.
