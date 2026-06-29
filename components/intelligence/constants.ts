import { IntelligenceConfig } from './types';

// BUG FIX: Safe ID generator
export const generateId = () => Math.random().toString(36).substring(2, 11);

// HELPER: Format flags for the AI to process flawlessly
export const formatFlagName = (val: string) =>
  val.trim().toUpperCase().replace(/[\s-]/g, '_');

// THE DEFAULTS: Pre-populated with intelligent linkages
export const DEFAULT_CONFIG: IntelligenceConfig = {
  prompt: `You are an expert painting estimator. Analyze the provided job details and price book to generate a detailed quote.

Instructions:
- Use the price book items provided.
- Apply any relevant context flags as multipliers or flat fees.
- Return only valid JSON matching the example output format.
- Do not include explanations outside the JSON.`,

  priceBook: [
    { id: generateId(), name: 'Base Call-out Fee', amount: 0, type: 'FLAT_FEE' },
    { id: generateId(), name: 'Standard Paint Cost', amount: 45, type: 'UNIT_COST', unit: 'gallon' },
    { id: generateId(), name: 'Paint Coverage', amount: 350, type: 'UNIT_COST', unit: 'sqft/gal' },
    { id: generateId(), name: 'Number of Coats', amount: 2, type: 'MULTIPLIER' },
    { id: generateId(), name: 'OCCUPIED_HOME', amount: 1.2, type: 'MULTIPLIER' },
    { id: generateId(), name: 'RUSH_JOB', amount: 150, type: 'FLAT_FEE' },
  ],

  contextFlags: ['HIGH_CIELINGS', 'RUSH_JOB', 'OCCUPIED_HOME'],

  examples: [
    {
      input: 'Paint a 12x12 bedroom with 8ft ceilings. Two coats. Homeowner is living in the house.',
      flags: ['OCCUPIED_HOME'],
      output: {
        lineItems: [
          { name: 'Base Call-out Fee', amount: 0 },
          { name: 'Standard Paint Cost', amount: 90 },
          { name: 'OCCUPIED_HOME', amount: 18 },
        ],
        total: 108,
      },
    },
  ],
};

