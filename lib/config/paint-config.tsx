// Source: jpederson/colornerd — hex values from scraped brand data
// family/tone/lightness computed from HSL; manually corrected for obvious edge cases
// Note: RAL hex values are approximations — RAL is a physical pigment standard

export interface PaintColor {
  name: string;
  code: string;
  hex: string;
  brand?: string;
  family:
    | "white" | "black" | "gray" | "greige" | "beige" | "brown"
    | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "teal";
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

export const COLOR_SHADES: Record<BrandId, PaintColor[]> = {
  sherwin_williams: [
    { name: "Agreeable Gray", code: "SW 7029", hex: "#D1CBC1", family: "beige", tone: "warm", lightness: "light" },
    { name: "Alabaster", code: "SW 7008", hex: "#EDEAE0", family: "white", tone: "warm", lightness: "light" },
    { name: "Naval", code: "SW 6244", hex: "#2F3D4C", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Cavern Clay", code: "SW 7701", hex: "#AC6B53", family: "orange", tone: "warm", lightness: "medium" },
  ],

  benjamin_moore: [
    { name: "Revere Pewter", code: "HC-172", hex: "#CCC7B9", family: "beige", tone: "warm", lightness: "light" },
    { name: "Hale Navy", code: "HC-154", hex: "#444C57", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Aegean Teal", code: "2136-40", hex: "#708A8C", family: "teal", tone: "cool", lightness: "medium" },
    { name: "Blue Nova", code: "825", hex: "#5C6E93", family: "blue", tone: "cool", lightness: "medium" },
  ],

  behr: [
    { name: "Swiss Coffee", code: "12", hex: "#F3F2E6", family: "white", tone: "warm", lightness: "light" },
    { name: "Cracked Pepper", code: "PPU18-01", hex: "#4F5152", family: "gray", tone: "neutral", lightness: "dark" },
    { name: "Blueprint", code: "S470-5", hex: "#50939D", family: "teal", tone: "cool", lightness: "medium" },
    { name: "Boreal", code: "N420-5", hex: "#60896D", family: "green", tone: "neutral", lightness: "medium" },
  ],

  ral: [
    { name: "Pure White", code: "RAL 9010", hex: "#FFFFFF", family: "white", tone: "neutral", lightness: "light" },
    { name: "Jet Black", code: "RAL 9005", hex: "#0A0A0A", family: "black", tone: "neutral", lightness: "dark" },
    { name: "Anthracite Grey", code: "RAL 7016", hex: "#293133", family: "gray", tone: "cool", lightness: "dark" },
    { name: "Traffic Red", code: "RAL 3020", hex: "#CC0605", family: "red", tone: "warm", lightness: "medium" },
  ],

};

export const MAIN_COLOR_SHADES: Record<BrandId, PaintColor[]> = {
  sherwin_williams: [
    { name: "Alabaster", code: "SW 7008", hex: "#EDEAE0", family: "white", tone: "warm", lightness: "light" },
    { name: "Pure White", code: "SW 7005", hex: "#EDECE6", family: "white", tone: "warm", lightness: "light" },
    { name: "Extra White", code: "SW 7006", hex: "#EEEFEA", family: "white", tone: "warm", lightness: "light" },
    { name: "Antique White", code: "SW 6119", hex: "#E8DCC6", family: "beige", tone: "warm", lightness: "light" },
    { name: "Passive", code: "SW 7064", hex: "#CBCCC9", family: "gray", tone: "neutral", lightness: "light" },
    { name: "Agreeable Gray", code: "SW 7029", hex: "#D1CBC1", family: "beige", tone: "warm", lightness: "light" },
    { name: "Accessible Beige", code: "SW 7036", hex: "#D1C7B8", family: "beige", tone: "warm", lightness: "light" },
    { name: "Wool Skein", code: "SW 6148", hex: "#D9CFBA", family: "beige", tone: "warm", lightness: "light" },
    { name: "Repose Gray", code: "SW 7015", hex: "#CCC9C0", family: "gray", tone: "warm", lightness: "light" },
    { name: "Mindful Gray", code: "SW 7016", hex: "#BCB7AD", family: "gray", tone: "warm", lightness: "light" },
    { name: "Intellectual Gray", code: "SW 7045", hex: "#A8A093", family: "greige", tone: "warm", lightness: "medium" },
    { name: "Sea Salt", code: "SW 6204", hex: "#CDD2CA", family: "teal", tone: "neutral", lightness: "light" },
    { name: "Comfort Gray", code: "SW 6205", hex: "#BEC3BB", family: "gray", tone: "neutral", lightness: "light" },
    { name: "Evergreen Fog", code: "SW 9130", hex: "#95978A", family: "green", tone: "neutral", lightness: "medium" },
    { name: "Distance", code: "SW 6243", hex: "#5D6F7F", family: "blue", tone: "cool", lightness: "medium" },
    { name: "Isle of Pines", code: "SW 6461", hex: "#3D5541", family: "green", tone: "neutral", lightness: "dark" },
    { name: "Naval", code: "SW 6244", hex: "#2F3D4C", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Anchors Aweigh", code: "SW 9179", hex: "#2B3441", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Indigo Batik", code: "SW 7602", hex: "#3E5063", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Urbane Bronze", code: "SW 7048", hex: "#54504A", family: "brown", tone: "neutral", lightness: "dark" },
    { name: "Roycroft Copper Red", code: "SW 2839", hex: "#7B3728", family: "red", tone: "warm", lightness: "dark" },
    { name: "Tricorn Black", code: "SW 6258", hex: "#2F2F30", family: "black", tone: "neutral", lightness: "dark" },
    { name: "Caviar", code: "SW 6990", hex: "#313031", family: "black", tone: "neutral", lightness: "dark" },
    { name: "Cavern Clay", code: "SW 7701", hex: "#AC6B53", family: "orange", tone: "warm", lightness: "medium" },
    { name: "Toasted Pine Nut", code: "SW 7696", hex: "#DCC6A6", family: "beige", tone: "warm", lightness: "light" },
    { name: "Plum Dandy", code: "SW 6284", hex: "#8B6878", family: "pink", tone: "warm", lightness: "medium" },
    { name: "Reddish", code: "SW 6319", hex: "#B56966", family: "red", tone: "warm", lightness: "medium" },
    { name: "Sawdust", code: "SW 6158", hex: "#998970", family: "greige", tone: "warm", lightness: "medium" },
    { name: "Jasper Stone", code: "SW 9133", hex: "#8D9E97", family: "teal", tone: "neutral", lightness: "medium" },
    { name: "Hunt Club", code: "SW 6468", hex: "#2A4F43", family: "teal", tone: "neutral", lightness: "dark" },
  ],

  benjamin_moore: [
    { name: "Cloud White", code: "OC-130", hex: "#F3F2E7", family: "white", tone: "warm", lightness: "light" },
    { name: "Decorator's White", code: "OC-149", hex: "#ECEEEB", family: "white", tone: "neutral", lightness: "light" },
    { name: "Balboa Mist", code: "OC-27", hex: "#DBD7CD", family: "beige", tone: "warm", lightness: "light" },
    { name: "Hale Navy", code: "HC-154", hex: "#444C57", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Chelsea Gray", code: "HC-168", hex: "#87857D", family: "gray", tone: "neutral", lightness: "medium" },
    { name: "Kendall Charcoal", code: "HC-166", hex: "#686763", family: "gray", tone: "neutral", lightness: "dark" },
    { name: "Revere Pewter", code: "HC-172", hex: "#CCC7B9", family: "beige", tone: "warm", lightness: "light" },
    { name: "Rockport Gray", code: "HC-105", hex: "#A9A396", family: "greige", tone: "warm", lightness: "medium" },
    { name: "Aegean Teal", code: "2136-40", hex: "#708A8C", family: "teal", tone: "cool", lightness: "medium" },
    { name: "Wrought Iron", code: "2124-10", hex: "#4A4B4C", family: "gray", tone: "neutral", lightness: "dark" },
    { name: "Caliente", code: "AF-290", hex: "#8B2829", family: "red", tone: "warm", lightness: "dark" },
    { name: "Salamander", code: "2050-10", hex: "#303F3F", family: "teal", tone: "cool", lightness: "dark" },
    { name: "Blue Nova", code: "825", hex: "#5C6E93", family: "blue", tone: "cool", lightness: "medium" },
    { name: "Grant Beige", code: "HC-83", hex: "#CFC6B1", family: "beige", tone: "warm", lightness: "light" },
    { name: "Gentleman's Gray", code: "2062-20", hex: "#314757", family: "blue", tone: "cool", lightness: "dark" },
    { name: "October Mist", code: "1495", hex: "#B7B9A6", family: "green", tone: "warm", lightness: "medium" },
    { name: "Thundercloud Gray", code: "2124-40", hex: "#B9BEC1", family: "gray", tone: "neutral", lightness: "light" },
    { name: "Bison Brown", code: "2113-30", hex: "#674C48", family: "brown", tone: "warm", lightness: "dark" },
    { name: "Branchport Brown", code: "HC-72", hex: "#61524B", family: "brown", tone: "warm", lightness: "dark" },
    { name: "Midnight", code: "1631", hex: "#474849", family: "gray", tone: "neutral", lightness: "dark" },
    { name: "Navajo White", code: "947", hex: "#EFE8D6", family: "beige", tone: "warm", lightness: "light" },
    { name: "Cashmere", code: "930", hex: "#F6EDC7", family: "beige", tone: "warm", lightness: "light" },
    { name: "Fernwood Green", code: "2145-40", hex: "#CDCDA4", family: "green", tone: "warm", lightness: "light" },
    { name: "Shale", code: "861", hex: "#C4BEB2", family: "beige", tone: "warm", lightness: "light" },
    { name: "Chantilly", code: "2121-70", hex: "#F5F7F2", family: "white", tone: "warm", lightness: "light" },
    { name: "Newburyport", code: "HC-155", hex: "#475667", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Sage", code: "458", hex: "#C0CEC3", family: "green", tone: "neutral", lightness: "light" },
    { name: "Slate", code: "1648", hex: "#9CB2BC", family: "blue", tone: "cool", lightness: "medium" },
    { name: "Shadow", code: "2117-30", hex: "#524B59", family: "purple", tone: "neutral", lightness: "dark" },
    { name: "Spruce", code: "2035-50", hex: "#A4CEB6", family: "green", tone: "neutral", lightness: "light" },
  ],

  behr: [
    { name: "Cracked Pepper", code: "PPU18-01", hex: "#4F5152", family: "gray", tone: "neutral", lightness: "dark" },
    { name: "Blueprint", code: "S470-5", hex: "#50939D", family: "teal", tone: "cool", lightness: "medium" },
    { name: "Swiss Coffee", code: "12", hex: "#F3F2E6", family: "white", tone: "warm", lightness: "light" },
    { name: "Boreal", code: "N420-5", hex: "#60896D", family: "green", tone: "neutral", lightness: "medium" },
    { name: "Polar Bear", code: "75", hex: "#F8F9F3", family: "white", tone: "warm", lightness: "light" },
    { name: "Bit Of Sugar", code: "PR-W14", hex: "#F6F9F4", family: "white", tone: "neutral", lightness: "light" },
    { name: "Aged Beige", code: "PPU7-09", hex: "#D7CFC1", family: "beige", tone: "warm", lightness: "light" },
    { name: "Seagull Gray", code: "N360-1", hex: "#DDE6DD", family: "gray", tone: "neutral", lightness: "light" },
    { name: "Silver Drop", code: "790C-2", hex: "#DDE3D7", family: "gray", tone: "warm", lightness: "light" },
    { name: "Dark Everglade", code: "HDC-CL-21A", hex: "#3D554F", family: "teal", tone: "neutral", lightness: "dark" },
    { name: "Burnished Clay", code: "PPU18-09", hex: "#D2CCC5", family: "beige", tone: "warm", lightness: "light" },
    { name: "Rumors", code: "MQ1-15", hex: "#744347", family: "red", tone: "warm", lightness: "dark" },
    { name: "Breezeway", code: "MQ3-21", hex: "#CAD6CE", family: "white", tone: "neutral", lightness: "light" },
    { name: "Ultra Pure White", code: "50", hex: "#FAFDF7", family: "green", tone: "neutral", lightness: "light" },
    { name: "Toasty Gray", code: "N320-2", hex: "#D3D7CA", family: "white", tone: "warm", lightness: "light" },
    { name: "Creek Bend", code: "790F-4", hex: "#87948C", family: "gray", tone: "neutral", lightness: "medium" },
    { name: "Estate Limestone", code: "QE-27", hex: "#DACAB2", family: "beige", tone: "warm", lightness: "light" },
    { name: "Secret Meadow", code: "S360-6", hex: "#5F7B33", family: "green", tone: "warm", lightness: "dark" },
    { name: "Riviera Blue", code: "540B-5", hex: "#6CDFEE", family: "teal", tone: "cool", lightness: "medium" },
    { name: "Dark Ash", code: "770F-5", hex: "#576C6E", family: "teal", tone: "cool", lightness: "dark" },
    { name: "Jungle Camouflage", code: "N350-4", hex: "#A4B596", family: "green", tone: "neutral", lightness: "medium" },
    { name: "Marquee White", code: "BXC-47", hex: "#F7EEDC", family: "beige", tone: "warm", lightness: "light" },
    { name: "Barely Pink", code: "100A-1", hex: "#F9ECFC", family: "purple", tone: "neutral", lightness: "light" },
    { name: "Be Mine", code: "100A-2", hex: "#F8E0FA", family: "pink", tone: "neutral", lightness: "light" },
    { name: "Scented Valentine", code: "100A-3", hex: "#F8CEF9", family: "pink", tone: "neutral", lightness: "light" },
    { name: "Pink Chintz", code: "100B-4", hex: "#F8B5FA", family: "pink", tone: "neutral", lightness: "light" },
    { name: "Springtime Bloom", code: "100B-5", hex: "#E46FEC", family: "pink", tone: "neutral", lightness: "medium" },
    { name: "Fuchsia Kiss", code: "100B-6", hex: "#CF4DDF", family: "pink", tone: "neutral", lightness: "medium" },
    { name: "Hot Pink", code: "100B-7", hex: "#A623A6", family: "pink", tone: "neutral", lightness: "dark" },
    { name: "Cupid Arrow", code: "100C-1", hex: "#F9E3F6", family: "pink", tone: "neutral", lightness: "light" },
  ],

  ral: [
    { name: "Pure White", code: "RAL 9010", hex: "#FFFFFF", family: "white", tone: "neutral", lightness: "light" },
    { name: "Jet Black", code: "RAL 9005", hex: "#0A0A0A", family: "black", tone: "neutral", lightness: "dark" },
    { name: "Anthracite Grey", code: "RAL 7016", hex: "#293133", family: "gray", tone: "cool", lightness: "dark" },
    { name: "Traffic Red", code: "RAL 3020", hex: "#CC0605", family: "red", tone: "warm", lightness: "medium" },
    { name: "Cream", code: "RAL 9001", hex: "#FAF4E3", family: "beige", tone: "warm", lightness: "light" },
    { name: "Signal Yellow", code: "RAL 1003", hex: "#E5BE01", family: "yellow", tone: "warm", lightness: "medium" },
    { name: "Red Orange", code: "RAL 2001", hex: "#C93C20", family: "red", tone: "warm", lightness: "medium" },
    { name: "Wine Red", code: "RAL 3005", hex: "#5E2129", family: "red", tone: "warm", lightness: "dark" },
    { name: "Ultramarine Blue", code: "RAL 5002", hex: "#20214F", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Pastel Blue", code: "RAL 5024", hex: "#5D9B9B", family: "teal", tone: "cool", lightness: "medium" },
    { name: "Reseda Green", code: "RAL 6011", hex: "#587246", family: "green", tone: "neutral", lightness: "dark" },
    { name: "Nut Brown", code: "RAL 8011", hex: "#5B3A29", family: "brown", tone: "warm", lightness: "dark" },
    { name: "Light Grey", code: "RAL 7035", hex: "#D7D7D7", family: "gray", tone: "neutral", lightness: "light" },
    { name: "Green Beige", code: "RAL 1000", hex: "#BEBD7F", family: "yellow", tone: "warm", lightness: "medium" },
    { name: "Ivory", code: "RAL 1014", hex: "#E1CC4F", family: "yellow", tone: "warm", lightness: "medium" },
    { name: "Sulfur Yellow", code: "RAL 1016", hex: "#EDFF21", family: "yellow", tone: "warm", lightness: "medium" },
    { name: "Carmine Red", code: "RAL 3002", hex: "#A2231D", family: "red", tone: "warm", lightness: "dark" },
    { name: "Gentian Blue", code: "RAL 5010", hex: "#0E294B", family: "blue", tone: "cool", lightness: "dark" },
    { name: "Fern Green", code: "RAL 6025", hex: "#3D642D", family: "green", tone: "neutral", lightness: "dark" },
    { name: "Chocolate Brown", code: "RAL 8017", hex: "#45322E", family: "brown", tone: "warm", lightness: "dark" },
    { name: "Pearl Beige", code: "RAL 1035", hex: "#6A5D4D", family: "greige", tone: "warm", lightness: "dark" },
    { name: "Sky Blue", code: "RAL 5015", hex: "#2271B3", family: "blue", tone: "cool", lightness: "medium" },
    { name: "Grass Green", code: "RAL 6010", hex: "#35682D", family: "green", tone: "neutral", lightness: "dark" },
    { name: "Copper Brown", code: "RAL 8004", hex: "#8E402A", family: "brown", tone: "warm", lightness: "dark" },
    { name: "Oyster White", code: "RAL 1013", hex: "#EEEACD", family: "yellow", tone: "warm", lightness: "light" },
    { name: "Heather Violet", code: "RAL 4003", hex: "#DE4C8A", family: "pink", tone: "warm", lightness: "medium" },
    { name: "Signal Green", code: "RAL 6032", hex: "#317F43", family: "green", tone: "neutral", lightness: "dark" },
    { name: "White Aluminium", code: "RAL 9006", hex: "#A5A5A5", family: "gray", tone: "neutral", lightness: "medium" },
    { name: "Papyrus White", code: "RAL 9018", hex: "#D7D7D7", family: "gray", tone: "neutral", lightness: "light" },
    { name: "Dusty Grey", code: "RAL 7037", hex: "#7D7F7D", family: "gray", tone: "neutral", lightness: "medium" },
  ],

};

export const TRENDING_COLOR_SHADES: Record<BrandId, PaintColor[]> = {
  sherwin_williams: [
    { name: "Cavern Clay", code: "SW 7701", hex: "#AC6B53", family: "orange", tone: "warm", lightness: "medium" },  // 2019 Color of the Year
    { name: "Urbane Bronze", code: "SW 7048", hex: "#54504A", family: "brown", tone: "neutral", lightness: "dark" },  // 2021 Color of the Year
    { name: "Evergreen Fog", code: "SW 9130", hex: "#95978A", family: "green", tone: "neutral", lightness: "medium" },  // 2022 Color of the Year
  ],

  benjamin_moore: [
    { name: "Blue Nova", code: "825", hex: "#5C6E93", family: "blue", tone: "cool", lightness: "medium" },  // 2024 Color of the Year
    { name: "Caliente", code: "AF-290", hex: "#8B2829", family: "red", tone: "warm", lightness: "dark" },  // Color of the Year 2018
    { name: "Salamander", code: "2050-10", hex: "#303F3F", family: "teal", tone: "cool", lightness: "dark" },  // perennial deep forest green
  ],

  behr: [
    { name: "Breezeway", code: "MQ3-21", hex: "#CAD6CE", family: "white", tone: "neutral", lightness: "light" },  // 2022 Color of the Year
    { name: "Blueprint", code: "S470-5", hex: "#50939D", family: "teal", tone: "cool", lightness: "medium" },  // Behr Color of the Year 2019
    { name: "Dark Everglade", code: "HDC-CL-21A", hex: "#3D554F", family: "teal", tone: "neutral", lightness: "dark" },  // deep moody green
  ],

  ral: [
    { name: "Reseda Green", code: "RAL 6011", hex: "#587246", family: "green", tone: "neutral", lightness: "dark" },  // trending EU interiors sage
    { name: "Anthracite Grey", code: "RAL 7016", hex: "#293133", family: "gray", tone: "cool", lightness: "dark" },  // top-selling industrial neutral
    { name: "Heather Violet", code: "RAL 4003", hex: "#DE4C8A", family: "pink", tone: "warm", lightness: "medium" },  // trending dusty mauve
  ],

};