// Market interface - only types, no data
export interface Market {
  id: string;
  title: string;
  description: string;
  volume: number;
  categories: string[];
  iconName: string;
  address: string;
  startDate: string;
  endDate: string;
  isBookmarked?: boolean;
  market_mean: number;
  market_mean_min: number;
  market_mean_max: number;
  market_standard_deviation: number;
  market_standard_deviation_min: number;
  market_standard_deviation_max: number;
  min_sigma: number;
  Lambda: number;
  peak_p: number;
  headroom: number;
  s: number;
  mu_per_one: number;
  sigma_per_one: number;
  x_axis_field_name: string;
  x_axis_short_form: string;
  aicontext: string;
}

// No data exports - everything comes from API now
