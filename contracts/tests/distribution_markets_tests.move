#[test_only]
module distribution_markets::distribution_markets_tests {
    use std::signer;
    use std::vector;
    use std::option;
    use aptos_std::table;
    use aptos_framework::object;
    use aptos_framework::fungible_asset::{Self, Metadata, FungibleAsset, MintRef};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use distribution_markets::distribution_markets::{Self};
    use distribution_markets::math_utils;

    // Test constants
    const INITIAL_BACKING: u64 = 1000000; // 1 million units
    const TEST_AMOUNT: u64 = 100000; // 100k units
    const PRECISION: u128 = 1000000000000000000; // 18 decimals

    // Helper function to create test accounts
    fun create_test_accounts(): (signer, signer, signer, signer) {
        let admin = account::create_account_for_test(@0x1);
        let lp = account::create_account_for_test(@0x2);
        let trader1 = account::create_account_for_test(@0x3);
        let trader2 = account::create_account_for_test(@0x4);
        (admin, lp, trader1, trader2)
    }

    // Helper function to create test normal distribution parameters
    fun create_test_normal_params(): distribution_markets::NormalParams {
        distribution_markets::make_normal_params(
            5000000000000000000, // 5.0 in fixed point
            1000000000000000000, // 1.0 in fixed point
            false,
        )
    }

    // Helper function to create a mock fungible asset metadata and mint ref
    fun create_mock_fa_metadata(creator: &signer): (Object<Metadata>, MintRef) {
        let constructor_ref = object::create_named_object(creator, b"test_token");
        fungible_asset::create_fungible_asset(
            &constructor_ref,
            option::some(1000000000), // max supply
            b"Test Token",
            b"TT",
            8,
            b"",
            b"",
        );
        let metadata_obj = object::object_from_constructor_ref<Metadata>(&constructor_ref);
        let mint_ref = fungible_asset::generate_mint_ref(&constructor_ref);
        (metadata_obj, mint_ref)
    }

    // Helper function to mint test fungible assets
    fun mint_test_fa(mint_ref: &MintRef, _to: address, amount: u64): FungibleAsset {
        fungible_asset::mint(mint_ref, amount)
    }

    #[test]
    /// Test market initialization
    fun test_initialize_market() {
        let (admin, lp, _trader1, _trader2) = create_test_accounts();
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let (fa_metadata, _mint_ref) = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Verify market was created
        assert!(distribution_markets::market_is_active(market_addr), 1);
        assert!(!distribution_markets::market_is_resolved(market_addr), 2);

        // Verify initial LP shares
        let lp_shares = distribution_markets::get_lp_share_balance(
            signer::address_of(&lp), 
            market_addr
        );
        assert!(lp_shares == INITIAL_BACKING, 3);

        let total_shares = distribution_markets::get_total_lp_shares(market_addr);
        assert!(total_shares == INITIAL_BACKING, 4);
    }

    #[test]
    /// Test position minting
    fun test_mint_position() {
        let (admin, lp, trader1, _trader2) = create_test_accounts();
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let (fa_metadata, mint_ref) = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Mint collateral for trader
        let collateral = mint_test_fa(&mint_ref, signer::address_of(&trader1), TEST_AMOUNT);

        // Mint position
        let position = distribution_markets::mint(
            &trader1,
            market_addr,
            TEST_AMOUNT,
            collateral,
        );

        // Verify position was created
        assert!(distribution_markets::position_collateral_ref(&position) == TEST_AMOUNT, 1);
        assert!(distribution_markets::position_mean(&position) == distribution_markets::normal_mean(&initial_params), 2);
        assert!(distribution_markets::position_std_dev(&position) == distribution_markets::normal_std_dev(&initial_params), 3);

        // Verify trader has the position
        let trader_positions = distribution_markets::get_trader_position_page(
            signer::address_of(&trader1),
            market_addr,
            0,
            10,
        );
        assert!(vector::length(&trader_positions) == 1, 4);
    }

    #[test]
    /// Test position redemption
    fun test_redeem_position() {
        let (admin, lp, trader1, _trader2) = create_test_accounts();
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let (fa_metadata, mint_ref) = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Mint collateral and position
        let collateral = mint_test_fa(&mint_ref, signer::address_of(&trader1), TEST_AMOUNT);
        distribution_markets::mint(&trader1, market_addr, TEST_AMOUNT, collateral);

        // Redeem position
        let refund = distribution_markets::redeem(&trader1, market_addr, 0);

        // Verify refund amount
        assert!(refund == TEST_AMOUNT, 1);

        // Verify trader has no positions left
        let trader_positions = distribution_markets::get_trader_position_page(
            signer::address_of(&trader1),
            market_addr,
            0,
            10,
        );
        assert!(vector::length(&trader_positions) == 0, 2);
    }

    #[test]
    /// Test trading functionality
    fun test_trade_move_to() {
        let (admin, lp, trader1, _trader2) = create_test_accounts();
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let fa_metadata = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Create target parameters (different from initial)
        let target_params = distribution_markets::make_normal_params(
            6000000000000000000, // 6.0
            1500000000000000000, // 1.5
            false,
        );

        // Quote the trade cost
        let trade_cost = distribution_markets::quote_trade(
            initial_params,
            target_params,
            market_addr,
        );

        // Mint collateral for trade
        let collateral = mint_test_fa(&mint_ref, signer::address_of(&trader1), trade_cost);

        // Execute trade
        distribution_markets::trade_move_to(
            &trader1,
            market_addr,
            target_params,
            collateral,
        );

        // Verify trade was executed (market state should be updated)
        // In a complete implementation, we would verify the AMM holdings changed
    }

    #[test]
    /// Test liquidity provision
    fun test_add_remove_liquidity() {
        let (admin, lp, trader1, _trader2) = create_test_accounts();
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let fa_metadata = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Add liquidity
        let liquidity_amount = TEST_AMOUNT;
        let collateral = mint_test_fa(&mint_ref, signer::address_of(&trader1), liquidity_amount);
        
        distribution_markets::add_liquidity(
            &trader1,
            market_addr,
            liquidity_amount,
            collateral,
        );

        // Verify LP shares were minted
        let trader_shares = distribution_markets::get_lp_share_balance(
            signer::address_of(&trader1),
            market_addr,
        );
        assert!(trader_shares > 0, 1);

        let total_shares_after_add = distribution_markets::get_total_lp_shares(market_addr);
        assert!(total_shares_after_add > INITIAL_BACKING, 2);

        // Remove liquidity
        distribution_markets::remove_liquidity(
            &trader1,
            market_addr,
            trader_shares,
        );

        // Verify shares were burned
        let trader_shares_after_remove = distribution_markets::get_lp_share_balance(
            signer::address_of(&trader1),
            market_addr,
        );
        assert!(trader_shares_after_remove == 0, 3);
    }

    #[test]
    /// Test oracle and settlement functionality
    fun test_oracle_and_settlement() {
        let (admin, lp, trader1, _trader2) = create_test_accounts();
        let oracle = account::create_account_for_test(@0x5);
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let fa_metadata = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Set oracle
        distribution_markets::set_oracle(
            &admin,
            market_addr,
            signer::address_of(&oracle),
        );

        // Resolve market
        let realized_outcome = 5500000000000000000; // 5.5 in fixed point
        distribution_markets::resolve(
            &oracle,
            market_addr,
            realized_outcome,
            false,
        );

        // Verify market is resolved
        assert!(distribution_markets::market_is_resolved(market_addr), 1);
    }

    #[test]
    /// Test admin functions
    fun test_admin_functions() {
        let (admin, lp, _trader1, _trader2) = create_test_accounts();
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let fa_metadata = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Test fee rate setting
        let new_fee_rate = 50000000000000000; // 5% in fixed point
        distribution_markets::set_fee_rate(&admin, market_addr, new_fee_rate);

        // Test market pausing
        distribution_markets::pause_market(&admin, market_addr);
        assert!(!distribution_markets::market_is_active(market_addr), 1);

        // Test market unpausing
        distribution_markets::unpause_market(&admin, market_addr);
        assert!(distribution_markets::market_is_active(market_addr), 2);
    }

    #[test]
    /// Test admin can withdraw accumulated fees
    fun test_withdraw_fees() {
        let (admin, lp, trader1, _trader2) = create_test_accounts();
        let recipient = account::create_account_for_test(@0x6);
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let fa_metadata = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Set fee rate to 5%
        let fee_rate = 50000000000000000; // 0.05 * 1e18
        distribution_markets::set_fee_rate(&admin, market_addr, fee_rate);

        // Execute a trade to generate some fees
        let target_params = distribution_markets::make_normal_params(
            6000000000000000000, // 6.0
            1500000000000000000, // 1.5
            false,
        );
        let trade_cost = distribution_markets::quote_trade(initial_params, target_params, market_addr);
        let collateral = mint_test_fa(&mint_ref, signer::address_of(&trader1), trade_cost);
        distribution_markets::trade_move_to(&trader1, market_addr, target_params, collateral);

        // Withdraw half of accumulated fees to recipient
        // Note: we can't read accumulated_fees directly; success is lack of abort
        // and this ensures path coverage of withdraw function
        let withdraw_amount = trade_cost / 20; // approx 5% of trade_cost -> fees; withdraw subset
        distribution_markets::withdraw_fees(&admin, market_addr, withdraw_amount, signer::address_of(&recipient));
    }

    #[test]
    /// Test quote functions
    fun test_quote_functions() {
        let (admin, lp, _trader1, _trader2) = create_test_accounts();
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let fa_metadata = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Test quote_collateral
        let test_params = distribution_markets::make_normal_params(
            4000000000000000000, // 4.0
            2000000000000000000, // 2.0
            false,
        );

        let collateral_quote = distribution_markets::quote_collateral(test_params, market_addr);
        assert!(collateral_quote > 0, 1);

        // Test quote_collateral_detailed
        let (expected_refund, fees) = distribution_markets::quote_collateral_detailed(
            test_params, 
            market_addr
        );
        assert!(expected_refund > 0, 2);
        assert!(fees == 0, 3); // No fees set initially

        // Test quote_trade
        let target_params = distribution_markets::make_normal_params(
            6000000000000000000, // 6.0
            1200000000000000000, // 1.2
            false,
        );

        let trade_cost = distribution_markets::quote_trade(
            initial_params,
            target_params,
            market_addr,
        );
        assert!(trade_cost > 0, 4);
    }

    #[test]
    /// Test position management
    fun test_position_management() {
        let (admin, lp, trader1, _trader2) = create_test_accounts();
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let fa_metadata = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Mint multiple positions
        let collateral1 = mint_test_fa(&mint_ref, signer::address_of(&trader1), TEST_AMOUNT);
        let collateral2 = mint_test_fa(&mint_ref, signer::address_of(&trader1), TEST_AMOUNT);
        
        distribution_markets::mint(&trader1, market_addr, TEST_AMOUNT, collateral1);
        distribution_markets::mint(&trader1, market_addr, TEST_AMOUNT, collateral2);

        // Test get_trader_total_exposure
        let total_exposure = distribution_markets::get_trader_total_exposure(
            signer::address_of(&trader1),
            market_addr,
        );
        assert!(total_exposure.mean == initial_params.mean, 1);

        // Test close_position (closes all positions)
        distribution_markets::close_position(&trader1, market_addr);

        // Verify all positions are closed
        let trader_positions_after_close = distribution_markets::get_trader_position_page(
            signer::address_of(&trader1),
            market_addr,
            0,
            10,
        );
        assert!(vector::length(&trader_positions_after_close) == 0, 2);
    }

    #[test]
    #[expected_failure(abort_code = 2)] // ENOT_AUTHORIZED
    /// Test unauthorized access to admin functions
    fun test_unauthorized_admin_access() {
        let (admin, lp, trader1, _trader2) = create_test_accounts();
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let fa_metadata = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Try to set fee rate as non-admin (should fail)
        distribution_markets::set_fee_rate(&trader1, market_addr, 100000000000000000);
    }

    #[test]
    #[expected_failure(abort_code = 3)] // EMARKET_PAUSED
    /// Test operations on paused market
    fun test_paused_market_operations() {
        let (admin, lp, trader1, _trader2) = create_test_accounts();
        
        // Initialize timestamp for testing
        let aptos_framework = account::create_account_for_test(@0x1);
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        let initial_params = create_test_normal_params();
        let fa_metadata = create_mock_fa_metadata(&admin);
        
        let market_addr = distribution_markets::initialize_market(
            &admin,
            INITIAL_BACKING,
            initial_params,
            signer::address_of(&lp),
            fa_metadata,
        );

        // Pause market
        distribution_markets::pause_market(&admin, market_addr);

        // Try to mint position on paused market (should fail)
        let collateral = mint_test_fa(&mint_ref, signer::address_of(&trader1), TEST_AMOUNT);
        distribution_markets::mint(&trader1, market_addr, TEST_AMOUNT, collateral);
    }
}
