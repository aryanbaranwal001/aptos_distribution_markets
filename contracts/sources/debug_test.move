#[test_only]
module 0x3b0c1f2a3f9f281f3a654afd1cc07dfcdfa8facee967b196cc77cdd20b98c829::debug_test {
    use 0x3b0c1f2a3f9f281f3a654afd1cc07dfcdfa8facee967b196cc77cdd20b98c829::distribution_markets;

    #[test]
    /// Test settlement calculation with exact data from our trade
    fun test_settlement_calculation_isolated() {
        std::debug::print(&std::string::utf8(b"=== STARTING ISOLATED SETTLEMENT TEST ==="));
        
        // Call the test function with our exact trade data
        let settlement = distribution_markets::test_settlement_calculation_with_data(
            300000000000000000,     // realized_outcome: 0.3
            false,                  // outcome_is_negative
            500000000000000000,     // trader_mean: 0.5 (g)
            800000000000000000,     // trader_std_dev: 0.8 (g)
            false,                  // trader_mean_is_negative
            0,                      // market_mean: 0.0 (f)
            800000000000000000,     // market_std_dev: 0.8 (f)
            false,                  // market_mean_is_negative
            20000000,               // collateral: 0.02 APT in octas
            1684020831655245778,    // lambda_g
            1684020831655245778,    // lambda_f
        );
        
        std::debug::print(&std::string::utf8(b"Final settlement result:"));
        std::debug::print(&settlement);
        std::debug::print(&std::string::utf8(b"=== END ISOLATED TEST ==="));
    }
}
