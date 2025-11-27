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

  // Support both mockup_urls and mockups for backwards compatibility
  const mockupUrls = booking.mockup_urls || booking.mockups || [];
  const selectedMockup = mockupUrls[selectedDesignImage];

  // Check if we have more than 1 mockup (means alternate was generated)
  const hasGeneratedImage = mockupUrls.length > 2;

  const handleGenerateAlternate = () => {
    if (!selectedColor) return;
    setShowGenerateDialog(true);
  };

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
          {/* Large Main Image */}
          <div className="relative overflow-hidden rounded-xl shadow-lg border border-primary/20">
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

            {/* Image Badge */}
            <div className="absolute top-4 left-0">
              <div className="px-4 py-2 bg-primary text-white rounded-r-lg shadow-lg font-semibold text-xs uppercase tracking-wide">
                <span className="flex items-center gap-2">
                  Original {selectedOriginalImage + 1}
                </span>
              </div>
            </div>
          </div>

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
            {booking.bookingId && (
              <ImageUploadDialog bookingId={booking.bookingId} />
            )}
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
                    className={`absolute bottom-0 left-0 right-0 text-xs font-medium py-1 text-center text-white`}
                    style={{
                      backgroundColor:
                        selectedDesignImage === index
                          ? mockup.color.hex
                          : "rgba(0,0,0,0.7)",
                    }}
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

          {/* Color Info for Selected Mockup */}
          <div className="bg-white rounded-xl p-4 md:p-6 border border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Alternate Colors for This Design
              </h3>
            </div>

            {/* Hue Engine Section */}
            {booking.alternate_colors &&
              booking.alternate_colors.length > 0 && (
                <div className="border-t border-primary/10 pt-6 mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      HUE-LINE ENGINE
                    </h4>
                    <RandomColorButton 
                      bookingId={booking.phone}
                    />
                  </div>

                  {hasGeneratedImage ? (
                    /* Already generated - show completed state */
                    <div className="text-center space-y-4 opacity-60">
                      <p className="text-sm text-muted-foreground mb-4">
                        Alternative design has been generated!
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pointer-events-none">
                        {booking.alternate_colors.map((color, index) => (
                          <div
                            key={index}
                            className="relative overflow-hidden rounded-lg border-2 border-muted"
                          >
                            <div
                              className="w-full h-16"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="p-2 bg-background">
                              <div className="text-left">
                                <p className="font-medium text-xs truncate">
                                  {color.name}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {color.hex} - {color.ral}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center pt-2">
                        <Button disabled size="sm" className="opacity-50">
                          <Zap className="h-3 w-3 mr-2" />
                          Already Generated
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Active - allow generation */
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a color below and generate a new mockup
                        instantly.
                      </p>

                      <div className="flex flex-col md:flex-row gap-6 mb-6">
                        {/* Block 1 */}
                        <div className="flex flex-col md:max-w-sm p-4 bg-background/60 rounded-lg border border-primary/50 relative">
                          {/* Beta Badge */}
                          <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-md shadow-sm">
                            BETA
                          </div>

                          <div className="flex items-center justify-center gap-3">
                            <Sofa className="h-4 w-4 text-primary" />
                            <Label
                              htmlFor="remove-furniture-gallery"
                              className="text-sm font-medium"
                            >
                              Remove Furniture From Mockup
                            </Label>
                            <Switch
                              id="remove-furniture-gallery"
                              checked={removeFurniture}
                              onCheckedChange={setRemoveFurniture}
                              className="mt-0.5"
                            />
                          </div>
                        </div>

                        {/* Block 2 */}
                        {/* <div className="flex flex-col md:max-w-sm p-4 bg-background/60 rounded-lg border border-gray-300/50 relative">
                      
                          <div className="absolute -top-2 -left-2 px-2 py-1 bg-gray-300 text-white text-xs font-bold rounded-md shadow-sm">
                            COMING SOON
                          </div>

                          <div className="flex items-center justify-center gap-3">
                            <PaintRoller className="h-4 w-4 text-gray-300" />
                            <Label className="text-muted-foreground font-medium">
                              Generate Premium Mockup
                            </Label>
                            <Switch disabled className="mt-0.5" />
                          </div>
                        </div> */}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                        {booking.alternate_colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            className={`group cursor-pointer relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                              selectedColor?.hex === color.hex
                                ? "border-primary shadow-md scale-105"
                                : "border-primary/20 hover:border-primary/40"
                            }`}
                          >
                            <div
                              className="w-full h-16 transition-all duration-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="p-2 bg-background">
                              <div className="text-center">
                                <p className="font-medium text-xs truncate">
                                  {color.name}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {color.hex}
                                </p>
                              </div>
                            </div>
                            {selectedColor?.hex === color.hex && (
                              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                                <Zap className="h-2 w-2" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-center">
                        <Button
                          onClick={handleGenerateAlternate}
                          disabled={!selectedColor}
                          size="lg"
                          className="group inline-flex items-center gap-2 px-6"
                        >
                          <Zap className="h-3 w-3 group-hover:scale-110 transition-transform" />
                          Generate Mockup
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
          </div>
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
