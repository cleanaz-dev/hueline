import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const COLOR_MAP = [
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

export function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * COLOR_MAP.length);
  return COLOR_MAP[randomIndex];
}