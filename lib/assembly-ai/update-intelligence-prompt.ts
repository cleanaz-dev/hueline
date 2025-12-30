// lib/assembly-ai/update-intelligence-prompt.ts

// --- TYPES ---
type VariableType = 'FEE' | 'MULTIPLIER';

interface VariableData {
  value: number;
  type: VariableType;
  label: string;
}

// Constant separator to identify where User text ends and System text begins
const SYSTEM_BLOCK_SEPARATOR = "\n\n*** SYSTEM CONFIGURATION (DO NOT EDIT BELOW) ***";

/**
 * Generates the internal system block listing available variables.
 */
const generateSystemContext = (values: Record<string, any>, schema: Record<string, any>) => {
  let context = "\nThe following variables are available for use in calculations. \nReference them using {{variable_name}}.\n";

  // 1. Parse and Sort Variables
  const entries = Object.entries(values).map(([key, raw]) => {
    // Handle legacy numbers vs Rich Objects
    if (typeof raw === 'number') {
      return { key, value: raw, type: 'FEE' as VariableType, label: key };
    }
    return { key, ...raw } as VariableData & { key: string };
  });

  const fees = entries.filter(v => v.type === 'FEE');
  const multipliers = entries.filter(v => v.type === 'MULTIPLIER');

  // 2. Build Fee Section
  if (fees.length > 0) {
    context += "\n[Base Costs & Flat Fees]\n";
    fees.forEach(item => {
      context += `- {{${item.key}}}: ${item.label || item.key} (Default: $${item.value})\n`;
    });
  }

  // 3. Build Multiplier Section
  if (multipliers.length > 0) {
    context += "\n[Multipliers & Logic Factors]\n";
    multipliers.forEach(item => {
      context += `- {{${item.key}}}: ${item.label || item.key} (Default: ${item.value}x)\n`;
    });
  }

  // 4. Build Flags Section
  const flags = Object.keys(schema).filter(k => schema[k] === 'boolean');
  if (flags.length > 0) {
    context += "\n[Context Flags] (Boolean - true/false)\n";
    flags.forEach(f => {
      context += `- ${f}\n`;
    });
  }

  return context;
};

/**
 * Main function to merge User Prompt with System Configuration.
 */
export const updateIntelligencePrompt = (
  currentPrompt: string, 
  values: Record<string, any>, 
  schema: Record<string, any>
): string => {
  
  // 1. Clean the prompt (Remove old system block)
  let cleanPrompt = currentPrompt || "";
  if (cleanPrompt.includes(SYSTEM_BLOCK_SEPARATOR)) {
    cleanPrompt = cleanPrompt.split(SYSTEM_BLOCK_SEPARATOR)[0].trim();
  }

  // 2. Generate new system block
  const newSystemBlock = generateSystemContext(values, schema);

  // 3. Return combined string
  return cleanPrompt + SYSTEM_BLOCK_SEPARATOR + newSystemBlock;
};