import { ClientFormData } from "@/lib/schema";
import { Check } from "lucide-react";
import {
  useForm,
  useFieldArray,
  UseFormReturn,
  FieldPath,
} from "react-hook-form";

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

export function StepIndicator({ currentStep }: { currentStep: number }) {
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
          <div
            key={step.id}
            className="flex flex-col items-center bg-transparent"
          >
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isCompleted || isCurrent ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-400"}
              `}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="font-semibold">{step.id}</span>
              )}
            </div>
            <span
              className={`mt-2 text-xs font-medium ${isCurrent ? "text-blue-700" : "text-slate-400"}`}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}