import z from "zod";


export const designImagenBodySchema = z.object({
  brand: z.enum(["sherwin_williams", "benjamin_moore", "behr", "ral"] as const),
  code: z.string(),
  hex: z.string(),
  name: z.string(),
  removeFurniture: z.boolean(),
  huelineId: z.string().optional(),
  customerId: z.string().optional(),
  deliveryMethod: z.enum(["SMS", "EMAIL"]).nullable(),
});

export type DesignImagenBody = z.infer<typeof designImagenBodySchema>


export const designImagenLambdaIngestSchema = z.object({
  newImagenS3Key: z.string(),
  compressedS3Key: z.string().optional(),
  systemTaskId: z.string(),
  action: z.enum(["OPERATOR_IMAGEN", "FOLLOWUP_IMAGEN", "CLIENT_IMAGEN", "NEW_DESIGN_STUDIO_IMAGEN", "EXISTING_DESIGN_STUDIO_IMAGEN", "AI_IMAGEN"]),
})

export type DesignImagenLambdaIngestBody = z.infer<typeof designImagenLambdaIngestSchema>