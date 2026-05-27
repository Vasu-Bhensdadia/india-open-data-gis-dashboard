/**
 * Default filter configurations and factory functions.
 *
 * Provides:
 * - Default filter values for initialization
 * - Filter preset configurations
 * - Factory functions for common filter patterns
 */

import type { FilterConfig } from "../types/filter.types";

/**
 * Default filter configuration with all filters disabled.
 */
export const DEFAULT_FILTER_CONFIG: FilterConfig = {
  party: {
    type: "set",
    values: new Set(),
    enabled: false,
  },
  state: {
    type: "set",
    values: new Set(),
    enabled: false,
  },
  marginPercentage: {
    type: "range",
    min: 0,
    max: 100,
    enabled: false,
  },
  totalVotes: {
    type: "range",
    min: 0,
    max: 10000000,
    enabled: false,
  },
  winnerVotes: {
    type: "range",
    min: 0,
    max: 10000000,
    enabled: false,
  },
};

/**
 * Preset: Show only constituencies with high victory margins.
 */
export const PRESET_HIGH_MARGIN: Partial<FilterConfig> = {
  marginPercentage: {
    type: "range",
    min: 30,
    max: 100,
    enabled: true,
  },
};

/**
 * Preset: Show only constituencies with close contests.
 */
export const PRESET_CLOSE_CONTEST: Partial<FilterConfig> = {
  marginPercentage: {
    type: "range",
    min: 0,
    max: 10,
    enabled: true,
  },
};

/**
 * Preset: Show only high-participation constituencies.
 */
export const PRESET_HIGH_TURNOUT: Partial<FilterConfig> = {
  totalVotes: {
    type: "range",
    min: 1200000,
    max: 10000000,
    enabled: true,
  },
};

/**
 * Preset: Show only low-participation constituencies.
 */
export const PRESET_LOW_TURNOUT: Partial<FilterConfig> = {
  totalVotes: {
    type: "range",
    min: 0,
    max: 800000,
    enabled: true,
  },
};

/**
 * Filter value constraints for validation.
 */
export const FILTER_CONSTRAINTS = {
  marginPercentage: {
    min: 0,
    max: 100,
    step: 0.5,
  },
  totalVotes: {
    min: 0,
    max: 10000000,
    step: 100000,
  },
  winnerVotes: {
    min: 0,
    max: 10000000,
    step: 100000,
  },
};

/**
 * Common political parties in Indian elections.
 */
export const POLITICAL_PARTIES = [
  "Bharatiya Janata Party",
  "Indian National Congress",
  "All India Trinamool Congress",
  "Samajwadi Party",
  "Dravida Munnetra Kazhagam",
  "Telugu Desam",
  "Janata Dal (United)",
  "Shiv Sena",
  "Yuvajana Sramika Rythu Congress Party",
  "Communist Party of India (Marxist)",
  "Biju Janata Dal",
  "Nationalist Congress Party",
];

/**
 * Common Indian states.
 */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

/**
 * Factory function to create a party filter.
 */
export function createPartyFilter(
  parties: string[],
  enabled: boolean = true,
): FilterConfig["party"] {
  return {
    type: "set",
    values: new Set(parties),
    enabled,
  };
}

/**
 * Factory function to create a state filter.
 */
export function createStateFilter(
  states: string[],
  enabled: boolean = true,
): FilterConfig["state"] {
  return {
    type: "set",
    values: new Set(states),
    enabled,
  };
}

/**
 * Factory function to create a margin percentage filter.
 */
export function createMarginFilter(
  min: number,
  max: number,
  enabled: boolean = true,
): FilterConfig["marginPercentage"] {
  return {
    type: "range",
    min: Math.max(0, Math.min(min, 100)),
    max: Math.max(0, Math.min(max, 100)),
    enabled,
  };
}

/**
 * Factory function to create a total votes filter.
 */
export function createTotalVotesFilter(
  min: number,
  max: number,
  enabled: boolean = true,
): FilterConfig["totalVotes"] {
  return {
    type: "range",
    min: Math.max(0, min),
    max: Math.max(0, max),
    enabled,
  };
}

/**
 * Factory function to create a winner votes filter.
 */
export function createWinnerVotesFilter(
  min: number,
  max: number,
  enabled: boolean = true,
): FilterConfig["winnerVotes"] {
  return {
    type: "range",
    min: Math.max(0, min),
    max: Math.max(0, max),
    enabled,
  };
}

/**
 * Combine multiple filter presets.
 */
export function combinePresets(...presets: Partial<FilterConfig>[]): Partial<FilterConfig> {
  return presets.reduce(
    (acc, preset) => ({
      ...acc,
      ...preset,
    }),
    {},
  );
}

/**
 * Get filter suggestions based on data statistics.
 */
export function getSuggestedFilters(
  totalFeatures: number,
  filteredCount: number,
): Array<{ description: string; filter: Partial<FilterConfig> }> {
  const suggestions: Array<{ description: string; filter: Partial<FilterConfig> }> = [];

  const filterPercentage = (filteredCount / totalFeatures) * 100;

  // Suggest high-margin filter if many features have low margins
  if (filterPercentage < 20) {
    suggestions.push({
      description: "Show only close contests",
      filter: PRESET_CLOSE_CONTEST,
    });
  }

  // Suggest low-turnout filter if many features have high turnout
  suggestions.push({
    description: "Show high-margin wins",
    filter: PRESET_HIGH_MARGIN,
  });

  return suggestions;
}
