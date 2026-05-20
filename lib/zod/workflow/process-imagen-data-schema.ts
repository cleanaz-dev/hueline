import z from "zod";

export const processImagenDataSchema = z.object({
  // ---- Always present ----
  colorBrand: z.string(),
  colorName: z.string(),
  colorCode: z.string(),
  colorHex: z.string(),
  originalImageS3Key: z.string(),
  newImagenS3Key: z.string({ message: "Missing newImagenKey" }),
  deliveryMethod: z.enum(["SMS", "EMAIL"], { message: "Missing deliveryMethod" }),
  customerId: z.string(),
  subdomainId: z.string({ message: "Missing subdomainId" }),
  customerName: z.string().nullable().optional().transform(v => v || "Client"),

  // ---- Optional depending on trigger ----
  roomType: z.string().optional(),
  colorSwatchKey: z.string().optional(),
  removeFurniture: z.boolean().optional(),
  huelineId: z.string().nullable().optional(),
  designId: z.string().optional(), // ✅ only needed for design studio
  customerEmail: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  operatorId: z.string().nullable().optional(),
});

export type ProcessImagenData = z.infer<typeof processImagenDataSchema>