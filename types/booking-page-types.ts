import { BookingData } from "./subdomain-type";

export interface ComparisonSlider {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  showWatermark?: boolean;
  watermarkUrl?: string;
  autoSlide?: boolean;
}

export interface MiniThumbnails {
  activeTab: "original" | "design";
  originalImages: string[];
  mockupUrls: BookingData["mockups"];
  selectedOriginalImage: number;
  selectedDesignImage: number;
  onOriginalSelect: (index: number) => void;
  onDesignSelect: (index: number) => void;
}