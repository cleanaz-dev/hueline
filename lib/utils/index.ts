import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ColorItem {
  ral: string
  name: string
  hex: string
}

interface RalColor {
  name: string;
  ral: string;
  hex: string;
  rgb: string
  lrv: string;
}

export const RANDOM_COLOR_MAP = [
  { ral: "RAL 1001", hex: "#D0B084", name: "Beige" },
  { ral: "RAL 1002", hex: "#D2AA6D", name: "Sand Yellow" },
  { ral: "RAL 1012", hex: "#DDAF28", name: "Lemon Yellow" },
  { ral: "RAL 1016", hex: "#F1DD39", name: "Sulfur Yellow" },
  { ral: "RAL 1017", hex: "#F6A951", name: "Saffron Yellow" },
  { ral: "RAL 1018", hex: "#FACA31", name: "Zinc Yellow" },
  { ral: "RAL 1024", hex: "#BA8F4C", name: "Ochre Yellow" },
  { ral: "RAL 1034", hex: "#EB9C52", name: "Pastel Yellow" },
  { ral: "RAL 1037", hex: "#F09200", name: "Sun Yellow" },
  { ral: "RAL 2003", hex: "#F67829", name: "Pastel Orange" },
  { ral: "RAL 2007", hex: "#FFB200", name: "Luminous Bright Orange" },
  { ral: "RAL 2012", hex: "#D5654E", name: "Salmon Orange" },
  { ral: "RAL 2011", hex: "#E26E0F", name: "Deep Orange" },
  { ral: "RAL 3005", hex: "#D8A0A6", name: "Light Pink" },
  { ral: "RAL 3014", hex: "#CB7375", name: "Antique Pink" },
  { ral: "RAL 3015", hex: "#D8A0A6", name: "Light Pink" },
  { ral: "RAL 3022", hex: "#CF6955", name: "Salmon Pink" },
  { ral: "RAL 4003", hex: "#C4618C", name: "Heather Violet" },
  { ral: "RAL 4009", hex: "#9D8692", name: "Pastel Violet" },
  { ral: "RAL 5007", hex: "#376B8C", name: "Brilliant Blue" },
  { ral: "RAL 5009", hex: "#215F78", name: "Azure Blue" },
  { ral: "RAL 5012", hex: "#0089B6", name: "Light Blue" },
  { ral: "RAL 5014", hex: "#637D96", name: "Pigeon Blue" },
  { ral: "RAL 5024", hex: "#6093AC", name: "Pastel Blue" },
  { ral: "RAL 5021", hex: "#007577", name: "Water Blue" },
  { ral: "RAL 5023", hex: "#41698C", name: "Distant Blue" },
  { ral: "RAL 6003", hex: "#50533C", name: "Olive Green" },
  { ral: "RAL 6011", hex: "#6B7C59", name: "Reseda Green" },
  { ral: "RAL 6019", hex: "#B9CEAC", name: "Pastel Green" },
  { ral: "RAL 6021", hex: "#8A9977", name: "Pale Green" }
];


// 2025 Trendy Colors - Paint & Fashion Industry

export const TRENDY_COLOR_MAP = [
  { ral: "RAL 1003", hex: "#F9A900", name: "Signal Yellow" },
  { ral: "RAL 1004", hex: "#E49E00", name: "Golden Yellow" },
  { ral: "RAL 1023", hex: "#F7B500", name: "Traffic Yellow" },
  { ral: "RAL 2005", hex: "#FF4D08", name: "Luminous Orange" },
  { ral: "RAL 2008", hex: "#EC6B22", name: "Bright Red Orange" },
  { ral: "RAL 2009", hex: "#DE5308", name: "Traffic Orange" },
  { ral: "RAL 3001", hex: "#9B2423", name: "Signal Red" },
  { ral: "RAL 3002", hex: "#9B2321", name: "Carmine Red" },
  { ral: "RAL 3024", hex: "#FF2D21", name: "Luminous Red" },
  { ral: "RAL 4006", hex: "#903373", name: "Traffic Purple" },
  { ral: "RAL 5005", hex: "#005387", name: "Signal Blue" },
  { ral: "RAL 5012", hex: "#0089B6", name: "Light Blue" },
  { ral: "RAL 5015", hex: "#007CAF", name: "Sky Blue" },
  { ral: "RAL 5018", hex: "#048B8C", name: "Turquoise Blue" },
  { ral: "RAL 6001", hex: "#366735", name: "Emerald Green" },
  { ral: "RAL 6018", hex: "#60993B", name: "Yellow Green" },
  { ral: "RAL 6027", hex: "#7EBAB5", name: "Light Green" },
  { ral: "RAL 6032", hex: "#237F52", name: "Signal Green" },
  { ral: "RAL 6034", hex: "#7AADAC", name: "Pastel Turquoise" },
  { ral: "RAL 3015", hex: "#D8A0A6", name: "Light Pink" }
];

export function getRandomColor(map:ColorItem[]): ColorItem {
  const randomIndex = Math.floor(Math.random() * map.length);
  return map[randomIndex];
}

export function filterColorsByHue(
  mainHue: string,
  allColors: RalColor[]
): RalColor[] {
  return allColors.filter(color => 
    color.name.toLowerCase().includes(mainHue.toLowerCase())
  );
}

// Helper to generate a random 4-digit PIN
export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}


    // Extract hue from color name
export const hueKeywords = [
  'blue', 'red', 'green', 'yellow', 'orange', 'purple', 'violet',
  'grey', 'gray', 'brown', 'beige', 'white', 'black', 'pink', 'turquoise'
];

export const extractMainHue = (colorName: string) => {
  const lower = colorName.toLowerCase();
  
  // Check for compound colors first
  if (lower.includes('lavender') || lower.includes('lilac') || lower.includes('mauve')) return 'violet';
  if (lower.includes('sage') || lower.includes('mint') || lower.includes('olive')) return 'green';
  if (lower.includes('peach') || lower.includes('coral') || lower.includes('salmon')) return 'orange';
  if (lower.includes('navy') || lower.includes('cobalt') || lower.includes('azure')) return 'blue';
  if (lower.includes('burgundy') || lower.includes('maroon') || lower.includes('crimson')) return 'red';
  if (lower.includes('ivory') || lower.includes('cream')) return 'beige';
  if (lower.includes('charcoal') || lower.includes('slate') || lower.includes('graphite')) return 'grey';
  if (lower.includes('orchid')) return 'purple';
  if (lower.includes('rose')) return 'pink';
  if (lower.includes('cocoa') || lower.includes('chocolate') || lower.includes('mocha')) return 'brown';
  if (lower.includes('terracotta') || lower.includes('rust')) return 'orange';
  
  // Then check basic hues
  return hueKeywords.find(hue => lower.includes(hue)) || 'blue';
};