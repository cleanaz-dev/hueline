export type PricingCategory = 'FLAT_FEE' | 'UNIT_COST' | 'EQUIPMENT' | 'MULTIPLIER';

export interface PricingItem {
  id: string;
  name: string;
  amount: number;
  type: PricingCategory;
  unit?: string;
}


export interface IntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: IntelligenceConfig | null;

}

export interface IntelligenceExample {
  input: string;
  flags?: string[];
  output?: {
    lineItems: { name: string; amount: number }[];
    total: number;
  };
}

export interface IntelligenceConfig {
  prompt: string;
  priceBook: PricingItem[];
  contextFlags: string[];
  examples: IntelligenceExample[];
}

export type IntelligenceTab = 'priceBook' | 'rules';
