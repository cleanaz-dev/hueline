export type PricingCategory = 'FLAT_FEE' | 'UNIT_COST' | 'EQUIPMENT' | 'MULTIPLIER';

export interface PricingItem {
  id: string;
  name: string;
  amount: number;
  type: PricingCategory;
  unit?: string;

  // NEW:
  isModifier?: boolean;          // true if this item is a conditional modifier
  trigger?: string;              // AI trigger word, e.g. "VAULTED_CEILINGS"
  modifierType?: PricingCategory; // override type when in modifier mode
  modifierAmount?: number;       // optional amount override when modifier is active
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

export type IntelligenceTab = 'priceBook' | 'rules' | 'modifiers'
