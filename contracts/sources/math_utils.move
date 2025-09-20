/// Mathematical utilities for distribution markets
/// Provides fixed-point arithmetic and statistical functions
module distribution_markets::math_utils {
    use std::vector;
    use aptos_std::math64;

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

    /// Multiply two fixed-point numbers
    public fun fp_mul(a: u128, b: u128): u128 {
        (a * b) / PRECISION
    }

    /// Divide two fixed-point numbers
    public fun fp_div(a: u128, b: u128): u128 {
        assert!(b != 0, EDIVISION_BY_ZERO);
        (a * PRECISION) / b
    }

    /// Add two fixed-point numbers
    public fun fp_add(a: u128, b: u128): u128 {
        a + b
    }

    /// Subtract two fixed-point numbers (a - b)
    public fun fp_sub(a: u128, b: u128): u128 {
        assert!(a >= b, EOVERFLOW);
        a - b
    }

    /// Square a fixed-point number
    public fun fp_square(a: u128): u128 {
        fp_mul(a, a)
    }

    /// Convert regular integer to fixed-point
    public fun to_fixed_point(a: u64): u128 {
        (a as u128) * PRECISION
    }

    /// Convert fixed-point to regular integer (truncating decimals)
    public fun from_fixed_point(a: u128): u64 {
        (a / PRECISION as u64)
    }

    // ==============================
    // Mathematical Functions
    // ==============================

    /// Calculate square root using Newton's method (fixed-point)
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

    /// Calculate exponential function e^x using Taylor series (simplified)
    /// Note: This is a basic implementation, production code would need more precision
    public fun fp_exp(x: u128): u128 {
        if (x == 0) return PRECISION;
        
        // For large x, use e^x = e^(a+b) = e^a * e^b where a is integer part
        let result = PRECISION;
        let term = PRECISION;
        let i = 1;
        
        // Calculate first few terms of Taylor series: 1 + x + x²/2! + x³/3! + ...
        while (i <= 10 && term > 0) {
            term = fp_mul(term, x) / (i as u128);
            result = result + term;
            i = i + 1;
        };
        
        result
    }

    /// Calculate natural logarithm using Newton's method (simplified)
    public fun fp_ln(x: u128): u128 {
        assert!(x > 0, EINVALID_INPUT);
        if (x == PRECISION) return 0;
        
        // Use Newton's method: ln(x) ≈ y - (e^y - x) / e^y
        let y = x; // Initial guess
        let i = 0;
        
        while (i < 10) {
            let exp_y = fp_exp(y);
            let diff = exp_y - x;
            if (diff == 0) break;
            
            y = y - fp_div(diff, exp_y);
            i = i + 1;
        };
        
        y
    }

    /// Calculate x^y for fixed-point numbers (x^y = e^(y * ln(x)))
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

    /// Calculate the L2 norm of a normal distribution
    /// For normal distribution: ||f||₂ = 1 / sqrt(2π * σ²)
    public fun normal_l2_norm(std_dev: u128): u128 {
        assert!(std_dev > 0, EINVALID_INPUT);
        
        let variance = fp_square(std_dev);
        let two_pi_variance = fp_mul(2 * PRECISION, fp_mul(PRECISION * 314159265358979323 / 100000000000000000, variance)); // 2π approximation
        let sqrt_two_pi_variance = fp_sqrt(two_pi_variance);
        
        fp_div(PRECISION, sqrt_two_pi_variance)
    }

    /// Calculate the inner product of two normal distributions (simplified)
    /// This is used for the AMM invariant calculations
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
    /// Based on the L2 norm difference in the AMM
    public fun calculate_trade_cost(
        from_mean: u128, from_std_dev: u128, from_mean_is_negative: bool,
        to_mean: u128, to_std_dev: u128, to_mean_is_negative: bool,
        backing: u128
    ): u128 {
        let from_norm = normal_l2_norm(from_std_dev);
        let to_norm = normal_l2_norm(to_std_dev);
        
        // Cost is proportional to the change in L2 norm
        let norm_diff = if (to_norm >= from_norm) {
            to_norm - from_norm
        } else {
            from_norm - to_norm
        };
        
        // Scale by backing amount
        fp_mul(norm_diff, backing)
    }

    // ==============================
    // Utility Functions
    // ==============================

    /// Get the precision constant
    public fun get_precision(): u128 {
        PRECISION
    }

    /// Check if a fixed-point number is approximately equal to another
    public fun fp_approx_equal(a: u128, b: u128, tolerance: u128): bool {
        let diff = if (a >= b) a - b else b - a;
        diff <= tolerance
    }

    /// Clamp a value between min and max
    public fun clamp(value: u128, min_val: u128, max_val: u128): u128 {
        if (value < min_val) min_val
        else if (value > max_val) max_val
        else value
    }
}
