// File: lib/paint-config.ts (or wherever you prefer to keep configs)

export interface PaintColor {
  name: string;
  code: string;
  hex: string;
  brand?: string;
  family: string;
  tone: "warm" | "cool" | "neutral";
  lightness: "light" | "medium" | "dark";
}

export type BrandId = "sherwin_williams" | "benjamin_moore" | "behr" | "ral";

export const BRAND_LABELS: Record<BrandId, string> = {
  sherwin_williams: "Sherwin-Williams",
  benjamin_moore: "Benjamin Moore",
  behr: "Behr",
  ral: "RAL",
};

export const TRENDING_COLOR_SHADES: Record<BrandId, PaintColor[]> = {
  sherwin_williams: [
    { name: "Cavern Clay", code: "SW 7701", hex: "#BB6B45", family: "orange", tone: "warm", lightness: "medium" },
    { name: "Passionate", code: "SW 6871", hex: "#7C2C47", family: "red", tone: "warm", lightness: "dark" },
    { name: "Software", code: "SW 7074", hex: "#716A62", family: "brown", tone: "warm", lightness: "dark" },
  ],
  benjamin_moore: [
    { name: "Blue Nova", code: "825", hex: "#8994B4", family: "blue", tone: "cool", lightness: "medium" },
    { name: "Caliente", code: "AF-290", hex: "#C03535", family: "red", tone: "warm", lightness: "medium" },
    { name: "Salamander", code: "2050-10", hex: "#3C4A3E", family: "green", tone: "cool", lightness: "dark" },
  ],
  behr: [
    { name: "Breezeway", code: "MQ3-21", hex: "#87BCB8", family: "teal", tone: "cool", lightness: "light" },
    { name: "Terra Cotta", code: "PPU3-16", hex: "#BA6543", family: "orange", tone: "warm", lightness: "medium" },
    { name: "Dark Ash", code: "N510-5", hex: "#4D4944", family: "gray", tone: "warm", lightness: "dark" },
  ],
  ral: [
    { name: "Reseda Green", code: "RAL 6011", hex: "#587246", family: "green", tone: "neutral", lightness: "medium" },
    { name: "Red Lilac", code: "RAL 4001", hex: "#8D6879", family: "purple", tone: "cool", lightness: "medium" },
    { name: "Beige Brown", code: "RAL 8024", hex: "#A07241", family: "brown", tone: "warm", lightness: "medium" },
  ],
};

export const MAIN_COLOR_SHADES: Record<BrandId, PaintColor[]> = {
  sherwin_williams: [
    { name: "Agreeable Gray", code: "SW 7029", hex: "#D1CBC1", family: "greige", tone: "warm", lightness: "light" },
    { name: "Naval", code: "SW 6244", hex: "#3A4456", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Evergreen Fog", code: "SW 9130", hex: "#8F9E8D", family: "green", tone: "neutral", lightness: "medium" },
    { name: "Tricorn Black", code: "SW 6258", hex: "#2B2B2C", family: "black", tone: "neutral", lightness: "dark" },
  ],
  benjamin_moore: [
    { name: "Chantilly Lace", code: "OC-65", hex: "#F5F3EE", family: "white", tone: "neutral", lightness: "light" },
    { name: "Pale Oak", code: "OC-20", hex: "#D4C9B8", family: "greige", tone: "warm", lightness: "light" },
    { name: "Aegean Teal", code: "2136-40", hex: "#5B8585", family: "teal", tone: "cool", lightness: "medium" },
    { name: "Hale Navy", code: "HC-154", hex: "#434B56", family: "blue", tone: "cool", lightness: "dark" },
  ],
  behr: [
    { name: "Cracked Pepper", code: "PPU18-01", hex: "#3C3A38", family: "black", tone: "neutral", lightness: "dark" },
    { name: "Rumors", code: "N120-7", hex: "#7A3545", family: "red", tone: "warm", lightness: "dark" },
    { name: "Even Better Beige", code: "DC-010", hex: "#C9B89E", family: "beige", tone: "warm", lightness: "light" },
    { name: "Boreal", code: "N420-5", hex: "#3E5C4E", family: "green", tone: "cool", lightness: "dark" },
  ],
  ral: [
    { name: "Pure White", code: "RAL 9010", hex: "#F1ECE1", family: "white", tone: "warm", lightness: "light" },
    { name: "Jet Black", code: "RAL 9005", hex: "#0E0E10", family: "black", tone: "neutral", lightness: "dark" },
    { name: "Anthracite Grey", code: "RAL 7016", hex: "#293133", family: "gray", tone: "cool", lightness: "dark" },
    { name: "Traffic Red", code: "RAL 3020", hex: "#CC0605", family: "red", tone: "warm", lightness: "medium" },
  ],
};