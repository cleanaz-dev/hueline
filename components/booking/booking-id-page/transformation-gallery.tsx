"use client";
import { Eye, Sparkles, Palette } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import GlareHover from "@/components/GlareHover";

import AlternateDesign from "./alternate-colors";
import ComparisonSlider from "./compare-slider";

interface PaintColor {
  name: string;
  hex: string;
  ral: string;
  variant?: string;
}

interface MockupUrl {
  url: string;
  room_type: string;
  color: PaintColor;
}

interface SharedAccess {
  email: string;
  accessType: "customer" | "viewer" | "admin";
  pin: string;
  createdAt: string;
}

interface BookingParams {
  original_images: string[];
  mockup_urls?: MockupUrl[];
  mockups?: MockupUrl[];
  paint_colors?: PaintColor[];
  alternate_colors?: PaintColor[];
  huelineId: string;
  bookingId?: string;
  phone: string;
  sharedAccess?: SharedAccess[];
}

export default function TransformationGallery(booking: BookingParams) {
  const [activeTab, setActiveTab] = useState<"original" | "design">("original");
  const [selectedOriginalImage, setSelectedOriginalImage] = useState(0);
  const [selectedDesignImage, setSelectedDesignImage] = useState(0);
  
  const mockupUrls = booking.mockup_urls || booking.mockups || [];
  const selectedMockup = mockupUrls[selectedDesignImage];
  const hasGeneratedImage = mockupUrls.length > 1;
  const hasSharedAccess = !!booking.sharedAccess?.length;

  return (
    <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-2xl py-6 px-4 md:py-8">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          Transformation Gallery
        </h2>
        <p className="text-sm text-muted-foreground">
          Visualizing your space before and after
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Custom Tabs List */}
        <div className="flex border border-gray-200 rounded-lg p-1 bg-white max-w-md mx-auto gap-4 mb-4">
          <button
            onClick={() => setActiveTab("original")}
            className={`flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "original"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-4 w-4" />
            Compare Space
          </button>
          <button
            onClick={() => setActiveTab("design")}
            className={`flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "design"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Design Vision
          </button>
        </div>

        {/* Original Images Tab - Always rendered but hidden */}
        <div className={activeTab === "original" ? "space-y-6" : "hidden"}>
          {/* Comparison Slider */}
          {mockupUrls.length > 0 && booking.original_images.length > 0 && (
            <ComparisonSlider
              key={selectedDesignImage}
              beforeImage={booking.original_images[selectedOriginalImage]}
              afterImage={selectedMockup.url}
              beforeLabel="BEFORE"
              afterLabel="AFTER"
            />
          )}

          {/* Design Selector for Comparison Mode */}
          {mockupUrls.length > 1 && (
            <div className="bg-white rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">
                    Compare Different Colors
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {selectedDesignImage + 1} of {mockupUrls.length}
                </span>
              </div>

              {/* Color Options Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mockupUrls.map((mockup, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDesignImage(index)}
                    className={`group cursor-pointer relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                      selectedDesignImage === index
                        ? "border-primary shadow-md scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className="w-full h-12"
                      style={{ backgroundColor: mockup.color.hex }}
                    />
                    <div className="p-2 bg-background">
                      <p className="text-xs font-medium truncate text-center">
                        {mockup.color.name}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        {mockup.color.ral}
                      </p>
                    </div>
                    {selectedDesignImage === index && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                        {/* <Eye className="h-3 w-3" /> */}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {booking.original_images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedOriginalImage(index)}
                className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                  selectedOriginalImage === index
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Image
                  src={image}
                  alt={`Original thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 text-xs font-medium py-1 text-center ${
                    selectedOriginalImage === index
                      ? "bg-primary/90 text-white"
                      : "bg-black/70 text-white"
                  }`}
                >
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Design Images Tab - Always rendered but hidden */}
        <div className={activeTab === "design" ? "space-y-6" : "hidden"}>
          {/* Large Main Image */}
          <div className="relative overflow-hidden rounded-xl shadow-lg border border-primary/20">
            <GlareHover>
              <>
                <Image
                  src={selectedMockup.url}
                  alt={`Design image ${selectedDesignImage + 1}`}
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                {/* Watermark Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  style={{
                    backgroundImage:
                      "url(https://res.cloudinary.com/dmllgn0t7/image/upload/v1760933379/new-watermark.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 0.45,
                  }}
                />
              </>
            </GlareHover>

            {/* Image Badge */}
            <div className="absolute top-4 left-0 z-10">
              <div className="px-4 py-2 bg-primary text-white rounded-r-lg shadow-lg font-semibold text-xs uppercase tracking-wide">
                <span className="flex items-center gap-2">
                  {selectedMockup.room_type}
                </span>
              </div>
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {mockupUrls.map((mockup, index) => (
              <div key={index} className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedDesignImage(index)}
                  className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    selectedDesignImage === index
                      ? `ring-2 ring-primary/20 shadow-md`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{
                    borderColor:
                      selectedDesignImage === index ? mockup.color.hex : "",
                  }}
                >
                  <Image
                    src={mockup.url}
                    alt={`Design thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute bottom-0 left-0 right-0 text-xs font-medium py-1 text-center text-white">
                    {index + 1}
                  </div>
                </button>
                {mockup.color && (
                  <div className="text-xs text-center space-y-1">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300 mx-auto"
                      style={{ backgroundColor: mockup.color.hex }}
                    />
                    <div className="text-sm text-gray-600 truncate">
                      {mockup.color.ral}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <AlternateDesign
            booking={booking}
            hasGeneratedImage={hasGeneratedImage}
            hasSharedAccess={hasSharedAccess}
          />
        </div>
      </div>
    </section>
  );
}