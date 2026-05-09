export interface PaintColor {
  name: string;
  code: string;
  hex: string;
  brand?: string;

  family:
    | "white"
    | "black"
    | "gray"
    | "greige"
    | "beige"
    | "brown"
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "pink"
    | "teal";

  tone: "warm" | "cool" | "neutral";

  lightness: "light" | "medium" | "dark";
}

export type BrandId =
  | "sherwin_williams"
  | "benjamin_moore"
  | "behr"
  | "ral";

export const COLOR_SHADES: Record<BrandId, PaintColor[]> = {
  sherwin_williams: [
    {
      name: "Agreeable Gray",
      code: "SW 7029",
      hex: "#D1CBC1",
      family: "greige",
      tone: "warm",
      lightness: "light",
    },
    {
      name: "Alabaster",
      code: "SW 7008",
      hex: "#EDE8DA",
      family: "white",
      tone: "warm",
      lightness: "light",
    },
    {
      name: "Naval",
      code: "SW 6244",
      hex: "#3A4456",
      family: "blue",
      tone: "cool",
      lightness: "dark",
    },
    {
      name: "Evergreen Fog",
      code: "SW 9130",
      hex: "#8F9E8D",
      family: "green",
      tone: "neutral",
      lightness: "medium",
    },
  ],

  benjamin_moore: [
    {
      name: "Chantilly Lace",
      code: "OC-65",
      hex: "#F5F3EE",
      family: "white",
      tone: "neutral",
      lightness: "light",
    },
    {
      name: "Pale Oak",
      code: "OC-20",
      hex: "#D4C9B8",
      family: "greige",
      tone: "warm",
      lightness: "light",
    },
    {
      name: "Aegean Teal",
      code: "2136-40",
      hex: "#5B8585",
      family: "teal",
      tone: "cool",
      lightness: "medium",
    },
    {
      name: "Hale Navy",
      code: "HC-154",
      hex: "#434B56",
      family: "blue",
      tone: "cool",
      lightness: "dark",
    },
  ],

  behr: [
    {
      name: "Cracked Pepper",
      code: "PPU18-01",
      hex: "#3C3A38",
      family: "black",
      tone: "neutral",
      lightness: "dark",
    },
    {
      name: "Rumors",
      code: "N120-7",
      hex: "#7A3545",
      family: "red",
      tone: "warm",
      lightness: "dark",
    },
    {
      name: "Even Better Beige",
      code: "DC-010",
      hex: "#C9B89E",
      family: "beige",
      tone: "warm",
      lightness: "light",
    },
    {
      name: "Boreal",
      code: "N420-5",
      hex: "#3E5C4E",
      family: "green",
      tone: "cool",
      lightness: "dark",
    },
  ],

  ral: [
    {
      name: "Pure White",
      code: "RAL 9010",
      hex: "#F1ECE1",
      family: "white",
      tone: "warm",
      lightness: "light",
    },
    {
      name: "Jet Black",
      code: "RAL 9005",
      hex: "#0E0E10",
      family: "black",
      tone: "neutral",
      lightness: "dark",
    },
    {
      name: "Anthracite Grey",
      code: "RAL 7016",
      hex: "#293133",
      family: "gray",
      tone: "cool",
      lightness: "dark",
    },
    {
      name: "Traffic Red",
      code: "RAL 3020",
      hex: "#CC0605",
      family: "red",
      tone: "warm",
      lightness: "medium",
    },
  ],
};

export const BRAND_LABELS: Record<BrandId, string> = {
  sherwin_williams: "Sherwin-Williams",
  benjamin_moore: "Benjamin Moore",
  behr: "Behr",
  ral: "RAL",
};


export const MAIN_COLOR_SHADES: Record<BrandId, PaintColor[]> = {
  sherwin_williams: [
    // originals
    { name: "Agreeable Gray",    code: "SW 7029", hex: "#D1CBC1", family: "greige", tone: "warm",    lightness: "light"  },
    { name: "Alabaster",         code: "SW 7008", hex: "#EDE8DA", family: "white",  tone: "warm",    lightness: "light"  },
    { name: "Naval",             code: "SW 6244", hex: "#3A4456", family: "blue",   tone: "cool",    lightness: "dark"   },
    { name: "Evergreen Fog",     code: "SW 9130", hex: "#8F9E8D", family: "green",  tone: "neutral", lightness: "medium" },
    // new
    { name: "Pure White",        code: "SW 7005", hex: "#EEE9DF", family: "white",  tone: "warm",    lightness: "light"  },
    { name: "Extra White",       code: "SW 7006", hex: "#F0ECE3", family: "white",  tone: "warm",    lightness: "light"  },
    { name: "Repose Gray",       code: "SW 7015", hex: "#C2BBB4", family: "gray",   tone: "cool",    lightness: "light"  },
    { name: "Mindful Gray",      code: "SW 7016", hex: "#B5AEA7", family: "gray",   tone: "warm",    lightness: "light"  },
    { name: "Accessible Beige",  code: "SW 7036", hex: "#C9BBA8", family: "beige",  tone: "warm",    lightness: "light"  },
    { name: "Wool Skein",        code: "SW 6148", hex: "#D3C3A4", family: "beige",  tone: "warm",    lightness: "light"  },
    { name: "Sea Salt",          code: "SW 6204", hex: "#B4CFCA", family: "teal",   tone: "cool",    lightness: "light"  },
    { name: "Comfort Gray",      code: "SW 6205", hex: "#9AB8B4", family: "teal",   tone: "cool",    lightness: "medium" },
    { name: "Intellectual Gray", code: "SW 7045", hex: "#9E9891", family: "gray",   tone: "warm",    lightness: "medium" },
    { name: "Urbane Bronze",     code: "SW 7048", hex: "#645D56", family: "brown",  tone: "warm",    lightness: "medium" },
    { name: "Tricorn Black",     code: "SW 6258", hex: "#2B2B2C", family: "black",  tone: "neutral", lightness: "dark"   },
  ],

  benjamin_moore: [
    // originals
    { name: "Chantilly Lace",    code: "OC-65",    hex: "#F5F3EE", family: "white",  tone: "neutral", lightness: "light"  },
    { name: "Pale Oak",          code: "OC-20",    hex: "#D4C9B8", family: "greige", tone: "warm",    lightness: "light"  },
    { name: "Aegean Teal",       code: "2136-40",  hex: "#5B8585", family: "teal",   tone: "cool",    lightness: "medium" },
    { name: "Hale Navy",         code: "HC-154",   hex: "#434B56", family: "blue",   tone: "cool",    lightness: "dark"   },
    // new
    { name: "White Dove",        code: "OC-17",    hex: "#F3F1E7", family: "white",  tone: "warm",    lightness: "light"  },
    { name: "Simply White",      code: "OC-117",   hex: "#F7F4EC", family: "white",  tone: "neutral", lightness: "light"  },
    { name: "Decorators White",  code: "OC-149",   hex: "#F4F2ED", family: "white",  tone: "cool",    lightness: "light"  },
    { name: "Classic Gray",      code: "OC-23",    hex: "#E5DFDA", family: "gray",   tone: "warm",    lightness: "light"  },
    { name: "Gray Owl",          code: "OC-52",    hex: "#C9C7BF", family: "gray",   tone: "neutral", lightness: "light"  },
    { name: "Revere Pewter",     code: "HC-172",   hex: "#C2B9A7", family: "greige", tone: "warm",    lightness: "light"  },
    { name: "Rockport Gray",     code: "HC-105",   hex: "#A5A09A", family: "gray",   tone: "warm",    lightness: "medium" },
    { name: "Chelsea Gray",      code: "HC-168",   hex: "#9CA49C", family: "gray",   tone: "neutral", lightness: "medium" },
    { name: "Kendall Charcoal",  code: "HC-166",   hex: "#5C5F5F", family: "gray",   tone: "cool",    lightness: "dark"   },
    { name: "Newburyport Blue",  code: "HC-155",   hex: "#4D6070", family: "blue",   tone: "cool",    lightness: "dark"   },
    { name: "Wrought Iron",      code: "2124-10",  hex: "#44484B", family: "black",  tone: "cool",    lightness: "dark"   },
  ],

  behr: [
    // originals
    { name: "Cracked Pepper",    code: "PPU18-01", hex: "#3C3A38", family: "black",  tone: "neutral", lightness: "dark"   },
    { name: "Rumors",            code: "N120-7",   hex: "#7A3545", family: "red",    tone: "warm",    lightness: "dark"   },
    { name: "Even Better Beige", code: "DC-010",   hex: "#C9B89E", family: "beige",  tone: "warm",    lightness: "light"  },
    { name: "Boreal",            code: "N420-5",   hex: "#3E5C4E", family: "green",  tone: "cool",    lightness: "dark"   },
    // new
    { name: "Polar Bear",        code: "W-B-600",  hex: "#F0EDE5", family: "white",  tone: "warm",    lightness: "light"  },
    { name: "Bit of Sugar",      code: "W-B-700",  hex: "#EEE9E2", family: "white",  tone: "warm",    lightness: "light"  },
    { name: "Swiss Coffee",      code: "W-F-110",  hex: "#EDE6D9", family: "white",  tone: "warm",    lightness: "light"  },
    { name: "Aged Beige",        code: "N200-3",   hex: "#C9B9A3", family: "beige",  tone: "warm",    lightness: "light"  },
    { name: "Smoky Taupe",       code: "PPU5-4",   hex: "#B5A899", family: "greige", tone: "warm",    lightness: "light"  },
    { name: "Seagull Gray",      code: "N520-2",   hex: "#C9C5BE", family: "gray",   tone: "cool",    lightness: "light"  },
    { name: "Silver Drop",       code: "N520-3",   hex: "#B8B4AE", family: "gray",   tone: "cool",    lightness: "light"  },
    { name: "Blueprint",         code: "S510-5",   hex: "#5B7D99", family: "blue",   tone: "cool",    lightness: "medium" },
    { name: "In the Moment",     code: "S430-4",   hex: "#7A9E8D", family: "green",  tone: "cool",    lightness: "medium" },
    { name: "Dark Everglade",    code: "S430-7",   hex: "#2E4535", family: "green",  tone: "cool",    lightness: "dark"   },
    { name: "Burnished Clay",    code: "M230-6",   hex: "#9C6B4E", family: "brown",  tone: "warm",    lightness: "medium" },
  ],

  ral: [
  // originals
  { name: "Pure White",       code: "RAL 9010", hex: "#F1ECE1", family: "white",  tone: "warm",    lightness: "light"  },
  { name: "Jet Black",        code: "RAL 9005", hex: "#0A0A0A", family: "black",  tone: "neutral", lightness: "dark"   },
  { name: "Anthracite Grey",  code: "RAL 7016", hex: "#293133", family: "gray",   tone: "cool",    lightness: "dark"   },
  { name: "Traffic Red",      code: "RAL 3020", hex: "#CC0605", family: "red",    tone: "warm",    lightness: "medium" },
  // new
  { name: "Cream",            code: "RAL 9001", hex: "#FDF4E3", family: "white",  tone: "warm",    lightness: "light"  },
  { name: "Oyster White",     code: "RAL 1013", hex: "#EAE6CA", family: "beige",  tone: "warm",    lightness: "light"  },
  { name: "Signal Yellow",    code: "RAL 1003", hex: "#E5BE01", family: "yellow", tone: "warm",    lightness: "light"  },
  { name: "Red Orange",       code: "RAL 2001", hex: "#C93C20", family: "orange", tone: "warm",    lightness: "medium" },
  { name: "Wine Red",         code: "RAL 3005", hex: "#5E2129", family: "red",    tone: "warm",    lightness: "dark"   },
  { name: "Heather Violet",   code: "RAL 4003", hex: "#DE4C8A", family: "pink",   tone: "cool",    lightness: "medium" },
  { name: "Ultramarine Blue", code: "RAL 5002", hex: "#20214F", family: "blue",   tone: "cool",    lightness: "dark"   },
  { name: "Pastel Blue",      code: "RAL 5024", hex: "#5D9B9B", family: "teal",   tone: "cool",    lightness: "medium" },
  { name: "Reseda Green",     code: "RAL 6011", hex: "#587246", family: "green",  tone: "neutral", lightness: "medium" },
  { name: "Light Grey",       code: "RAL 7035", hex: "#CBD0CC", family: "gray",   tone: "neutral", lightness: "light"  },
  { name: "Nut Brown",        code: "RAL 8011", hex: "#5B3A29", family: "brown",  tone: "warm",    lightness: "dark"   },
],
};


export const TRENDING_COLOR_SHADES: Record<BrandId, PaintColor[]> = {
  sherwin_williams: [
    {
      name: "Cavern Clay",  // 2019 COY — iconic terracotta
      code: "SW 7701",
      hex: "#BB6B45",
      family: "orange",
      tone: "warm",
      lightness: "medium",
    },
    {
      name: "Passionate",   // ⚠️ code approximate — deep wine berry
      code: "SW 6871",
      hex: "#7C2C47",
      family: "red",
      tone: "warm",
      lightness: "dark",
    },
    {
      name: "Software",     // 2017 COY — bold warm charcoal (the neutral)
      code: "SW 7074",
      hex: "#716A62",
      family: "brown",
      tone: "warm",
      lightness: "dark",
    },
  ],

  benjamin_moore: [
    {
      name: "Blue Nova",    // 2024 COY — dusty periwinkle
      code: "825",
      hex: "#8994B4",
      family: "blue",
      tone: "cool",
      lightness: "medium",
    },
    {
      name: "Caliente",     // flagship bold red, widely documented
      code: "AF-290",
      hex: "#C03535",
      family: "red",
      tone: "warm",
      lightness: "medium",
    },
    {
      name: "Salamander",   // deep forest green — the neutral anchor
      code: "2050-10",
      hex: "#3C4A3E",
      family: "green",
      tone: "cool",
      lightness: "dark",
    },
  ],

  behr: [
    {
      name: "Breezeway",    // 2022 COY — soft aqua mint
      code: "MQ3-21",
      hex: "#87BCB8",
      family: "teal",
      tone: "cool",
      lightness: "light",
    },
    {
      name: "Terra Cotta",  // ⚠️ code approximate — warm earthy clay
      code: "PPU3-16",
      hex: "#BA6543",
      family: "orange",
      tone: "warm",
      lightness: "medium",
    },
    {
      name: "Dark Ash",     // ⚠️ code approximate — bold warm charcoal (the neutral)
      code: "N510-5",
      hex: "#4D4944",
      family: "gray",
      tone: "warm",
      lightness: "dark",
    },
  ],

  ral: [
    {
      name: "Reseda Green", // RAL 6011 — muted sage, huge in EU interiors
      code: "RAL 6011",
      hex: "#587246",
      family: "green",
      tone: "neutral",
      lightness: "medium",
    },
    {
      name: "Red Lilac",    // RAL 4001 — dusty mauve/purple
      code: "RAL 4001",
      hex: "#8D6879",
      family: "purple",
      tone: "cool",
      lightness: "medium",
    },
    {
      name: "Beige Brown",  // RAL 8024 — warm camel (the neutral)
      code: "RAL 8024",
      hex: "#A07241",
      family: "brown",
      tone: "warm",
      lightness: "medium",
    },
  ],
};