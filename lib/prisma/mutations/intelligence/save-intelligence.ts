import { prisma } from "@/lib/prisma";

export async function updateIntelligenceSettings(
  intelligenceId: string, 
  data: {
    pricingRules?: any[];
    prompt?: string;
    contextFlags?: any;
  }
) {
  const updateData: any = {};

  // Dynamically map standard fields
  if (data.prompt !== undefined) updateData.prompt = data.prompt;
  if (data.contextFlags !== undefined) updateData.contextFlags = data.contextFlags;

  // Handle nested relational replacement for rules
  if (data.pricingRules && Array.isArray(data.pricingRules)) {
    updateData.pricingRules = {
      deleteMany: {}, // Safely wipes old rules
      create: data.pricingRules.map((rule: any) => ({
        name: rule.name,
        chargeType: rule.chargeType,
        unitName: rule.unitName,
        amount: rule.amount,
        isMultiplier: rule.isMultiplier,
        multiplier: rule.multiplier,
        multiplierTarget: rule.multiplierTarget,
      })),
    };
  }

  // Execute the single atomic update
  return await prisma.intelligence.update({
    where: { id: intelligenceId },
    data: updateData,
    include: {
      pricingRules: true, // Returns the fresh rules with real DB IDs
    },
  });
}