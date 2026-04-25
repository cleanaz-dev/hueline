"use client";

import React, { useState, useEffect } from "react";
import {
  useForm,
  useFieldArray,
  UseFormReturn,
  FieldPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Mic,
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { clientFormSchema, ClientFormData } from "@/lib/schema";
import { StepIndicator } from "./functions/step-indicator";
import {
  StepOneProject,
  StepThreeReview,
  StepTwoConfig,
} from "./functions/form-steps";
import { Client } from "@/app/generated/prisma";
// ----------------------------------------------------------------------
// Types & Constants
// ----------------------------------------------------------------------

type StepItem = {
  id: number;
  title: string;
  description: string;
  fields: FieldPath<ClientFormData>[];
};

const STEPS: StepItem[] = [
  {
    id: 1,
    title: "Project Details",
    description: "Contact & Business Info",
    fields: [
      "firstName",
      "lastName",
      "email",
      "company",
      "phone",
      "country",
      "state",
      "city",
      "hours",
    ],
  },
  {
    id: 2,
    title: "Voice AI",
    description: "Setup Assistant",
    fields: [
      "twilioNumber",
      "crm",
      "subDomain",
      "voiceName",
      "voiceGender",
      "features",
    ],
  },
  {
    id: 3,
    title: "Review",
    description: "Confirm & Submit",
    fields: [],
  },
];

type StatusType = "idle" | "checking" | "taken" | "available";

interface Props {
  client?: Client;
}

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------

export default function ClientFormPage({ client }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState<StatusType>("idle");

  // 1. Initialize Form Engine
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: client?.email || "",
      email: "",
      company: "",
      phone: "",
      hours: "",
      country: "Canada",
      state: "",
      city: "",
      twilioNumber: "",
      crm: "",
      transferNumber: "",
      subDomain: "",
      voiceGender: "male",
      voiceName: "",
      features: ["Live Transfer"],
    },
    mode: "onChange",
  });

  const { trigger, watch, setError, handleSubmit: hookFormSubmit } = form;
  const formData = watch();

  // 2. Navigation Logic
  const handleNext = async () => {
    // Prevent moving forward if email is taken or still checking
    if (currentStep === 1) {
      if (emailStatus === "taken") {
        setError("email", {
          type: "manual",
          message: "This email is already registered.",
        });
        return;
      }
      if (emailStatus === "checking") {
        return; // Optionally add a toast here like "Please wait, verifying email..."
      }
    }

    const currentStepFields = STEPS[currentStep - 1].fields;
    const isStepValid = await trigger(currentStepFields);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // 3. Submission Logic
  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      const cleanedData = {
        ...data,
        features: data.features.filter((f) => f.trim() !== ""),
        clientId: client?.id || undefined,
      };

      const res = await fetch("/api/admin/client-form", {
        // Make sure this matches your endpoint correctly
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Submission failed");

      toast.success("Project created successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Key Handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentStep < 3) {
        handleNext();
      } else {
        hookFormSubmit(onSubmit)();
      }
    }
  };

  return (
    <div className="admin-first-div">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col items-center max-w-2xl mx-auto text-center">
          <h1 className="text-xl md:text-3xl">Client Intake Form</h1>

          {client ? (
            <div className="flex flex-col items-center mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20">
                <User className="h-4 w-4" />
                {client.email}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Stripe Verified
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800 ring-1 ring-inset ring-slate-500/20 mt-2">
              Manual Entry
            </span>
          )}
        </div>

        <StepIndicator currentStep={currentStep} />

        <Card className="border-0 shadow-xl ring-1 ring-slate-200/50">
          <CardHeader className="border-b bg-white/50 pb-8">
            <CardTitle className="text-2xl text-slate-800">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-base">
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form
              onSubmit={(e) => e.preventDefault()}
              onKeyDown={handleKeyDown}
              className="space-y-6"
            >
              <div className="min-h-75">
                {currentStep === 1 && (
                  <StepOneProject
                    form={form}
                    emailStatus={emailStatus}
                    setEmailStatus={setEmailStatus}
                  />
                )}
                {currentStep === 2 && <StepTwoConfig form={form} />}
                {currentStep === 3 && <StepThreeReview data={formData} />}
              </div>

              <div className="flex items-center justify-between pt-6 border-t mt-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                  className="text-slate-500 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={hookFormSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 min-w-35"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Submit Project <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
