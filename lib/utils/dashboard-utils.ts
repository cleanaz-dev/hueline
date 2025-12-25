//lib/utils/dashboard-utils.ts

export function getEstimatedValueRange(value: number): string {
  if (value === 0) return "N/A";
  
  // Create ±20% range around the AI estimate
  const lower = Math.round(value * 0.8 / 50) * 50; // Round to nearest $50
  const upper = Math.round(value * 1.2 / 50) * 50;
  
  return `$${lower.toLocaleString()}-$${upper.toLocaleString()}`;
}


export function formatCallReason(reason: string): string {
  const reasonMap: Record<string, string> = {
    NEW_PROJECT: "New Project",
    STATUS_UPDATE: "Status Update",
    COLOR_CHANGE: "Color Change",
    PRICING: "Pricing Inquiry",
    FOLLOW_UP: "Follow Up",
    OTHER: "Other"
  };
  
  return reasonMap[reason] || reason;
}

export const formatProjectScope = (scope: string | string[] | undefined | null): string => {
  if (!scope) return "Unknown";
  
  // Handle array case
  if (Array.isArray(scope)) {
    if (scope.length === 0) return "Unknown";
    if (scope.length === 1) return scope[0];
    // For multiple scopes, join them
    return scope.join(", ");
  }
  
  // Handle legacy string case (for backward compatibility)
  return scope;
};