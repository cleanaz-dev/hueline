export interface TargetColor {
  brand: string;
  brandLabel: string;
  name: string;
  code: string;
  hex: string;
  family: string;
  tone: string;
  lightness: string;
}

export interface CurrentColor {
  id: string;
  bookDataId: string;
  brand: string;
  code: string;
  name: string;
  hex: string;
  ral: string;
  createdAt: Date;
}

export interface MoonShotColorChoice {
    brand: string;
    name: string;
    code: string;
    hex: string;
}