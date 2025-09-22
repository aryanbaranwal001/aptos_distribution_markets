#[test_only]
module distribution_markets::distribution_markets_tests {
    use std::signer;
    use std::option;
    use std::string;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::fungible_asset::{Self, Metadata, FungibleAsset};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::timestamp;
    use aptos_framework::account;

    use distribution_markets::distribution_markets;

    const PRECISION: u64 = 100000000; // 10^8

    // Test helper to create a test account
    fun create_test_account(addr: address): signer {
        account::create_account_for_test(addr)
    }

    // Test helper to create fungible asset for testing
    fun create_test_fa(creator: &signer, amount: u64): (FungibleAsset, Object<Metadata>) {
        let constructor_ref = &object::create_named_object(creator, b"TestCoin");
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            string::utf8(b"Test Coin"),
            string::utf8(b"TEST"),
            8,
            string::utf8(b""),
            string::utf8(b"")
        );
        let metadata = object::object_from_constructor_ref<Metadata>(constructor_ref);
        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let fa = fungible_asset::mint(&mint_ref, amount);
        (fa, metadata)
    }

    #[test]
    fun test_market_initialization() {
        let creator = create_test_account(@0x123);
        let initial_lp = create_test_account(@0x456);
        
        // Set up timestamp
        timestamp::set_time_has_started_for_testing(&account::create_account_for_test(@0x1));
        
        let initial_backing = 1000u64;
        let (collateral_fa, metadata) = create_test_fa(&creator, initial_backing);
        
        // Create initial distribution parameters
        // Note: std_dev must be >= MIN_STANDARD_DEVIATION_FALLBACK = 0.001 * PRECISION
        let initial_params = distribution_markets::make_normal_params(
            50 * (PRECISION as u128), // mean = 50
            1000000000000000, // std_dev = 0.001 * PRECISION (minimum allowed)
            false // mean_is_negative = false
        );

        let market_addr = distribution_markets::initialize_market(
            &creator,
            initial_backing,           // initial_b: u64
            initial_params,           // initial_f: NormalParams  
            signer::address_of(&initial_lp), // initial_lp: address
            metadata,                 // collateral_metadata: Object<Metadata>
            collateral_fa            // initial_collateral: FungibleAsset
        );

        // Verify market was created
        assert!(distribution_markets::market_is_active(market_addr), 1);
        assert!(!distribution_markets::market_is_resolved(market_addr), 2);
        
        // Verify initial LP shares
        assert!(distribution_markets::get_total_lp_shares(market_addr) == initial_backing, 4);
    }
}
