"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Sparkles, Palette, Zap, Sofa, PaintRoller } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { ImageUploadDialog } from "../upload-image";
import GlareHover from "@/components/GlareHover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import GenerateDialog from "../generate-dialog";
import { RandomColorButton } from "./random-color-button";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import AlternateDesign from "./alternate-colors";

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

interface BookingParams {
  original_images: string[];
  mockup_urls?: MockupUrl[];
  mockups?: MockupUrl[];
  paint_colors?: PaintColor[];
  alternate_colors?: PaintColor[];
  bookingId?: string;
  phone: string;
}

export default function TransformationGallery(booking: BookingParams) {
  const [selectedOriginalImage, setSelectedOriginalImage] = useState(0);
  const [selectedDesignImage, setSelectedDesignImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<PaintColor | null>(null);
  const [removeFurniture, setRemoveFurniture] = useState<boolean>(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  // Support both mockup_urls and mockups for backwards compatibility
  const mockupUrls = booking.mockup_urls || booking.mockups || [];
  const selectedMockup = mockupUrls[selectedDesignImage];

  // Check if we have more than 1 mockup (means alternate was generated)
  const hasGeneratedImage = mockupUrls.length > 1;

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

      <Tabs defaultValue="original" className="max-w-4xl mx-auto">
        {/* Tabs List */}
        <TabsList className="flex border border-gray-200 rounded-lg p-1 bg-white max-w-md mx-auto gap-4 mb-4">
          <TabsTrigger
            value="original"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-primary cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            Current Space
          </TabsTrigger>
          <TabsTrigger
            value="design"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-primary cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Design Vision
          </TabsTrigger>
        </TabsList>

        {/* Original Images Tab */}
        <TabsContent value="original" className="space-y-6">
          {/* Compare Toggle Button */}
          {mockupUrls.length > 0 && booking.original_images.length > 0 && (
            <div className="flex justify-center mb-4">
              <Button
                onClick={() => setShowComparison(!showComparison)}
                variant={showComparison ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {showComparison ? "Hide Comparison" : "Compare Before/After"}
              </Button>
            </div>
          )}

          {/* Large Main Image or Comparison Slider */}
          <div className="relative overflow-hidden rounded-xl shadow-lg border border-primary/20">
            {showComparison ? (
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={booking.original_images[selectedOriginalImage]}
                    alt="Original"
                    style={{ objectFit: "cover" }}
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={selectedMockup.url}
                    alt="Design"
                    style={{ objectFit: "cover" }}
                  />
                }
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                }}
                className="rounded-xl"
              />
            ) : (
              <GlareHover>
                <Image
                  src={booking.original_images[selectedOriginalImage]}
                  alt={`Original image ${selectedOriginalImage + 1}`}
                  width={800}
                  height={500}
                  className="w-full h-auto aspect-video object-cover"
                  priority
                />
              </GlareHover>
            )}

            {/* Image Badge */}
            {!showComparison && (
              <div className="absolute top-4 left-0">
                <div className="px-4 py-2 bg-primary text-white rounded-r-lg shadow-lg font-semibold text-xs uppercase tracking-wide">
                  <span className="flex items-center gap-2">
                    Original {selectedOriginalImage + 1}
                  </span>
                </div>
              </div>
            )}

            {/* Comparison Labels */}
            {showComparison && (
              <>
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 text-white rounded-lg text-xs font-semibold">
                  BEFORE
                </div>
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold">
                  AFTER
                </div>
              </>
            )}
          </div>

          {/* Design Selector for Comparison Mode */}
          {showComparison && mockupUrls.length > 1 && (
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
                        <Eye className="h-3 w-3" />
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
        </TabsContent>

        {/* Design Images Tab */}
        <TabsContent value="design" className="space-y-6">
          {/* Large Main Image */}
          <div className="relative overflow-hidden rounded-xl shadow-lg border border-primary/20">
            <GlareHover>
              <Image
                src={selectedMockup.url}
                alt={`Design image ${selectedDesignImage + 1}`}
                width={800}
                height={500}
                className="w-full h-auto aspect-video object-cover"
                priority
              />
            </GlareHover>

            {/* Image Badge */}
            <div className="absolute top-4 left-0">
              <div className="px-4 py-2 bg-primary text-white rounded-r-lg shadow-lg font-semibold text-xs uppercase tracking-wide">
                <span className="flex items-center gap-2">
                  {selectedMockup.room_type} - Design {selectedDesignImage + 1}
                </span>
              </div>
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 ">
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
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 text-xs font-medium py-1 text-center text-white"
                    style={{ backgroundColor: mockup.color.hex }}
                  >
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
          />
        </TabsContent>
      </Tabs>

      {/* Generate Dialog */}
      <GenerateDialog
        isOpen={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        selectedColor={selectedColor}
        phoneNumber={booking.phone || ""}
        originalImages={booking.original_images}
        removeFurniture={removeFurniture}
      />
    </section>
  );
}
