"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronLeft,
  Check,
  PaintRoller,
  Loader2,
  Mail,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COLOR_BRANDS } from "./color-brand-data";
import { useState } from "react";


type Step = "IDLE" | "BRAND" | "COLOR" | "CONFIRM" | "LOADING" | "SUCCESS";
type DeliveryMethod = "email" | "sms";

interface InteractiveChatImageProps {
  mediaUrl: string;
  filename?: string;
  mimeType?: string;
  // Triggered when user confirms, pass this to your webhook
  onGenerate?: (payload: {
    brand: keyof typeof COLOR_BRANDS;
    color: any;
    deliveryMethod: DeliveryMethod;
  }) => void;
}

export function InteractiveChatImage({
  mediaUrl,
  filename,
  mimeType,
  onGenerate,
}: InteractiveChatImageProps) {
  

  const[step, setStep] = useState<Step>("IDLE");
  const [selectedBrand, setSelectedBrand] = useState< keyof typeof COLOR_BRANDS | null >(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");

  

  const handleCancel = () => {
    setStep("IDLE");
    setSelectedBrand(null);
    setSelectedColor(null);
    setDeliveryMethod("email"); // Reset to default
  };

  const handleConfirm = async () => {
    if (!selectedBrand || !selectedColor) return;

    // Call your webhook / parent function here with the selected delivery method
    if (onGenerate) {
      onGenerate({
        brand: selectedBrand,
        color: selectedColor,
        deliveryMethod: deliveryMethod,
      });
    }

    setStep("LOADING");
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStep("SUCCESS");
    
    setTimeout(() => {
      handleCancel();
    }, 2500);
  };

  const slideVariants = {
    enter: { x: 20, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  };

  const isPdf = mimeType === "application/pdf";

  return (
    <div className="relative mb-3 group overflow-hidden rounded-lg border border-current/10 bg-zinc-100 dark:bg-zinc-900 min-h-30">
      {isPdf ? (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-4 text-xs font-medium text-blue-600 hover:underline"
        >
          📄 {filename ?? "View PDF"}
        </a>
      ) : (
        <>
          <img
            src={mediaUrl}
            alt={filename ?? "Attachment"}
            className="w-full h-auto max-h-75 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />

          <AnimatePresence mode="wait">
            {step === "IDLE" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/60 to-transparent flex justify-center"
              >
                <Button
                  size="sm"
                  onClick={() => setStep("BRAND")}
                  className="bg-background/90 text-foreground backdrop-blur-md hover:bg-background shadow-lg border border-white/10 rounded-full h-8 px-4 text-xs font-medium gap-1.5"
                >
                  <Sparkles size={13} className="text-indigo-500" />
                  Generate Mockup
                </Button>
              </motion.div>
            )}

            {step !== "IDLE" && (
              <motion.div
                key="menu"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute inset-x-0 bottom-0 top-auto max-h-full bg-background/85 backdrop-blur-xl border-t shadow-2xl flex flex-col"
              >
                <div className="p-3">
                  <AnimatePresence mode="wait">
                    {step === "BRAND" && (
                      <motion.div
                        key="brand"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Select Brand
                          </span>
                          <button
                            onClick={handleCancel}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ChevronLeft size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(COLOR_BRANDS).map((brand) => (
                            <Button
                              key={brand}
                              variant="outline"
                              size="sm"
                              className="h-12 bg-background/50 hover:bg-background border-border/50 flex flex-col items-center justify-center gap-1 hover:text-accent"
                              onClick={() => {
                                setSelectedBrand(
                                  brand as keyof typeof COLOR_BRANDS
                                );
                                setStep("COLOR");
                              }}
                            >
                              <PaintRoller
                                size={14}
                                className="text-muted-foreground"
                              />
                              <span className="text-xs">{brand}</span>
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {step === "COLOR" && selectedBrand && (
                      <motion.div
                        key="color"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <button
                            onClick={() => setStep("BRAND")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {selectedBrand} Palette
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {COLOR_BRANDS[selectedBrand].map((color) => (
                            <button
                              key={color.code}
                              onClick={() => {
                                setSelectedColor(color);
                                setStep("CONFIRM");
                              }}
                              className="group flex flex-col items-center gap-1.5 focus:outline-none"
                            >
                              <div
                                className="w-10 h-10 rounded-full border shadow-sm transition-transform group-hover:scale-110"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-[9px] font-medium text-center leading-tight opacity-80">
                                {color.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {step === "CONFIRM" && selectedColor && (
                      <motion.div
                        key="confirm"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center text-center px-2"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-full border-2 shadow-md"
                            style={{
                              backgroundColor: selectedColor.hex,
                              borderColor: "rgba(0,0,0,0.1)",
                            }}
                          />
                          <div className="text-left">
                            <p className="text-sm font-semibold leading-none mb-1">
                              {selectedColor.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-none">
                              ID: {selectedColor.code}
                            </p>
                          </div>
                        </div>

                        {/* DELIVERY METHOD TOGGLE */}
                        <div className="w-full bg-muted/50 p-1 rounded-lg flex items-center mb-4 border border-border/50">
                          <button
                            onClick={() => setDeliveryMethod("email")}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-md transition-all duration-200",
                              deliveryMethod === "email"
                                ? "bg-background shadow-sm text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Mail size={13} />
                            Email Mockup
                          </button>
                          <button
                            onClick={() => setDeliveryMethod("sms")}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-md transition-all duration-200",
                              deliveryMethod === "sms"
                                ? "bg-background shadow-sm text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Smartphone size={13} />
                            SMS Mockup
                          </button>
                        </div>

                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs bg-background/50"
                            onClick={() => setStep("COLOR")}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                            onClick={handleConfirm}
                          >
                            <Check size={13} /> Generate
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {step === "LOADING" && (
                      <motion.div
                        key="loading"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center py-6"
                      >
                        <Loader2
                          size={24}
                          className="animate-spin text-indigo-500 mb-2"
                        />
                        <p className="text-xs font-medium text-muted-foreground">
                          Queuing AI Generator...
                        </p>
                      </motion.div>
                    )}

                    {step === "SUCCESS" && (
                      <motion.div
                        key="success"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center py-5"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-2">
                          <Check size={20} />
                        </div>
                        <p className="text-sm font-semibold mb-1">
                          Mockup Requested!
                        </p>
                        <p className="text-[11px] text-muted-foreground text-center">
                          You will receive it via{" "}
                          <span className="font-medium text-foreground capitalize">
                            {deliveryMethod}
                          </span>{" "}
                          shortly.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}