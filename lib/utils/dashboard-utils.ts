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

export function formatProjectScope(scope: string): string {
  const scopeMap: Record<string, string> = {
    INTERIOR: "Interior",
    EXTERIOR: "Exterior",
    CABINETS: "Cabinets",
    DECK_FENCE: "Deck/Fence",
    UNKNOWN: "Unknown"
  };
  
  return scopeMap[scope] || scope;
}