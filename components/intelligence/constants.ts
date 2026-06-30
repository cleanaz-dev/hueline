import type { PricingRule } from "./types";

export const PRICING_UNITS = [
  { value: 'qty', label: 'Qty' },
  { value: 'hour', label: 'Hour' },
  { value: 'sqft', label: 'Sq.Ft.' },
  { value: 'gallon', label: 'Gallon' },
  { value: 'linear_ft', label: 'Linear Ft.' },
  { value: 'day', label: 'Day' },
  { value: 'visit', label: 'Visit' },
] as const;


// These represent the "mock" rules used strictly to explain the logic on the dashboard


export const DEFAULT_PRICING_RULES: PricingRule[] = [
  {
    id: "1",
    name: "Base Call-out Fee",
    chargeType: "FLAT",
    unitName: "qty",
    amount: 300,
    isMultiplier: false,
    multiplier: 1,
    multiplierTarget: "TOTAL",
  },
  {
    id: "2",
    name: "Standard Labor",
    chargeType: "PER_UNIT",
    unitName: "hours",
    amount: 65,
    isMultiplier: false,
    multiplier: 1,
    multiplierTarget: "TOTAL",
  },
  {
    id: "3",
    name: "High Ceilings Surcharge",
    chargeType: "FLAT",
    unitName: "qty",
    amount: 0,
    isMultiplier: true,
    multiplier: 1.25,
    multiplierTarget: "LABOR",
  },
  {
    id: "4",
    name: "Rush Job Surcharge",
    chargeType: "FLAT",
    unitName: "qty",
    amount: 0,
    isMultiplier: true,
    multiplier: 1.5,
    multiplierTarget: "TOTAL",
  },
];



export const INTELLIGENCE_EXAMPLES = {
  contextDetection: [
    {
      id: "ex-1",
      title: "High Ceilings",
      utterance: "The foyer has 18-foot ceilings and the hallway is vaulted.",
      result: "has_high_ceilings = TRUE",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      id: "ex-2",
      title: "Rush Job",
      utterance: "We need the living room done before the open house tomorrow.",
      result: "is_rush_job = TRUE",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      id: "ex-3",
      title: "Wallpaper Removal",
      utterance: "There is old floral wallpaper in the master bedroom.",
      result: "needs_wallpaper_removal = TRUE",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      id: "ex-4",
      title: "Popcorn Ceiling",
      utterance: "The ceilings have that bumpy popcorn texture everywhere.",
      result: "has_popcorn_ceiling = TRUE",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    },
    {
      id: "ex-5",
      title: "Accent Walls",
      utterance: "We want one wall navy and the rest a light gray.",
      result: "multiple_colors = TRUE",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      id: "ex-6",
      title: "Cabinet Painting",
      utterance: "We want the kitchen cabinets painted white, not replaced.",
      result: "includes_cabinets = TRUE",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
    },
  ],
  // ...
} as const;





export const ROOM_VISION_CONFIG = {
  explainer: {
    input: "The walls in the master bedroom have a lot of scuff marks and a few nail holes.",
    result: "Wall Prep & Patching"
  },
  examples: [
    {
      input: "We want to change the living room from blue to a light gray, including the ceiling.",
      output: {
        category: "Interior Painting",
        item: "Walls & Ceiling Color Change",
        action: "Apply 2 coats light gray on walls, 1 coat flat white on ceiling"
      }
    },
    {
      input: "The exterior trim around the windows is starting to peel really bad.",
      output: {
        category: "Exterior Painting",
        item: "Trim Scraping & Painting",
        action: "Scrape peeling paint, prime bare wood, apply 2 finish coats"
      }
    },
    {
      input: "We need the kitchen cabinets sprayed to look modern, maybe a crisp white.",
      output: {
        category: "Cabinetry",
        item: "Cabinet Refinishing",
        action: "Degrease, sand, prime, and spray 2 coats of crisp white"
      }
    },
    {
      input: "I think my husband will be home around 4 PM to let you in.",
      output: null // No scope action triggered
    }
  ]
} as const;