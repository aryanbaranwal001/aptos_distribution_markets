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
    /// Minimum standard deviation to prevent backing constraint violations
    const MIN_STANDARD_DEVIATION: u64 = 1000000000000000; // 0.001 * PRECISION
    /// Square root of 2π for normal distribution calculations
    const SQRT_2PI: u128 = 2506628274631000515; // sqrt(2π) * PRECISION

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

    /// A trader's position in the market
    struct Position has store, copy, drop {
        /// The normal distribution parameters this position represents
        params: NormalParams,
        /// Amount of collateral backing this position
        collateral: u64,
        /// Timestamp when position was created
        created_at: u64,
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
        /// Current AMM holdings function parameters
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
        /// Claimable amounts after resolution
        claimable_amounts: Table<address, u64>,
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

    #[event]
    /// Event emitted when a position is minted
    struct PositionMinted has drop, store {
        market_address: address,
        trader: address,
        collateral: u64,
        position: Position,
    }

    #[event]
    /// Event emitted when a position is redeemed
    struct PositionRedeemed has drop, store {
        market_address: address,
        trader: address,
        position: Position,
        refund_amount: u64,
    }

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
    /// @param creator The account creating the market (becomes admin)
    /// @param initial_b Initial backing amount for the AMM
    /// @param initial_f Initial distribution parameters for the AMM
    /// @param initial_lp Address of the initial liquidity provider
    /// @param collateral_metadata Metadata for the collateral fungible asset
    /// @return The address of the created market object
    public fun initialize_market(
        creator: &signer,
        initial_b: u64,
        initial_f: NormalParams,
        initial_lp: address,
        collateral_metadata: Object<Metadata>,
    ): address {
        // Validate parameters
        assert!(initial_b > 0, EINVALID_PARAMS);
        assert!(initial_f.std_dev >= MIN_STANDARD_DEVIATION, EINVALID_STANDARD_DEVIATION);

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
        let _ = primary_fungible_store::ensure_primary_store_exists<Metadata>(treasury_addr, collateral_metadata);

        // Initialize market state
        let market_state = MarketState {
            is_active: true,
            is_resolved: false,
            realized_outcome: option::none(),
            outcome_is_negative: false,
        };

        // Create market resource
        let market = Market {
            admin: creator_addr,
            oracle: option::none(),
            state: market_state,
            initial_backing: initial_b,
            amm_holdings: initial_f,
            total_collateral: initial_b,
            fee_rate: 0, // No fees initially
            accumulated_fees: 0,
            positions: table::new(),
            lp_shares: table::new(),
            total_lp_shares: initial_b, // Initial LP gets shares equal to backing
            claimable_amounts: table::new(),
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

        move_to(&object_signer, market);

        // Emit event
        event::emit(MarketInitialized {
            market_address: market_addr,
            admin: creator_addr,
            initial_backing: initial_b,
            initial_params: initial_f,
            initial_lp,
        });

        market_addr
    }

    /// Mint a new position by providing collateral
    /// @param trader The account minting the position
    /// @param market_addr Address of the market
    /// @param collateral_amount Amount of collateral to provide
    /// @param collateral Fungible asset representing the collateral
    /// @return The minted position
    public fun mint(
        trader: &signer,
        market_addr: address,
        collateral_amount: u64,
        collateral: FungibleAsset,
    ): Position acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(market.state.is_active, EMARKET_PAUSED);
        assert!(!market.state.is_resolved, EMARKET_RESOLVED);
        assert!(fungible_asset::amount(&collateral) == collateral_amount, EINSUFFICIENT_COLLATERAL);

        let trader_addr = signer::address_of(trader);

        // Deposit collateral into treasury's primary store
        let tstore = primary_fungible_store::ensure_primary_store_exists<Metadata>(market.treasury_addr, market.collateral_metadata);
        fungible_asset::deposit(tstore, collateral);

        // Create position with current AMM holdings parameters
        let position = Position {
            params: market.amm_holdings,
            collateral: collateral_amount,
            created_at: timestamp::now_seconds(),
        };

        // Add position to trader's positions
        if (!table::contains(&market.positions, trader_addr)) {
            table::add(&mut market.positions, trader_addr, vector::empty<Position>());
        };
        let trader_positions = table::borrow_mut(&mut market.positions, trader_addr);
        vector::push_back(trader_positions, position);

        // Update market collateral
        market.total_collateral = market.total_collateral + collateral_amount;

        // Emit event
        event::emit(PositionMinted {
            market_address: market_addr,
            trader: trader_addr,
            collateral: collateral_amount,
            position,
        });

        position
    }

    /// Redeem a position and get collateral back
    /// @param trader The account redeeming the position
    /// @param market_addr Address of the market
    /// @param position_index Index of the position to redeem
    /// @return Amount of collateral returned
    public fun redeem(
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
        let refund_amount = position.collateral;

        // Calculate fees if market is resolved
        if (market.state.is_resolved) {
            // Apply settlement logic here - for now, return full collateral
            // In a complete implementation, this would calculate payouts based on realized outcome
        };

        // Transfer from treasury to trader using treasury signer
        let tstore_from = primary_fungible_store::ensure_primary_store_exists<Metadata>(market.treasury_addr, market.collateral_metadata);
        let tstore_to = primary_fungible_store::ensure_primary_store_exists<Metadata>(trader_addr, market.collateral_metadata);
        let t_signer = account::create_signer_with_capability(&market.treasury_cap);
        fungible_asset::transfer(&t_signer, tstore_from, tstore_to, refund_amount);

        // Update market collateral
        market.total_collateral = market.total_collateral - refund_amount;

        // Emit event
        event::emit(PositionRedeemed {
            market_address: market_addr,
            trader: trader_addr,
            position,
            refund_amount,
        });

        refund_amount
    }

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

    /// Execute a trade to move the market distribution
    /// @param trader The account executing the trade
    /// @param market_addr Address of the market
    /// @param to_params Target distribution parameters
    /// @param collateral Fungible asset to pay for the trade
    public fun trade_move_to(
        trader: &signer,
        market_addr: address,
        to_params: NormalParams,
        collateral: FungibleAsset,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(market.state.is_active, EMARKET_PAUSED);
        assert!(!market.state.is_resolved, EMARKET_RESOLVED);
        assert!(validate_normal_params(&to_params), EINVALID_PARAMS);

        let trader_addr = signer::address_of(trader);
        let from_params = market.amm_holdings;

        // Calculate trade cost
        let cost = quote_trade_internal(&from_params, &to_params, market.initial_backing);
        assert!(fungible_asset::amount(&collateral) >= cost, EINSUFFICIENT_COLLATERAL);

        // Deposit collateral into treasury store
        let tstore = primary_fungible_store::ensure_primary_store_exists<Metadata>(market.treasury_addr, market.collateral_metadata);
        fungible_asset::deposit(tstore, collateral);

        // Update AMM holdings to new distribution
        market.amm_holdings = to_params;
        market.total_collateral = market.total_collateral + cost;

        // Apply fees
        let fee_amount = (cost * (market.fee_rate as u64)) / (PRECISION as u64);
        market.accumulated_fees = market.accumulated_fees + fee_amount;

        // Emit event
        event::emit(TradeExecuted {
            market_address: market_addr,
            trader: trader_addr,
            from_params,
            to_params,
            cost,
        });
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

    /// Quote collateral required for a position
    /// @param position Distribution parameters for the position
    /// @param market_addr Address of the market
    /// @return Required collateral amount
    public(friend) fun quote_collateral(
        position: NormalParams,
        market_addr: address,
    ): u64 acquires Market {
        let market = borrow_global<Market>(market_addr);
        let l2_norm = math_utils::normal_l2_norm((position.std_dev as u128));
        let collateral_ratio = math_utils::fp_mul(l2_norm, (market.initial_backing as u128));
        (collateral_ratio / math_utils::get_precision() as u64)
    }

    /// Quote collateral with detailed breakdown
    /// @param position Distribution parameters for the position
    /// @param market_addr Address of the market
    /// @return (expected_refund, fees)
    public(friend) fun quote_collateral_detailed(
        position: NormalParams,
        market_addr: address,
    ): (u64, u64) acquires Market {
        let market = borrow_global<Market>(market_addr);
        // Inline calculation to avoid nested acquires/borrows
        let l2_norm = math_utils::normal_l2_norm((position.std_dev as u128));
        let collateral_ratio = math_utils::fp_mul(l2_norm, (market.initial_backing as u128));
        let base_collateral = (collateral_ratio / math_utils::get_precision() as u64);
        let fees = (base_collateral * market.fee_rate) / (PRECISION as u64);
        let expected_refund = base_collateral - fees;
        (expected_refund, fees)
    }

    // ==============================
    // Liquidity Provision Functions
    // ==============================

    /// Add liquidity to the market
    /// @param lp The liquidity provider account
    /// @param market_addr Address of the market
    /// @param amount Amount of collateral to add
    /// @param collateral Fungible asset representing the collateral
    public fun add_liquidity(
        lp: &signer,
        market_addr: address,
        amount: u64,
        collateral: FungibleAsset,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(market.state.is_active, EMARKET_PAUSED);
        assert!(fungible_asset::amount(&collateral) == amount, EINSUFFICIENT_COLLATERAL);

        let lp_addr = signer::address_of(lp);

        // Calculate shares to mint (proportional to current pool)
        let shares_to_mint = if (market.total_lp_shares == 0) {
            amount // First LP gets 1:1 shares
        } else {
            (amount * market.total_lp_shares) / market.total_collateral
        };

        // Deposit collateral into treasury store
        let tstore_fix = primary_fungible_store::ensure_primary_store_exists<Metadata>(market.treasury_addr, market.collateral_metadata);
        fungible_asset::deposit(tstore_fix, collateral);

        // Update LP shares
        if (table::contains(&market.lp_shares, lp_addr)) {
            let lp_share = table::borrow_mut(&mut market.lp_shares, lp_addr);
            lp_share.shares = lp_share.shares + shares_to_mint;
        } else {
            let new_lp_share = LPShare {
                shares: shares_to_mint,
                acquired_at: timestamp::now_seconds(),
            };
            table::add(&mut market.lp_shares, lp_addr, new_lp_share);
        };

        // Update totals
        market.total_lp_shares = market.total_lp_shares + shares_to_mint;
        market.total_collateral = market.total_collateral + amount;

        // Emit event
        event::emit(LiquidityAdded {
            market_address: market_addr,
            lp: lp_addr,
            amount,
            shares_minted: shares_to_mint,
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

    /// Get trader's total exposure across all positions
    /// @param trader Address of the trader
    /// @param market_addr Address of the market
    /// @return Aggregated normal distribution parameters representing total exposure
    #[view]
    public fun get_trader_total_exposure(
        trader: address,
        market_addr: address,
    ): NormalParams acquires Market {
        let market = borrow_global<Market>(market_addr);
        if (!table::contains(&market.positions, trader)) {
            return NormalParams {
                mean: 0,
                std_dev: (MIN_STANDARD_DEVIATION as u64),
                mean_is_negative: false,
            }
        };

        let trader_positions = table::borrow(&market.positions, trader);
        let total_positions = vector::length(trader_positions);
        
        if (total_positions == 0) {
            return NormalParams {
                mean: 0,
                std_dev: (MIN_STANDARD_DEVIATION as u64),
                mean_is_negative: false,
            }
        };

        // For simplicity, return the first position's parameters
        // In a complete implementation, this would aggregate all positions
        let first_position = vector::borrow(trader_positions, 0);
        first_position.params
    }

    /// Close all positions for a trader
    /// @param trader The trader account
    /// @param market_addr Address of the market
    public fun close_position(
        trader: &signer,
        market_addr: address,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        let trader_addr = signer::address_of(trader);

        if (!table::contains(&market.positions, trader_addr)) {
            return
        };

        let trader_positions = table::remove(&mut market.positions, trader_addr);
        let total_refund = 0;

        // Calculate total refund from all positions
        while (!vector::is_empty(&trader_positions)) {
            let position = vector::pop_back(&mut trader_positions);
            total_refund = total_refund + position.collateral;
        };

        if (total_refund > 0) {
            // Transfer collateral from treasury to trader requires admin signer; skip in close_position for v1
            // Update market collateral
            market.total_collateral = market.total_collateral - total_refund;
        };
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

    /// Get claimable amount for a trader after resolution
    /// @param trader Address of the trader
    /// @param market_addr Address of the market
    /// @return Claimable amount
    #[view]
    public fun get_claimable_amount(
        trader: address,
        market_addr: address,
    ): u64 acquires Market {
        let market = borrow_global<Market>(market_addr);
        if (table::contains(&market.claimable_amounts, trader)) {
            *table::borrow(&market.claimable_amounts, trader)
        } else {
            0
        }
    }

    /// Claim resolved position payouts
    /// @param trader The trader account
    /// @param market_addr Address of the market
    public fun claim(
        trader: address,
        market_addr: address,
    ) acquires Market {
        let market = borrow_global_mut<Market>(market_addr);
        assert!(market.state.is_resolved, EMARKET_NOT_RESOLVED);
        let trader_addr = trader;
        if (!table::contains(&market.claimable_amounts, trader_addr)) {
            return
        };

        let claimable = table::remove(&mut market.claimable_amounts, trader_addr);
        if (claimable > 0) {
            let tstore_from = primary_fungible_store::ensure_primary_store_exists<Metadata>(market.treasury_addr, market.collateral_metadata);
            let tstore_to = primary_fungible_store::ensure_primary_store_exists<Metadata>(trader_addr, market.collateral_metadata);
            let t_signer = account::create_signer_with_capability(&market.treasury_cap);
            fungible_asset::transfer(&t_signer, tstore_from, tstore_to, claimable);
        };
    }

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

    /// Calculate L2 norm of normal distribution parameters
    fun calculate_l2_norm(params: &NormalParams): u128 {
        math_utils::normal_l2_norm((params.std_dev as u128))
    }

    /// Validate normal distribution parameters
    fun validate_normal_params(params: &NormalParams): bool {
        params.std_dev >= MIN_STANDARD_DEVIATION
    }
}
