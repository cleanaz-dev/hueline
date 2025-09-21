"use client";
import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type PaintColor = {
  name: string;
  hex: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedColor: PaintColor | null;
  phoneNumber: string;
  originalImages: string[];
  removeFurniture: boolean;
};

export default function GenerateDialog({
  isOpen,
  onClose,
  selectedColor,
  phoneNumber,
  originalImages,
  removeFurniture
}: Props) {
  const [stage, setStage] = useState<"generating" | "complete">("generating");
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen || !selectedColor) return;

    let progressInterval: NodeJS.Timeout;

    const runGeneration = async () => {
      try {
        // Start progress animation
        progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return prev; // Stop at 90% until API completes
            return prev + Math.random() * 15;
          });
        }, 200);

        // Make API call
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber,
            prompt: `Change paint color to: ${selectedColor.name}`,
            imageUrl: originalImages,
            removeFurniture
          }),
        });

        if (!response.ok) throw new Error("Generation failed");

        // Complete progress
        clearInterval(progressInterval);
        setProgress(100);

        // Wait a moment then show completion
        setTimeout(() => {
          setStage("complete");
        }, 500);
      } catch (error) {
        console.error("Error generating mockup:", error);
        clearInterval(progressInterval);
        onClose(); // Close dialog on error
      }
    };

    if (isOpen) {
      setStage("generating");
      setProgress(0);
      runGeneration();
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isOpen, selectedColor, phoneNumber, originalImages]);

  const handleComplete = () => {
    onClose();
    // Revalidate/refresh the page to show new image
    router.refresh();
  };

  const handleClose = () => {
    setStage("generating");
    setProgress(0);
    onClose();
  };

  if (!selectedColor) return null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Hue Engine
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {stage === "generating" ? (
            <>
              {/* Generating State */}
              <div className="text-center space-y-4">
                {/* Video Splash Screen */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-48 h-32 rounded-lg overflow-hidden bg-black">
                    <video
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover"
                      src="/videos/splash_screen-2.mp4"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full border-4 border-primary/20"
                      style={{ backgroundColor: `${selectedColor.hex}20` }}
                    />
                    <div
                      className="absolute inset-2 rounded-full animate-pulse"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-spin" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Generating Your Mockup
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Creating your space with{" "}
                    <span
                      className="font-medium"
                      style={{ color: selectedColor.hex }}
                    >
                      {selectedColor.name}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {progress < 30 && "Analyzing your space..."}
                    {progress >= 30 &&
                      progress < 60 &&
                      "Applying paint colors..."}
                    {progress >= 60 &&
                      progress < 90 &&
                      "Rendering final image..."}
                    {progress >= 90 && "Almost done..."}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Complete State */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full border-4 border-green-200"
                      style={{ backgroundColor: `${selectedColor.hex}20` }}
                    />
                    <div
                      className="absolute inset-2 rounded-full"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <CheckCircle className="absolute inset-0 m-auto h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-green-600">
                    Mockup Complete!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your new design with{" "}
                    <span
                      className="font-medium"
                      style={{ color: selectedColor.hex }}
                    >
                      {selectedColor.name}
                    </span>{" "}
                    is ready
                  </p>
                </div>

                <Button onClick={handleComplete} className="w-full">
                  View Your New Design
                </Button>
              </div>
            </>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
