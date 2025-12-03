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
  { ral: "RAL 1000", name: "Green Beige", hex: "#BEBD7F" },
  { ral: "RAL 1001", name: "Beige", hex: "#C2B078" },
  { ral: "RAL 1002", name: "Sand Yellow", hex: "#C6A664" },
  { ral: "RAL 1003", name: "Signal Yellow", hex: "#E5BE01" },
  { ral: "RAL 1004", name: "Golden Yellow", hex: "#CDA434" },
  { ral: "RAL 1005", name: "Honey Yellow", hex: "#A98307" },
  { ral: "RAL 1013", name: "Oyster White", hex: "#EAE6CA" },
  { ral: "RAL 1015", name: "Light Ivory", hex: "#E6D690" },
  { ral: "RAL 2000", name: "Yellow Orange", hex: "#ED760E" },
  { ral: "RAL 2004", name: "Pure Orange", hex: "#F44611" },
  { ral: "RAL 3000", name: "Flame Red", hex: "#AF2B1E" },
  { ral: "RAL 3003", name: "Ruby Red", hex: "#8A142B" },
  { ral: "RAL 4005", name: "Blue Lilac", hex: "#76689A" },
  { ral: "RAL 5001", name: "Green Blue", hex: "#1F3438" },
  { ral: "RAL 5002", name: "Ultramarine Blue", hex: "#20214F" },
  { ral: "RAL 5005", name: "Signal Blue", hex: "#154889" },
  { ral: "RAL 5012", name: "Light Blue", hex: "#3A75C4" },
  { ral: "RAL 5024", name: "Pastel Blue", hex: "#6A93B0" },
  { ral: "RAL 6000", name: "Patina Green", hex: "#327662" },
  { ral: "RAL 6005", name: "Moss Green", hex: "#0E3A2A" },
  { ral: "RAL 6019", name: "Pastel Green", hex: "#A5D5A7" },
  { ral: "RAL 6021", name: "Pale Green", hex: "#89AC76" },
  { ral: "RAL 7001", name: "Silver Grey", hex: "#8F979D" },
  { ral  :'RAL 7016', name: "Anthracite Grey", hex: "#383E42" },
  { ral  :'RAL 7035', name: "Light Grey", hex: "#D7D7D7" },
  { ral  :'RAL 7040', name: "Window Grey", hex: "#9DA1AA" },
  { ral  :'RAL 8001', name: "Ochre Brown", hex: "#9A6229" },
  { ral  :'RAL 9001', name: "Cream", hex: "#FDF4E3" },
  { ral  :'RAL 9010', name: "Pure White", hex: "#FFFFFF" },
];

// 2025 Trendy Colors - Paint & Fashion Industry

export const TRENDY_COLOR_MAP = [
  // Warm Browns & Neutrals
  { name: "Mocha Mousse", hex: "#382C1E", ral: "RAL 8014" },
  { name: "Cinnamon Slate", hex: "#6C3082", ral: "RAL 4012" },
  { name: "Hot Cocoa", hex: "#633A34", ral: "RAL 8015" },
  { name: "Leather Saddle", hex: "#79553D", ral: "RAL 8024" },
  
  // Icy Blues
  { name: "Icy Blue", hex: "#5D9B9B", ral: "RAL 5024" },
  { name: "Bellbottom Blues", hex: "#606E8C", ral: "RAL 5014" },
  { name: "Quietude", hex: "#BDECB6", ral: "RAL 6019" },
  
  // Vibrant Greens
  { name: "Frog Green", hex: "#57A639", ral: "RAL 6018" },
  { name: "Chartreuse", hex: "#FFFF00", ral: "RAL 1026" },
  { name: "Forest Green", hex: "#2C5545", ral: "RAL 6028" },
  
  // Pinks & Roses
  { name: "Tea Rose", hex: "#EA899A", ral: "RAL 3015" },
  { name: "Petal Pink", hex: "#D7837F", ral: "RAL 3014" },
  { name: "Bubblegum", hex: "#E63244", ral: "RAL 3017" },
  
  // Lavenders & Purples
  { name: "Digital Lavender", hex: "#8673A1", ral: "RAL 4003" },
  { name: "Lilac Mist", hex: "#BC8DBF", ral: "RAL 4009" },
  { name: "Orchid Bloom", hex: "#923E85", ral: "RAL 4008" },
  
  // Warm Tones
  { name: "Apricot Crush", hex: "#FA6A00", ral: "RAL 2003" },
  { name: "Terracotta", hex: "#C44536", ral: "RAL 8004" },
  { name: "Butter Yellow", hex: "#F4A900", ral: "RAL 1003" },
  
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
  return hueKeywords.find(hue => lower.includes(hue)) || 'blue';
};
