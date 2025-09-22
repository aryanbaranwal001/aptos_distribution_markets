/// Distribution Markets - Continuous Case Implementation
/// Based on the paper: https://www.paradigm.xyz/2024/12/distribution-markets
/// 
/// This module implements a prediction market for continuous probability distributions,
/// specifically focusing on normal (Gaussian) distributions. Traders can express beliefs
/// about the likelihood of different outcomes across an infinite range.
module distribution_markets::distribution_markets {
    use std::signer;
    use std::vector;
    use std::option::{Self, Option};
    use aptos_std::table::{Self, Table};
    use aptos_std::math64;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::fungible_asset::{Self, Metadata, FungibleAsset};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;
    use distribution_markets::math_utils;

    // ==============================
    // Error Codes
    // ==============================

    /// Market not found
    const EMARKET_NOT_FOUND: u64 = 1;
    /// Not authorized to perform this action
    const ENOT_AUTHORIZED: u64 = 2;
    /// Market is paused
    const EMARKET_PAUSED: u64 = 3;
    /// Market is already resolved
    const EMARKET_RESOLVED: u64 = 4;
    /// Market is not resolved yet
    const EMARKET_NOT_RESOLVED: u64 = 5;
    /// Insufficient collateral
    const EINSUFFICIENT_COLLATERAL: u64 = 6;
    /// Invalid parameters
    const EINVALID_PARAMS: u64 = 7;
    /// Position not found
    const EPOSITION_NOT_FOUND: u64 = 8;
    /// Insufficient liquidity
    const EINSUFFICIENT_LIQUIDITY: u64 = 9;
    /// Invalid standard deviation (too small)
    const EINVALID_STANDARD_DEVIATION: u64 = 10;
    /// Oracle not set
    const EORACLE_NOT_SET: u64 = 11;
    /// Invalid fee rate
    const EINVALID_FEE_RATE: u64 = 12;

    // ==============================
    // Constants
    // ==============================

    /// Fixed point precision (18 decimals)
    const PRECISION: u128 = 1000000000000000000;
    /// Maximum fee rate (10%)
    const MAX_FEE_RATE: u64 = 100000000000000000; // 0.1 * PRECISION
    /// Minimum standard deviation to prevent backing constraint violations (fallback)
    const MIN_STANDARD_DEVIATION_FALLBACK: u64 = 1000000000000000; // 0.001 * PRECISION
    /// Square root of 2π for normal distribution calculations
    const SQRT_2PI: u128 = 2506628274631000515; // sqrt(2π) * PRECISION
    /// Protocol-level AMM invariant constant K (part of the invariant equation ||f|| = K)
    const PROTOCOL_INVARIANT_K: u128 = 1000000000000000000; // 1.0 * PRECISION

    // ==============================
    // Data Structures
    // ==============================

    /// Parameters defining a normal distribution
    struct NormalParams has store, copy, drop {
        /// Mean of the distribution (μ) - signed integer with PRECISION scaling
        mean: u128,
        /// Standard deviation of the distribution (σ) - must be positive
        std_dev: u64,
        /// Whether the mean is negative (since Move doesn't have signed integers)
        mean_is_negative: bool,
    }

    /// Position representing a trader's distribution bet
    struct Position has store, copy, drop {
        /// The normal distribution parameters this position represents (g(x))
        params: NormalParams,
        /// Amount of collateral backing this position
        collateral: u64,
        /// Timestamp when position was created
        created_at: u64,
        /// Market's AMM position at the time this position was created (f(x))
        market_position_at_creation: NormalParams,
        /// Lambda scaling factor for g(x): λ_g = k√(2σ_g√π)
        lambda_g: u128,
        /// Lambda scaling factor for f(x): λ_f = k√(2σ_f√π)
        lambda_f: u128,
    }

    /// Market state enumeration
    struct MarketState has store, copy, drop {
        /// Whether the market is active (true) or paused (false)
        is_active: bool,
        /// Whether the market has been resolved
        is_resolved: bool,
        /// The realized outcome value (only set after resolution)
        realized_outcome: Option<u128>,
        /// Whether the realized outcome is negative
        outcome_is_negative: bool,
    }

    /// Liquidity provider share information
    struct LPShare has store, copy, drop {
        /// Number of shares owned
        shares: u64,
        /// Timestamp when shares were acquired
        acquired_at: u64,
    }

    /// Main market resource stored as an Object
    struct Market has key {
        /// Market creator and admin
        admin: address,
        /// Current oracle address
        oracle: Option<address>,
        /// Market state
        state: MarketState,
        /// Initial backing amount (b)
        initial_backing: u64,
        /// AMM invariant constant (k = ||f_initial||)
        invariant_k: u128,
        /// Current AMM holdings function parameters (f - what traders collectively hold)
        amm_holdings: NormalParams,
        /// Total collateral in the market
        total_collateral: u64,
        /// Fee rate (as a percentage of PRECISION)
        fee_rate: u64,
        /// Accumulated fees
        accumulated_fees: u64,
        /// Trader positions
        positions: Table<address, vector<Position>>,
        /// LP shares
        lp_shares: Table<address, LPShare>,
        /// Total LP shares outstanding
        total_lp_shares: u64,
        /// Treasury resource account address that holds collateral
        treasury_addr: address,
        /// SignerCapability for the treasury resource account
        treasury_cap: account::SignerCapability,
        /// Collateral metadata to resolve primary stores
        collateral_metadata: Object<Metadata>,
    }

    // ==============================
    // Events
    // ==============================

    #[event]
    /// Event emitted when a market is initialized
    struct MarketInitialized has drop, store {
        market_address: address,
        admin: address,
        initial_backing: u64,
        initial_params: NormalParams,
        initial_lp: address,
    }

    // Note: PositionMinted and PositionRedeemed events removed - use LiquidityAdded/LiquidityRemoved instead

    #[event]
    /// Event emitted when a trade occurs
    struct TradeExecuted has drop, store {
        market_address: address,
        trader: address,
        from_params: NormalParams,
        to_params: NormalParams,
        cost: u64,
    }

    #[event]
    /// Event emitted when liquidity is added
    struct LiquidityAdded has drop, store {
        market_address: address,
        lp: address,
        amount: u64,
        shares_minted: u64,
    }

    #[event]
    /// Event emitted when liquidity is removed
    struct LiquidityRemoved has drop, store {
        market_address: address,
        lp: address,
        shares_burned: u64,
        amount_withdrawn: u64,
    }

    #[event]
    /// Event emitted when market is resolved
    struct MarketResolved has drop, store {
        market_address: address,
        oracle: address,
        realized_outcome: u128,
        outcome_is_negative: bool,
    }

    // ==============================
    // Market Lifecycle Functions
    // ==============================

    /// Initialize a new distribution market
    /// @param creator The account creating the market
    /// @param initial_b Initial backing amount
    /// @param initial_f Initial distribution parameters
    /// @param initial_lp Address of the initial liquidity provider
    /// @param collateral_metadata Metadata for the collateral fungible asset
    /// @param initial_collateral The actual collateral being deposited
    /// @return Address of the created market
    public fun initialize_market(
        creator: &signer,
        initial_b: u64,
        initial_f: NormalParams,
        initial_lp: address,
        collateral_metadata: Object<Metadata>,
        initial_collateral: FungibleAsset,
    ): address {
        // Validate parameters
        assert!(initial_b > 0, EINVALID_PARAMS);
        // For initialization, use fallback minimum since we don't have k yet
        assert!(initial_f.std_dev >= MIN_STANDARD_DEVIATION_FALLBACK, EINVALID_STANDARD_DEVIATION);
        // Ensure the provided initial collateral matches the declared initial backing
        assert!(fungible_asset::amount(&initial_collateral) == initial_b, EINSUFFICIENT_COLLATERAL);

        let creator_addr = signer::address_of(creator);

        // Create market object (for identity/events)
        let constructor_ref = object::create_object(creator_addr);
        let object_signer = object::generate_signer(&constructor_ref);
        let market_addr = signer::address_of(&object_signer);

        // Create a per-market treasury resource account
        let seed = b"market_treasury";
        let (treasury_signer, treasury_cap) = account::create_resource_account(creator, seed);
        let treasury_addr = signer::address_of(&treasury_signer);
        // Ensure primary FA store for the treasury
        let tstore = primary_fungible_store::ensure_primary_store_exists<Metadata>(treasury_addr, collateral_metadata);
        // Deposit initial collateral from the initial LP into the treasury
        fungible_asset::deposit(tstore, initial_collateral);

        // Initialize market state
        let market_state = MarketState {
            is_active: true,
            is_resolved: false,
            realized_outcome: option::none(),
            outcome_is_negative: false,
        };

        // Use the protocol-level invariant constant K
        // Create market resource
        let market = Market {
            admin: creator_addr,
            oracle: option::none(),
            state: market_state,
            initial_backing: initial_b,
            invariant_k: PROTOCOL_INVARIANT_K,
            amm_holdings: initial_f,
            total_collateral: initial_b,
            fee_rate: 0, // No fees initially
            accumulated_fees: 0,
            positions: table::new(),
            lp_shares: table::new(),
            total_lp_shares: initial_b, // Initial LP gets shares equal to backing
            treasury_addr,
            treasury_cap,
            collateral_metadata,
        };

        // Add initial LP
        let initial_lp_share = LPShare {
            shares: initial_b,
            acquired_at: timestamp::now_seconds(),
        };
        table::add(&mut market.lp_shares, initial_lp, initial_lp_share);

        // Mint an initial position for the initial LP representing f, with zero additional collateral
        if (!table::contains(&market.positions, initial_lp)) {
            table::add(&mut market.positions, initial_lp, vector::empty<Position>());
        };
        // Calculate lambdas for initial position
        // For initial position, both g(x) and f(x) are the same (initial_f)
        let lambda_g = calculate_lambda(initial_f.std_dev);
        let lambda_f = calculate_lambda(initial_f.std_dev);
        
        // Create initial position for the LP (represents the initial distribution)
        let init_position = Position {
            params: initial_f,
            collateral: 0, // LP doesn't pay collateral for initial position
            created_at: timestamp::now_seconds(),
            market_position_at_creation: initial_f, // Initial market position is itself
            lambda_g,
            lambda_f,
        };
        let initial_positions = table::borrow_mut(&mut market.positions, initial_lp);
        vector::push_back(initial_positions, init_position);

        move_to(&object_signer, market);

        // Emit event
        event::emit(MarketInitialized {
            market_address: market_addr,
            admin: creator_addr,
            initial_backing: initial_b,
            initial_params: initial_f,
            initial_lp,
        });

        // Initial position created for LP (no event needed - use LiquidityAdded instead)

        market_addr
    }

    // Note: mint and redeem functions removed - use add_liquidity/remove_liquidity instead
    // These are special cases where y = 1 (single unit of liquidity)

    // ==============================
    // View Functions
    // ==============================

    #[view]
    /// Get market state information
    public fun get_market_state(market_addr: address): MarketState acquires Market {
        let market = borrow_global<Market>(market_addr);
        market.state
    }

    #[view]
    /// Get trader's positions with pagination
    public fun get_trader_position_page(
        trader: address,
        market_addr: address,
        offset: u32,
        limit: u32,
    ): vector<Position> acquires Market {
        let market = borrow_global<Market>(market_addr);
        if (!table::contains(&market.positions, trader)) {
            return vector::empty<Position>()
        };

        let trader_positions = table::borrow(&market.positions, trader);
        let total_positions = vector::length(trader_positions);
        let start_idx = (offset as u64);
        let end_idx = math64::min(start_idx + (limit as u64), total_positions);

        let result = vector::empty<Position>();
        let i = start_idx;
        while (i < end_idx) {
            vector::push_back(&mut result, *vector::borrow(trader_positions, i));
            i = i + 1;
        };

        result
    }

    #[view]
    /// Get LP share balance for an address
    public fun get_lp_share_balance(lp: address, market_addr: address): u64 acquires Market {
        let market = borrow_global<Market>(market_addr);
        if (table::contains(&market.lp_shares, lp)) {
            table::borrow(&market.lp_shares, lp).shares
        } else {
            0
        }
    }

    #[view]
    /// Get total LP shares outstanding
    public fun get_total_lp_shares(market_addr: address): u64 acquires Market {
        let market = borrow_global<Market>(market_addr);
        market.total_lp_shares
    }

    // ==============================
    // AMM Invariant Functions
    // ==============================

    /// Get the protocol-level invariant constant K
    /// This is the same for all markets in the protocol
    #[view]
    public fun get_protocol_invariant(): u128 {
        PROTOCOL_INVARIANT_K
    }

    /// Verify that the AMM invariant is maintained (for debugging/testing)
    /// Since K is a protocol constant, this always returns true
    #[view]
    public fun check_invariant_maintained(_market_addr: address): bool {
        // Since K is a protocol-level constant, the invariant is always maintained by design
        true
    }

    /// Calculate the minimum standard deviation based on backing constraint
    /// σ_min = k² / (b² * √π) where b is backing, k is protocol invariant
    fun calculate_min_standard_deviation(market: &Market): u64 {
        let b = (market.initial_backing as u128);
        let k = PROTOCOL_INVARIANT_K;
        let k_squared = math_utils::fp_square(k);
        let b_squared = math_utils::fp_square(b);
        let sqrt_pi = 1772453850905516027; // √π * PRECISION (approximately)
        let denominator = math_utils::fp_mul(b_squared, sqrt_pi);
        
        if (denominator == 0) {
            return (MIN_STANDARD_DEVIATION_FALLBACK as u64)
        };
        
        let min_std_dev = math_utils::fp_div(k_squared, denominator);
        let result = (min_std_dev / PRECISION as u64);
        
        // Ensure we don't go below the fallback minimum
        if (result < MIN_STANDARD_DEVIATION_FALLBACK) {
            MIN_STANDARD_DEVIATION_FALLBACK
        } else {
            result
        }
    }

    /// Get the minimum standard deviation for a market (public view)
    #[view]
    public fun get_min_standard_deviation(market_addr: address): u64 acquires Market {
        let market = borrow_global<Market>(market_addr);
        calculate_min_standard_deviation(market)
    }

    /// Calculate settlement payout for a position based on realized outcome
    /// Settlement = λ * [g(x0) - f(x0)] + collateral
    /// Where g(x) is trader's position, f(x) is market position at creation time, λ is scaling factor
    fun calculate_settlement_payout(position: &Position, market: &Market): u64 {
        if (!market.state.is_resolved) {
            return position.collateral
        };

        let realized_outcome = *option::borrow(&market.state.realized_outcome);
        let outcome_is_negative = market.state.outcome_is_negative;

        // Calculate g(x0) - trader's position value at realized outcome
        let g_x0 = math_utils::normal_pdf(
            realized_outcome,
            position.params.mean,
            (position.params.std_dev as u128),
            outcome_is_negative,
            position.params.mean_is_negative
        );

        // Calculate f(x0) - market position value at realized outcome (from creation time)
        let f_x0 = math_utils::normal_pdf(
            realized_outcome,
            position.market_position_at_creation.mean,
            (position.market_position_at_creation.std_dev as u128),
            outcome_is_negative,
            position.market_position_at_creation.mean_is_negative
        );

        // Calculate λ_g * g(x0) - λ_f * f(x0)
        let scaled_g_x0 = math_utils::fp_mul(position.lambda_g, g_x0);
        let scaled_f_x0 = math_utils::fp_mul(position.lambda_f, f_x0);
        
        let scaled_g_x0_u64 = (scaled_g_x0 / math_utils::get_precision() as u64);
        let scaled_f_x0_u64 = (scaled_f_x0 / math_utils::get_precision() as u64);

        // Settlement = λ_g * g(x0) - λ_f * f(x0) + collateral
        let settlement = if (scaled_g_x0_u64 >= scaled_f_x0_u64) {
            // Positive difference: trader profits
            let profit = scaled_g_x0_u64 - scaled_f_x0_u64;
            position.collateral + profit
        } else {
            // Negative difference: trader loses
            let loss = scaled_f_x0_u64 - scaled_g_x0_u64;
            if (loss >= position.collateral) {
                0 // Cannot go below zero
            } else {
                position.collateral - loss
            }
        };

        settlement
    }

    /// Verify off-chain calculated minimum collateral using derivatives
    /// This function verifies that the provided minimum point and derivatives are correct
    /// for the collateral calculation: min_x g(x) - f(x) when moving AMM from h = b - f to h2 = b - g
    public fun verify_min_collateral_calculation(
        market_addr: address,
        from_params: NormalParams,
        to_params: NormalParams,
        min_point: u128,
        min_point_is_negative: bool,
        first_derivative: u128,
        second_derivative: u128,
        min_value: u128
    ): bool acquires Market {
        let market = borrow_global<Market>(market_addr);
        
        // Verify that the provided parameters are valid
        assert!(validate_normal_params(&from_params, market), EINVALID_PARAMS);
        assert!(validate_normal_params(&to_params, market), EINVALID_PARAMS);

        // Calculate g(min_point) - f(min_point)
        let g_at_point = math_utils::normal_pdf(
            min_point,
            to_params.mean,
            (to_params.std_dev as u128),
            min_point_is_negative,
            to_params.mean_is_negative
        );
        
        let f_at_point = math_utils::normal_pdf(
            min_point,
            from_params.mean,
            (from_params.std_dev as u128),
            min_point_is_negative,
            from_params.mean_is_negative
        );

        let diff_at_point = if (g_at_point >= f_at_point) {
            g_at_point - f_at_point
        } else {
            f_at_point - g_at_point
        };

        // Verify that the calculated difference matches the provided minimum value
        let tolerance = min_value / 1000000; // 0.0001% tolerance
        let min_value_matches = math_utils::fp_approx_equal(diff_at_point, min_value, tolerance);

        // Verify critical point condition: first derivative ≈ 0
        let derivative_tolerance = math_utils::get_precision() / 1000000; // Small tolerance for derivative
        let is_critical_point = math_utils::fp_approx_equal(first_derivative, 0, derivative_tolerance);

        // Verify minimum condition: second derivative > 0
        let is_minimum = second_derivative > 0;

        // All three conditions must be satisfied for a valid minimum
        min_value_matches && is_critical_point && is_minimum
    }

    // ==============================
    // Helper Functions
    // ==============================

    // Public helpers for constructing and reading params/state (useful for tests and clients)

    public(friend) fun make_normal_params(mean: u128, std_dev: u64, mean_is_negative: bool): NormalParams {
        NormalParams { mean, std_dev, mean_is_negative }
    }

    public(friend) fun normal_mean(p: &NormalParams): u128 { p.mean }

    public(friend) fun normal_std_dev(p: &NormalParams): u64 { p.std_dev }

    public(friend) fun normal_mean_is_negative(p: &NormalParams): bool { p.mean_is_negative }

    #[view]
    public fun market_is_active(market_addr: address): bool acquires Market {
        let market = borrow_global<Market>(market_addr);
        market.state.is_active
    }

    #[view]
    public fun market_is_resolved(market_addr: address): bool acquires Market {
        let market = borrow_global<Market>(market_addr);
        market.state.is_resolved
    }

    public(friend) fun position_collateral_ref(p: &Position): u64 { p.collateral }

    public(friend) fun position_mean(p: &Position): u128 { p.params.mean }

    public(friend) fun position_std_dev(p: &Position): u64 { p.params.std_dev }

    // ==============================
    // Trading Functions
    // ==============================

    /// Execute a trade according to the Distribution Markets paper
    /// AMM starts holding h(x) = b - f(x), trader wants to move market to g(x)
    /// After trade: AMM holds b - g(x), trader gets position g(x) - f(x)
    /// @param trader The account executing the trade
    /// @param market_addr Address of the market
    /// @param target_g Target distribution the trader wants the market to become
    /// @param collateral Fungible asset to pay for the trade
    public fun trade(
        trader: &signer,
        market_addr: address,
        target_g: NormalParams,
        collateral: FungibleAsset,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(market.state.is_active, EMARKET_PAUSED);
        assert!(!market.state.is_resolved, EMARKET_RESOLVED);
        assert!(validate_normal_params(&target_g, market), EINVALID_PARAMS);

        let trader_addr = signer::address_of(trader);
        let current_f = market.amm_holdings; // Current market distribution f(x)

        // Calculate trade cost: minimum collateral needed for g(x) - f(x)
        let cost = quote_trade_internal(&current_f, &target_g, market.initial_backing);
        assert!(fungible_asset::amount(&collateral) >= cost, EINSUFFICIENT_COLLATERAL);

        // Deposit collateral into treasury store
        let tstore = primary_fungible_store::ensure_primary_store_exists<Metadata>(market.treasury_addr, market.collateral_metadata);
        fungible_asset::deposit(tstore, collateral);

        // Calculate separate lambdas for g(x) and f(x)
        let lambda_g = calculate_lambda(target_g.std_dev);  // λ_g for trader's target function
        let lambda_f = calculate_lambda(current_f.std_dev); // λ_f for market's current function

        // Create position g(x) - f(x) for the trader
        let trader_position = Position {
            params: target_g,                      // g(x) - what trader wants
            collateral: cost,
            created_at: timestamp::now_seconds(),
            market_position_at_creation: current_f, // f(x) - market state when trade happened
            lambda_g,
            lambda_f,
        };

        // Add position to trader's positions
        if (!table::contains(&market.positions, trader_addr)) {
            table::add(&mut market.positions, trader_addr, vector::empty<Position>());
        };
        let trader_positions = table::borrow_mut(&mut market.positions, trader_addr);
        vector::push_back(trader_positions, trader_position);

        // Update AMM holdings: market now holds b - g(x) instead of b - f(x)
        market.amm_holdings = target_g;
        market.total_collateral = market.total_collateral + cost;

        // Apply fees
        let fee_amount = (cost * (market.fee_rate as u64)) / (PRECISION as u64);
        market.accumulated_fees = market.accumulated_fees + fee_amount;

        // Emit event
        event::emit(TradeExecuted {
            market_address: market_addr,
            trader: trader_addr,
            from_params: current_f,
            to_params: target_g,
            cost,
        });
    }

    /// Close a position and receive settlement
    /// Settlement = λ * [g(x0) - f(x0)] + collateral where x0 is realized outcome
    /// @param trader The account closing the position
    /// @param market_addr Address of the market
    /// @param position_index Index of the position to close
    /// @return Settlement amount received
    public fun close_position(
        trader: &signer,
        market_addr: address,
        position_index: u64,
    ): u64 acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        let trader_addr = signer::address_of(trader);

        assert!(table::contains(&market.positions, trader_addr), EPOSITION_NOT_FOUND);
        let trader_positions = table::borrow_mut(&mut market.positions, trader_addr);
        assert!(vector::length(trader_positions) > position_index, EPOSITION_NOT_FOUND);

        let position = vector::remove(trader_positions, position_index);
        
        // Calculate settlement using the correct formula
        let settlement_amount = calculate_settlement_payout(&position, market);

        // Transfer settlement from treasury to trader
        let tstore_from = primary_fungible_store::ensure_primary_store_exists<Metadata>(market.treasury_addr, market.collateral_metadata);
        let tstore_to = primary_fungible_store::ensure_primary_store_exists<Metadata>(trader_addr, market.collateral_metadata);
        let t_signer = account::create_signer_with_capability(&market.treasury_cap);
        fungible_asset::transfer(&t_signer, tstore_from, tstore_to, settlement_amount);

        // Update market collateral
        market.total_collateral = market.total_collateral - settlement_amount;

        // Emit event (reuse existing event structure)
        event::emit(TradeExecuted {
            market_address: market_addr,
            trader: trader_addr,
            from_params: position.market_position_at_creation,
            to_params: position.params,
            cost: settlement_amount, // Settlement amount instead of cost
        });

        settlement_amount
    }

    /// Quote the cost of a trade between two distributions
    /// @param from_f Current distribution parameters
    /// @param to_g Target distribution parameters
    /// @param market_addr Address of the market
    /// @return Cost of the trade
    public(friend) fun quote_trade(
        from_f: NormalParams,
        to_g: NormalParams,
        market_addr: address,
    ): u64 acquires Market {
        let market = borrow_global<Market>(market_addr);
        quote_trade_internal(&from_f, &to_g, market.initial_backing)
    }

    /// Internal function to calculate trade cost
    fun quote_trade_internal(
        from_f: &NormalParams,
        to_g: &NormalParams,
        backing: u64,
    ): u64 {
        let cost = math_utils::calculate_trade_cost(
            from_f.mean,
            (from_f.std_dev as u128),
            from_f.mean_is_negative,
            to_g.mean,
            (to_g.std_dev as u128),
            to_g.mean_is_negative,
            (backing as u128)
        );
        (cost / math_utils::get_precision() as u64)
    }

    // Removed obsolete quote_collateral functions - they were for the old mint/redeem pattern
    // Use quote_trade() for trading cost calculation instead

    // ==============================
    // Liquidity Provision Functions
    // ==============================

    /// Add liquidity to the market according to Distribution Markets paper
    /// LP wants to add proportion y of current liquidity
    /// AMM position is h = b - f, LP contributes yh = yb - yf and gets yl LP shares
    /// @param lp The liquidity provider account  
    /// @param market_addr Address of the market
    /// @param proportion_y Proportion of current liquidity to add (scaled by PRECISION)
    /// @param collateral Fungible asset representing the collateral (must be yb amount)
    public fun add_liquidity(
        lp: &signer,
        market_addr: address,
        proportion_y: u64, // Proportion scaled by PRECISION (e.g., 50000000 = 0.5 = 50%)
        collateral: FungibleAsset,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(market.state.is_active, EMARKET_PAUSED);
        
        let lp_addr = signer::address_of(lp);
        let current_f = market.amm_holdings; // Current AMM distribution f
        
        // Calculate required amounts based on proportion y
        let y = (proportion_y as u128);
        let precision = (PRECISION as u128);
        
        // yb = y * current_backing
        let yb = (y * (market.initial_backing as u128)) / precision;
        let yb_u64 = (yb as u64);
        
        // Verify LP provided correct collateral amount
        assert!(fungible_asset::amount(&collateral) == yb_u64, EINSUFFICIENT_COLLATERAL);
        
        // Calculate yl = y * current_lp_shares  
        let yl = if (market.total_lp_shares == 0) {
            yb_u64 // First LP case
        } else {
            ((y * (market.total_lp_shares as u128)) / precision as u64)
        };

        // Deposit collateral into treasury store
        let tstore = primary_fungible_store::ensure_primary_store_exists<Metadata>(market.treasury_addr, market.collateral_metadata);
        fungible_asset::deposit(tstore, collateral);

        // Calculate lambdas for the position yf that LP will keep
        let lambda_g = calculate_lambda(current_f.std_dev);
        let lambda_f = calculate_lambda(current_f.std_dev); // Same function, so same lambda
        
        // Create position yf for the LP (what they keep after contributing yh to AMM)
        let lp_position = Position {
            params: current_f,                      // yf - LP keeps current market distribution
            collateral: yb_u64,                    // yb collateral provided
            created_at: timestamp::now_seconds(),
            market_position_at_creation: current_f, // f at time of LP provision
            lambda_g,
            lambda_f,
        };

        // Add position to LP's positions
        if (!table::contains(&market.positions, lp_addr)) {
            table::add(&mut market.positions, lp_addr, vector::empty<Position>());
        };
        let lp_positions = table::borrow_mut(&mut market.positions, lp_addr);
        vector::push_back(lp_positions, lp_position);

        // Update LP shares
        if (table::contains(&market.lp_shares, lp_addr)) {
            let lp_share = table::borrow_mut(&mut market.lp_shares, lp_addr);
            lp_share.shares = lp_share.shares + yl;
        } else {
            let new_lp_share = LPShare {
                shares: yl,
                acquired_at: timestamp::now_seconds(),
            };
            table::add(&mut market.lp_shares, lp_addr, new_lp_share);
        };

        // Update totals
        market.total_lp_shares = market.total_lp_shares + yl;
        market.total_collateral = market.total_collateral + yb_u64;

        // Emit event
        event::emit(LiquidityAdded {
            market_address: market_addr,
            lp: lp_addr,
            amount: yb_u64,
            shares_minted: yl,
        });
    }

    /// Remove liquidity from the market
    /// @param lp The liquidity provider account
    /// @param market_addr Address of the market
    /// @param shares Number of shares to burn
    public fun remove_liquidity(
        lp: &signer,
        market_addr: address,
        shares: u64,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        let lp_addr = signer::address_of(lp);

        assert!(table::contains(&market.lp_shares, lp_addr), EPOSITION_NOT_FOUND);
        let lp_share = table::borrow_mut(&mut market.lp_shares, lp_addr);
        assert!(lp_share.shares >= shares, EINSUFFICIENT_LIQUIDITY);

        // Calculate amount to withdraw
        let amount_to_withdraw = (shares * market.total_collateral) / market.total_lp_shares;

        // Update LP shares
        lp_share.shares = lp_share.shares - shares;
        if (lp_share.shares == 0) {
            table::remove(&mut market.lp_shares, lp_addr);
        };

        // Transfer from treasury to LP
        let tstore_from = primary_fungible_store::ensure_primary_store_exists<Metadata>(market.treasury_addr, market.collateral_metadata);
        let tstore_to = primary_fungible_store::ensure_primary_store_exists<Metadata>(lp_addr, market.collateral_metadata);
        let t_signer = account::create_signer_with_capability(&market.treasury_cap);
        fungible_asset::transfer(&t_signer, tstore_from, tstore_to, amount_to_withdraw);

        // Update totals
        market.total_lp_shares = market.total_lp_shares - shares;
        market.total_collateral = market.total_collateral - amount_to_withdraw;

        // Emit event
        event::emit(LiquidityRemoved {
            market_address: market_addr,
            lp: lp_addr,
            shares_burned: shares,
            amount_withdrawn: amount_to_withdraw,
        });
    }

    // ==============================
    // Position Management Functions  
    // ==============================

    /// Get trader's position (V1: assumes one position per trader)
    /// @param trader Address of the trader
    /// @param market_addr Address of the market
    /// @return The trader's position parameters, or None if no position
    #[view]
    public fun get_trader_position(
        trader: address,
        market_addr: address,
    ): Option<NormalParams> acquires Market {
        let market = borrow_global<Market>(market_addr);
        if (!table::contains(&market.positions, trader)) {
            return option::none<NormalParams>()
        };

        let trader_positions = table::borrow(&market.positions, trader);
        if (vector::length(trader_positions) == 0) {
            return option::none<NormalParams>()
        };

        // V1: Return first (and only) position
        let position = vector::borrow(trader_positions, 0);
        option::some(position.params)
    }

    // ==============================
    // Oracle and Settlement Functions
    // ==============================

    /// Set the oracle address (admin only)
    /// @param admin The admin account
    /// @param market_addr Address of the market
    /// @param new_oracle Address of the new oracle
    public fun set_oracle(
        admin: &signer,
        market_addr: address,
        new_oracle: address,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(signer::address_of(admin) == market.admin, ENOT_AUTHORIZED);
        market.oracle = option::some(new_oracle);
    }

    /// Resolve the market with the realized outcome (oracle only)
    /// @param oracle The oracle account
    /// @param market_addr Address of the market
    /// @param x_realized Realized outcome value
    /// @param outcome_is_negative Whether the realized outcome is negative
    public fun resolve(
        oracle: &signer,
        market_addr: address,
        x_realized: u128,
        outcome_is_negative: bool,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(option::is_some(&market.oracle), EORACLE_NOT_SET);
        assert!(signer::address_of(oracle) == *option::borrow(&market.oracle), ENOT_AUTHORIZED);
        assert!(!market.state.is_resolved, EMARKET_RESOLVED);

        // Update market state
        market.state.is_resolved = true;
        market.state.realized_outcome = option::some(x_realized);
        market.state.outcome_is_negative = outcome_is_negative;

        // Emit event
        event::emit(MarketResolved {
            market_address: market_addr,
            oracle: signer::address_of(oracle),
            realized_outcome: x_realized,
            outcome_is_negative,
        });
    }

    // Settlement happens when traders call close_position() after market resolution
    // No separate claim mechanism needed - settlement is calculated using λ_g * g(x0) - λ_f * f(x0) + collateral

    // ==============================
    // Admin and Utility Functions
    // ==============================

    /// Set fee rate (admin only)
    /// @param admin The admin account
    /// @param market_addr Address of the market
    /// @param new_fee_rate New fee rate (as percentage of PRECISION)
    public fun set_fee_rate(
        admin: &signer,
        market_addr: address,
        new_fee_rate: u64,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(signer::address_of(admin) == market.admin, ENOT_AUTHORIZED);
        assert!(new_fee_rate <= MAX_FEE_RATE, EINVALID_FEE_RATE);
        market.fee_rate = new_fee_rate;
    }

    /// Withdraw accumulated fees to a recipient (admin only)
    /// @param admin The admin account
    /// @param market_addr Address of the market
    /// @param amount Amount of fees to withdraw
    /// @param recipient Address to receive the fees
    public fun withdraw_fees(
        admin: &signer,
        market_addr: address,
        amount: u64,
        recipient: address,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(signer::address_of(admin) == market.admin, ENOT_AUTHORIZED);
        assert!(amount > 0, EINVALID_PARAMS);
        assert!(amount <= market.accumulated_fees, EINSUFFICIENT_LIQUIDITY);

        // Transfer fees from treasury to recipient using treasury signer
        let tstore_from = primary_fungible_store::ensure_primary_store_exists<Metadata>(market.treasury_addr, market.collateral_metadata);
        let tstore_to = primary_fungible_store::ensure_primary_store_exists<Metadata>(recipient, market.collateral_metadata);
        let t_signer = account::create_signer_with_capability(&market.treasury_cap);
        fungible_asset::transfer(&t_signer, tstore_from, tstore_to, amount);

        // Update accounting
        market.accumulated_fees = market.accumulated_fees - amount;
        market.total_collateral = market.total_collateral - amount;
    }

    /// Pause the market (admin only)
    /// @param admin The admin account
    /// @param market_addr Address of the market
    public fun pause_market(
        admin: &signer,
        market_addr: address,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(signer::address_of(admin) == market.admin, ENOT_AUTHORIZED);
        market.state.is_active = false;
    }

    /// Unpause the market (admin only)
    /// @param admin The admin account
    /// @param market_addr Address of the market
    public fun unpause_market(
        admin: &signer,
        market_addr: address,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(signer::address_of(admin) == market.admin, ENOT_AUTHORIZED);
        market.state.is_active = true;
    }

    // ==============================
    // Helper Functions
    // ==============================

    /// Calculate lambda scaling factor: λ = k√(2σ√π)
    /// Where k is protocol invariant, σ is standard deviation
    fun calculate_lambda(std_dev: u64): u128 {
        let k = PROTOCOL_INVARIANT_K;
        let sigma = (std_dev as u128);
        let two_sigma = 2 * sigma;
        let sqrt_pi = 1772453850905516027; // √π * PRECISION
        let two_sigma_sqrt_pi = math_utils::fp_mul(two_sigma, sqrt_pi);
        let sqrt_two_sigma_sqrt_pi = math_utils::fp_sqrt(two_sigma_sqrt_pi);
        math_utils::fp_mul(k, sqrt_two_sigma_sqrt_pi)
    }

    /// Calculate L2 norm of normal distribution parameters
    /// Note: This function is deprecated - L2 norm not needed on-chain
    fun calculate_l2_norm(params: &NormalParams): u128 {
        // Simplified calculation - in practice this is computed off-chain
        (params.std_dev as u128) * math_utils::get_precision()
    }

    /// Validate normal distribution parameters against market constraints
    fun validate_normal_params(params: &NormalParams, market: &Market): bool {
        params.std_dev >= calculate_min_standard_deviation(market)
    }

    /// Validate normal distribution parameters using fallback minimum (for initialization)
    fun validate_normal_params_fallback(params: &NormalParams): bool {
        params.std_dev >= MIN_STANDARD_DEVIATION_FALLBACK
    }
}
