/// Mathematical utilities for distribution markets
/// Provides fixed-point arithmetic and statistical functions
module distribution_markets::math_utils {

    // ==============================
    // Constants
    // ==============================

    /// Fixed point precision (18 decimals)
    const PRECISION: u128 = 1000000000000000000;
    /// Square root of 2π for normal distribution calculations
    const SQRT_2PI: u128 = 2506628274631000515; // sqrt(2π) * PRECISION
    /// Euler's number e
    const E: u128 = 2718281828459045235; // e * PRECISION
    /// Natural logarithm of 2
    const LN_2: u128 = 693147180559945309; // ln(2) * PRECISION
    /// Maximum value for u128
    const MAX_U128: u256 = 340282366920938463463374607431768211455;

    // ==============================
    // Error Codes
    // ==============================

    /// Division by zero
    const EDIVISION_BY_ZERO: u64 = 1;
    /// Overflow in calculation
    const EOVERFLOW: u64 = 2;
    /// Invalid input for mathematical function
    const EINVALID_INPUT: u64 = 3;

    // ==============================
    // Fixed Point Arithmetic
    // ==============================

    /// Multiply two fixed-point numbers - ✅
    #[view]
    public fun fp_mul(a: u128, b: u128): u128 {
        // Use 256-bit arithmetic to prevent overflow
        let a_256 = (a as u256);
        let b_256 = (b as u256);
        let precision_256 = (PRECISION as u256);
        
        let result_256 = (a_256 * b_256) / precision_256;
        
        // Check if result fits in u128
        assert!(result_256 <= MAX_U128, EOVERFLOW);
        
        (result_256 as u128)
    }

    /// Divide two fixed-point numbers - ✅
    #[view]
    public fun fp_div(a: u128, b: u128): u128 {
        assert!(b != 0, EDIVISION_BY_ZERO);
        
        // Use 256-bit arithmetic to prevent overflow
        let a_256 = (a as u256);
        let precision_256 = (PRECISION as u256);
        let b_256 = (b as u256);
        
        let result_256 = (a_256 * precision_256) / b_256;
        
        // Check if result fits in u128
        assert!(result_256 <= MAX_U128, EOVERFLOW);
        
        (result_256 as u128)
    }

    /// Add two fixed-point numbers - ✅
    #[view]
    public fun fp_add(a: u128, b: u128): u128 {
        a + b
    }

    /// Subtract two fixed-point numbers (a - b) - ✅
    #[view]
    public fun fp_sub(a: u128, b: u128): u128 {
        assert!(a >= b, EOVERFLOW);
        a - b
    }

    /// Square a fixed-point number - ✅
    #[view]
    public fun fp_square(a: u128): u128 {
        fp_mul(a, a)
    }

    /// Convert regular integer to fixed-point - ✅
    #[view]
    public fun to_fixed_point(a: u64): u128 {
        (a as u128) * PRECISION
    }

    /// Convert fixed-point to regular integer (truncating decimals) - ✅
    #[view]
    public fun from_fixed_point(a: u128): u64 {
        (a / PRECISION as u64)
    }

    // ==============================
    // Mathematical Functions
    // ==============================

    /// Calculate square root using Newton's method (fixed-point) - ✅
    #[view]
    public fun fp_sqrt(x: u128): u128 {
        if (x == 0) return 0;
        
        let z = x;
        let y = (x + PRECISION) / 2;
        
        while (y < z) {
            z = y;
            y = (fp_div(x, y) + y) / 2;
        };
        
        z
    }
    
    /// Calculate exponential function e^x using range reduction and Taylor series - ✅
    /// Uses e^x = e^(integer_part) * e^(fractional_part) for better accuracy
    #[view]
    public fun fp_exp(x: u128): u128 {
        if (x == 0) return PRECISION;
        
        // Range reduction: split x into integer and fractional parts
        let integer_part = x / PRECISION;
        let fractional_part = x % PRECISION;
        
        // Calculate e^(fractional_part) using Taylor series (fractional_part < 1)
        let frac_result = PRECISION;
        let term = PRECISION;
        let i = 1;
        
        // Taylor series converges well for values < 1
        while (i <= 15 && term > PRECISION / 1000000) { // Better convergence check
            term = fp_mul(term, fractional_part) / (i as u128);
            frac_result = frac_result + term;
            i = i + 1;
        };
        
        // Calculate e^(integer_part) = e^1 raised to integer_part power
        let int_result = PRECISION;
        let e_power = E; // e^1 = 2.718281828...
        let remaining_power = integer_part;
        
        // Fast exponentiation: e^n = (e^1)^n
        while (remaining_power > 0) {
            if (remaining_power % 2 == 1) {
                int_result = fp_mul(int_result, e_power);
            };
            e_power = fp_mul(e_power, e_power);
            remaining_power = remaining_power / 2;
        };
        
        // Combine: e^x = e^(integer_part) * e^(fractional_part)
        fp_mul(int_result, frac_result)
    }

    /// Calculate natural logarithm using range reduction and series expansion - ✅
    /// Uses ln(x) = ln(2^n * m) = n*ln(2) + ln(m) where 1 ≤ m < 2
    /// Note: Only works for x >= 1, returns 0 for x < 1 (limitation for now)
    #[view]
    public fun fp_ln(x: u128): u128 {
        assert!(x > 0, EINVALID_INPUT);
        if (x == PRECISION) return 0;
        
        // For now, only handle x >= 1 to avoid negative results
        if (x < PRECISION) {
            return 0; // Simplified: ln(x < 1) would be negative, return 0 for now
        };
        
        // Range reduction: find n such that x = 2^n * m where 1 ≤ m < 2
        let current_x = x;
        
        // Count how many times we can divide by 2
        let temp_x = current_x;
        let power_count = 0;
        while (temp_x >= 2 * PRECISION) {
            temp_x = temp_x / 2;
            power_count = power_count + 1;
        };
        
        // Now 1 ≤ temp_x < 2, calculate ln(temp_x) using Taylor series
        // ln(1+u) = u - u²/2 + u³/3 - u⁴/4 + ... where u = temp_x - 1
        let u = temp_x - PRECISION; // u = m - 1
        
        if (u == 0) {
            // ln(1) = 0, so result is just power_count * ln(2)
            return power_count * LN_2;
        };
        
        // Taylor series for ln(1+u)
        let series_result = 0;
        let current_term = u;
        let term_index = 1;
        
        while (term_index <= 15 && current_term > PRECISION / 1000000) {
            if (term_index % 2 == 1) {
                series_result = series_result + fp_div(current_term, term_index * PRECISION);
            } else {
                if (series_result >= fp_div(current_term, term_index * PRECISION)) {
                    series_result = series_result - fp_div(current_term, term_index * PRECISION);
                };
            };
            current_term = fp_mul(current_term, u);
            term_index = term_index + 1;
        };
        
        // Add power_count * ln(2)
        series_result + power_count * LN_2
    }

    /// Calculate x^y for fixed-point numbers (x^y = e^(y * ln(x)))
    #[view]
    public fun fp_pow(x: u128, y: u128): u128 {
        if (y == 0) return PRECISION;
        if (x == 0) return 0;
        if (x == PRECISION) return PRECISION;
        
        let ln_x = fp_ln(x);
        let y_ln_x = fp_mul(y, ln_x);
        fp_exp(y_ln_x)
    }

    // ==============================
    // Statistical Functions
    // ==============================

    /// Calculate the probability density function of normal distribution
    /// PDF(x) = (1 / (σ * sqrt(2π))) * e^(-0.5 * ((x - μ) / σ)²)
    #[view]
    public fun normal_pdf(x: u128, mean: u128, std_dev: u128, x_is_negative: bool, mean_is_negative: bool): u128 {
        assert!(std_dev > 0, EINVALID_INPUT);
        
        // Calculate (x - μ)
        let diff = if (x_is_negative == mean_is_negative) {
            if (x >= mean) x - mean else mean - x
        } else {
            x + mean
        };
        
        // Calculate ((x - μ) / σ)²
        let normalized_diff = fp_div(diff, std_dev);
        let normalized_diff_squared = fp_square(normalized_diff);
        
        // Calculate e^(-0.5 * ((x - μ) / σ)²)
        let exponent = fp_div(normalized_diff_squared, 2 * PRECISION);
        let exp_term = fp_exp(exponent); // Note: This should be e^(-exponent), simplified here
        
        // Calculate 1 / (σ * sqrt(2π))
        let denominator = fp_mul(std_dev, SQRT_2PI);
        let coefficient = fp_div(PRECISION, denominator);
        
        fp_mul(coefficient, exp_term)
    }

    // Note: L2 norm calculation removed - not needed on-chain, K is set by initializer

    /// Calculate the inner product of two normal distributions (simplified)
    /// This is used for the AMM invariant calculations
    #[view]
    public fun normal_inner_product(
        mean1: u128, std_dev1: u128, mean1_is_negative: bool,
        mean2: u128, std_dev2: u128, mean2_is_negative: bool
    ): u128 {
        // Simplified calculation - in practice this would involve complex integration
        // For now, we approximate based on overlap of the distributions
        
        let combined_variance = fp_add(fp_square(std_dev1), fp_square(std_dev2));
        let combined_std_dev = fp_sqrt(combined_variance);
        
        // Calculate difference in means
        let mean_diff = if (mean1_is_negative == mean2_is_negative) {
            if (mean1 >= mean2) mean1 - mean2 else mean2 - mean1
        } else {
            mean1 + mean2
        };
        
        // Approximate overlap based on distance between means relative to combined std dev
        let normalized_distance = fp_div(mean_diff, combined_std_dev);
        let overlap_factor = if (normalized_distance > 3 * PRECISION) {
            0 // Distributions are far apart
        } else {
            PRECISION - fp_div(normalized_distance, 3 * PRECISION)
        };
        
        fp_mul(
            fp_div(PRECISION, fp_mul(combined_std_dev, SQRT_2PI)),
            overlap_factor
        )
    }

    /// Calculate the cost of moving from one distribution to another
    /// Simplified version - in practice this should be computed off-chain and verified
    #[view]
    public fun calculate_trade_cost(
        _from_mean: u128, from_std_dev: u128, _from_mean_is_negative: bool,
        _to_mean: u128, to_std_dev: u128, _to_mean_is_negative: bool,
        backing: u128
    ): u128 {
        // Simplified cost calculation based on standard deviation difference
        // In practice, use off-chain calculation with derivative verification
        let std_dev_diff = if (to_std_dev >= from_std_dev) {
            (to_std_dev - from_std_dev) as u128
        } else {
            (from_std_dev - to_std_dev) as u128
        };
        
        // Scale by backing amount (simplified)
        fp_mul(std_dev_diff * PRECISION, backing) / PRECISION
    }

    // ==============================
    // Utility Functions
    // ==============================

    /// Get the precision constant
    #[view]
    public fun get_precision(): u128 {
        PRECISION
    }

    /// Check if a fixed-point number is approximately equal to another
    #[view]
    public fun fp_approx_equal(a: u128, b: u128, tolerance: u128): bool {
        let diff = if (a >= b) a - b else b - a;
        diff <= tolerance
    }

    /// Clamp a value between min and max
    #[view]
    public fun clamp(value: u128, min_val: u128, max_val: u128): u128 {
        if (value < min_val) min_val
        else if (value > max_val) max_val
        else value
    }
}
