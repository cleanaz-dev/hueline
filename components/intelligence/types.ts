// --- TYPES (These now match your Prisma Schema) ---
export type PricingRule = {
  id: string; // Used locally for React keys until saved
  name: string;
  chargeType: 'FLAT' | 'PER_UNIT';
  unitName?: string;
  amount: number;
  isMultiplier: boolean;
  multiplier: number;
  multiplierTarget: 'TOTAL' | 'LABOR' | 'MATERIALS';
};

export type IntelligenceConfig = {
  pricingRules: PricingRule[];
};
