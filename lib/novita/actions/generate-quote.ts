import { LLM_MODELS, novitaAI } from "../config"

interface QuoteItem {
  title: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  price: number;
}

interface QuoteContext {
  roomType?: string;
  prompt?: string;
  colorNames?: string;
}

interface GenerateQuoteResult {
  items: QuoteItem[];
  totalAmount: number;
}

export async function generateQuote(context: QuoteContext): Promise<GenerateQuoteResult> {
  const { roomType = "Interior Room", prompt = "Paint the room", colorNames = "Standard White" } = context;

  const systemPrompt = `You are a professional painting contractor estimator.
Generate a realistic, detailed quote based on this customer info:
- Room Type: ${roomType}
- Customer Request: "${prompt}"
- Colors Chosen: ${colorNames}

Output ONLY valid JSON with an "items" array. Each item must have:
- title (string)
- description (string)
- quantity (number)
- unit (string, e.g. "Gallons", "Hours", "Room")
- unitPrice (number)
- price (number = quantity * unitPrice)

Example output:
 {
      title: "Wall Preparation & Patching",
      description: "Sanding, patching minor holes, caulking gaps, and applying premium primer to ensure a smooth surface.",
      quantity: 1,
      unit: "Room",
      unitPrice: 350.00,
      price: 350.00,
    },
    {
      title: "Benjamin Moore Aura® Interior Paint",
      description: "Color: Salamander (2050-10) • Finish: Matte",
      quantity: 3,
      unit: "Gallons",
      unitPrice: 95.00,
      price: 285.00,
    },
    {
      title: "Painting Labor",
      description: "Cut and roll 2 coats to interior walls and edge detailing.",
      quantity: 12,
      unit: "Hours",
      unitPrice: 65.00,
      price: 780.00,
    },
    {
      title: "Consumables & Protection",
      description: "Drop cloths, masking tape, poly plastic, and environmentally responsible disposal.",
      quantity: 1,
      unit: "Kit",
      unitPrice: 85.00,
      price: 85.00,
    },

`;

  const completion = await novitaAI.chat.completions.create({
    model: LLM_MODELS.MINI_MAX_M3,
    messages: [{ role: "system", content: systemPrompt }],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw);

  const items: QuoteItem[] = Array.isArray(parsed.items) ? parsed.items : [];
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return { items, totalAmount };
}