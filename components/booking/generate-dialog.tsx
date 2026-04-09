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

type GenerateStatus = "idle" | "generating" | "success" | "error";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmComplete: () => void;
  status: GenerateStatus;
  selectedOption: string;
  removeFurniture: boolean;
}

export default function GenerateDialog({
  isOpen,
  onClose,
  onConfirmComplete,
  status,
  selectedOption,
  removeFurniture,
}: Props) {
  const [progress, setProgress] = useState(0);

  // Handle Progress Bar Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && status === "generating") {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          // Stall at 90% until the parent tells us status is 'success'
          if (prev >= 90) return prev;
          return prev + Math.random() * 2;
        });
      }, 500);
    } else if (status === "success") {
      setProgress(100);
    }

    return () => clearInterval(interval);
  }, [isOpen, status]);

  const getOptionLabel = (opt: string) => {
    switch (opt) {
      case "brighter": return "Brightness Enhancement";
      case "darker": return "Moody Atmosphere";
      case "trendy": return "Trendy Style";
      case "random": return "Random Surprise";
      default: return "New Design";
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Hue Engine
          </AlertDialogTitle>
        </AlertDialogHeader>

        {/* Custom style to loop RGB colors on the spinner stroke */}
        <style>{`
          @keyframes rgbColorCycle {
            0% { color: #ef4444; }   /* Tailwind red-500 */
            33% { color: #22c55e; }  /* Tailwind green-500 */
            66% { color: #3b82f6; }  /* Tailwind blue-500 */
            100% { color: #ef4444; } /* Tailwind red-500 */
          }
          .rgb-color-cycle {
            animation: rgbColorCycle 3s ease-in-out infinite;
          }
        `}</style>

        <div className="space-y-6 py-4">
          {status === "generating" || (status === "success" && progress < 100) ? (
            /* ------------------- GENERATING STATE ------------------- */
            <div className="text-center space-y-4">
              
              {/* RGB Shadcn Spinner */}
              <div className="flex justify-center mb-6 mt-4">
                <div className="relative flex items-center justify-center w-24 h-24 bg-gray-50/50 rounded-full shadow-inner border border-gray-100">
                  {/* The rgb-color-cycle class handles the color change, animate-spin handles the rotation */}
                  <div className="rgb-color-cycle">
                    <Loader2 className="h-14 w-14 animate-spin stroke-[2.5] drop-shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold animate-pulse">
                  Generating New Look...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Applying <span className="font-medium text-primary">{getOptionLabel(selectedOption)}</span>
                  {removeFurniture && " & removing furniture"}
                </p>
              </div>

              <div className="space-y-2">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-xs text-muted-foreground">
                  {progress < 40 && "Analyzing room structure..."}
                  {progress >= 40 && progress < 80 && "Applying lighting & textures..."}
                  {progress >= 80 && "Finalizing render..."}
                </p>
              </div>
            </div>
          ) : (
            /* ------------------- SUCCESS STATE ------------------- */
            <div className="text-center space-y-5">
              <div className="flex justify-center mt-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-green-700">
                  Design Complete!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your alternate design is ready to view.
                </p>
              </div>

              <Button 
                onClick={onConfirmComplete} 
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all hover:scale-[1.02]"
                size="lg"
              >
                View Design
              </Button>
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}