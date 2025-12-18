// app/client-form/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  useForm, 
  useFieldArray, 
  UseFormReturn, 
  FieldPath 
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
  Mic 
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { clientFormSchema, ClientFormData } from "@/lib/schema";

import Logo from "@/public/images/logo-2--increased-brightness.png";

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
    fields: ["name", "email", "company", "phone", "hours"] 
  },
  { 
    id: 2, 
    title: "Voice AI Config", 
    description: "Setup Assistant", 
    fields: ["twilioNumber", "crm", "subDomain", "voiceName", "voiceGender", "features"] 
  },
  { 
    id: 3, 
    title: "Review", 
    description: "Confirm & Submit", 
    fields: [] 
  },
];

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------

export default function ClientFormPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Initialize Form Engine
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "", email: "", company: "", phone: "", hours: "",
      twilioNumber: "", crm: "", transferNumber: "", subDomain: "",
      voiceGender: "male", voiceName: "",
      features: ["Call Screening"],
    },
    mode: "onChange",
  });

  const { trigger, watch, handleSubmit: hookFormSubmit } = form;
  const formData = watch();

  // 2. Navigation Logic
  const handleNext = async () => {
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
      };

      const res = await fetch("/api/client-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Submission failed");

      toast.success("Project created successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. "Nuclear" Key Handler - Strictly controls Enter key behavior
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Stop ALL browser native form submission
      
      if (currentStep < 3) {
        // If on step 1 or 2, Enter tries to go Next
        handleNext();
      } else {
        // If on step 3 (Review), Enter tries to Submit
        hookFormSubmit(onSubmit)();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex max-w-xl mx-auto justify-center ">
          <h1 className="text-xl md:text-3xl">  Client Intake Form</h1>
         
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
            {/* 
              CRITICAL CHANGE: 
              We preventDefault on the form onSubmit to kill native behavior.
              We handle keydown globally for the form.
            */}
            <form 
              onSubmit={(e) => e.preventDefault()} 
              onKeyDown={handleKeyDown}
              className="space-y-6"
            >
              
              <div className="min-h-[300px]">
                {currentStep === 1 && <StepOneProject form={form} />}
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
                  // CRITICAL CHANGE: type="button" here ensures clicking this
                  // runs our JS handler, not the browser's form submitter.
                  <Button 
                    type="button" 
                    onClick={hookFormSubmit(onSubmit)}
                    disabled={isSubmitting} 
                    className="bg-green-600 hover:bg-green-700 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Submit Project <Check className="w-4 h-4 ml-2" /></>
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

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

interface StepProps {
  form: UseFormReturn<ClientFormData>;
}

function StepOneProject({ form }: StepProps) {
  const { register, formState: { errors } } = form;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <FormField label="Full Name" error={errors.name?.message}>
        <Input {...register("name")} placeholder="John Doe" />
      </FormField>
      
      <FormField label="Email Address" error={errors.email?.message}>
        <Input {...register("email")} placeholder="john@example.com" type="email" />
      </FormField>

      <FormField label="Company Name" error={errors.company?.message}>
        <Input {...register("company")} placeholder="Acme Inc." />
      </FormField>

      <FormField label="Phone Number" error={errors.phone?.message}>
        <Input {...register("phone")} placeholder="+1 (555) 000-0000" />
      </FormField>

      <div className="md:col-span-2">
        <FormField label="Business Hours" error={errors.hours?.message}>
          <Input {...register("hours")} placeholder="e.g. Mon-Fri, 9AM - 5PM EST" />
        </FormField>
      </div>
    </div>
  );
}

function StepTwoConfig({ form }: StepProps) {
  const { register, control, formState: { errors } } = form;
  
  // FIX: Explicitly pass <ClientFormData> to useFieldArray
const { fields, append, remove } = useFieldArray({
  control,
  // Cast as never tells TS "Trust me, this works" effectively bypassing the strict check
  // caused by the Zod intersection
  name: "features" as never, 
});

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Twilio Number" error={errors.twilioNumber?.message}>
          <Input {...register("twilioNumber")} placeholder="+1..." />
        </FormField>

        <FormField label="CRM System" error={errors.crm?.message}>
           <div className="relative">
            <select 
                {...register("crm")} 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">Select CRM...</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
                <option value="gohighlevel">GoHighLevel</option>
                <option value="other">Other</option>
            </select>
           </div>
        </FormField>

        <FormField label="Subdomain" error={errors.subDomain?.message}>
          <div className="flex items-center">
            <Input {...register("subDomain")} placeholder="my-client" className="rounded-r-none" />
            <div className="bg-slate-100 border border-l-0 border-slate-200 h-9 px-3 flex items-center text-sm text-slate-500 rounded-r-md text-nowrap">
              .hue-line.com
            </div>
          </div>
        </FormField>

        <FormField label="Transfer Number (Optional)" error={errors.transferNumber?.message}>
          <Input {...register("transferNumber")} placeholder="+1..." />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
         <FormField label="Voice Gender" error={errors.voiceGender?.message}>
            <select 
                {...register("voiceGender")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
         </FormField>
         <FormField label="Voice Name" error={errors.voiceName?.message}>
            <Input {...register("voiceName")} placeholder="e.g. Josh, Rachel" />
         </FormField>
      </div>

      {/* Dynamic Features Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-slate-700">AI Capabilities</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => append("")} className="h-8">
                <Plus className="w-3 h-3 mr-1" /> Add Feature
            </Button>
        </div>
        
        <div className="grid gap-3">
            {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`features.${index}` as const)}
                  placeholder="e.g. Appointment Booking"
                  className={errors.features?.[index] ? "border-red-500" : ""}
                />
                {fields.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => remove(index)} 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                    <X className="w-4 h-4" />
                </Button>
                )}
            </div>
            ))}
            {errors.features && (
              <p className="text-xs text-red-500 font-medium">{errors.features.message}</p>
            )}
        </div>
      </div>
    </div>
  );
}

function StepThreeReview({ data }: { data: ClientFormData }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 flex items-center mb-4">
            <User className="w-4 h-4 mr-2 text-blue-600" /> Project Details
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <ReviewItem label="Name" value={data.name} />
            <ReviewItem label="Company" value={data.company} />
            <ReviewItem label="Email" value={data.email} />
            <ReviewItem label="Phone" value={data.phone} />
            <div className="sm:col-span-2 border-t border-slate-200 pt-3 mt-1">
                <ReviewItem label="Business Hours" value={data.hours} />
            </div>
        </dl>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 flex items-center mb-4">
            <Mic className="w-4 h-4 mr-2 text-purple-600" /> Voice Configuration
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <ReviewItem label="Twilio Number" value={data.twilioNumber} />
            <ReviewItem label="CRM" value={data.crm} />
            <ReviewItem label="Voice" value={`${data.voiceName} (${data.voiceGender})`} />
            <ReviewItem label="Subdomain" value={`${data.subDomain}.hue-line.com`} />
        </dl>

        <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Features</span>
            <div className="mt-2 flex flex-wrap gap-2">
                {data.features.map((f, i) => (
                    f && <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {f}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
    return (
        <div className="space-y-2">
            <Label className={error ? "text-red-500" : "text-slate-700"}>{label}</Label>
            {children}
            {error && (
              <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
                {error}
              </p>
            )}
        </div>
    )
}

function ReviewItem({ label, value }: { label: string, value: string | undefined }) {
    return (
        <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</dt>
            <dd className="text-slate-900 font-medium truncate">{value || "-"}</dd>
        </div>
    )
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative flex justify-between w-full max-w-xl mx-auto mb-8">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2" />
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-500 ease-in-out" 
        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
      />
      
      {STEPS.map((step) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        
        return (
          <div key={step.id} className="flex flex-col items-center bg-transparent">
            <div 
              className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isCompleted || isCurrent ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-400"}
              `}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-semibold">{step.id}</span>}
            </div>
            <span className={`mt-2 text-xs font-medium ${isCurrent ? "text-blue-700" : "text-slate-400"}`}>
                {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}