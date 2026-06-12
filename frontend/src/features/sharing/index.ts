/**
 * Sharing feature — barrel exports.
 */

// Hook
export { useDashboardUrlSync } from "./hooks/useDashboardUrlSync";

// Components
export { ShareButton } from "./components/ShareButton";

// Utilities (useful for testing)
export {
  serializeDashboardState,
  deserializeDashboardState,
  paramsEqual,
  hasNonDefaultState,
} from "./utils/url-serializer";

export type { DashboardUrlState } from "./utils/url-serializer";
