"use client"


import { useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
  UseFormReturn,
  FieldPath,
} from "react-hook-form";


// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { ClientFormData } from "@/lib/schema";
import { NORTH_AMERICA_REGIONS } from "@/lib/locations";
import TwilioNumberSelector from "../../twilio/twilio-number-search";
import { StepIndicator } from "../functions/step-indicator";
import { Mic, Plus, User, X } from "lucide-react";

type StatusType = "idle" | "checking" | "taken" | "available";

interface StepProps {
  form: UseFormReturn<ClientFormData>;
}

interface StepOneProps extends StepProps {
  emailStatus: StatusType;
  setEmailStatus: React.Dispatch<React.SetStateAction<StatusType>>;
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className={error ? "text-red-500" : "text-slate-700"}>
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </dt>
      <dd className="text-slate-900 font-medium truncate">{value || "-"}</dd>
    </div>
  );
}




export function StepOneProject({ form, emailStatus, setEmailStatus }: StepOneProps) {
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  const email = watch("email");
  const selectedCountry = watch("country") as "Canada" | "USA";

  // Email Debounce Checker
  useEffect(() => {
    // Basic regex check so we don't query partial/invalid emails to the DB
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus("idle");
      return;
    }

    setEmailStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/check-email?email=${encodeURIComponent(email)}`,
        );
        const data = await res.json();

        if (data.available) {
          setEmailStatus("available");
          if (errors.email?.type === "manual") clearErrors("email");
        } else {
          setEmailStatus("taken");
          setError("email", {
            type: "manual",
            message: "This email is already registered.",
          });
        }
      } catch {
        setEmailStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, setEmailStatus, setError, clearErrors, errors.email?.type]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <FormField label="First Name" error={errors.firstName?.message}>
        <Input {...register("firstName")} placeholder="John" />
      </FormField>
      <FormField label="Last Name" error={errors.lastName?.message}>
        <Input {...register("lastName")} placeholder="Doe" />
      </FormField>

      <FormField label="Email Address" error={errors.email?.message}>
        <Input
          {...register("email")}
          placeholder="john@example.com"
          type="email"
        />
        {/* Email Status Indicators */}
        {/* Email Status Indicators */}
        {!errors.email && emailStatus === "checking" && (
          <p className="text-xs text-slate-400 mt-1">
            Checking availability...
          </p>
        )}
        {!errors.email && emailStatus === "available" && (
          <p className="text-xs text-green-500 mt-1">Email is available!</p>
        )}
      </FormField>

      <FormField label="Company Name" error={errors.company?.message}>
        <Input {...register("company")} placeholder="Acme Inc." />
      </FormField>

      <FormField label="Phone Number" error={errors.phone?.message}>
        <Input {...register("phone")} placeholder="+1 (555) 000-0000" />
      </FormField>

      <FormField label="Business Hours" error={errors.hours?.message}>
        <Input
          {...register("hours")}
          placeholder="e.g. Mon-Fri, 9AM - 5PM EST"
        />
      </FormField>

      <FormField label="Country" error={errors.country?.message}>
        <select
          {...register("country", {
            // Reset the state field when the user switches countries
            onChange: () => setValue("state", ""),
          })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="USA">United States</option>
          <option value="Canada">Canada</option>
        </select>
      </FormField>

      <FormField
        label={selectedCountry === "Canada" ? "Province" : "State"}
        error={errors.state?.message}
      >
        <select
          {...register("state")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          disabled={!selectedCountry}
        >
          <option value="">
            Select a {selectedCountry === "Canada" ? "Province" : "State"}...
          </option>
          {selectedCountry &&
            NORTH_AMERICA_REGIONS[selectedCountry].map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
        </select>
      </FormField>

      <div className="md:col-span-2">
        <FormField label="City" error={errors.city?.message}>
          <Input {...register("city")} placeholder="e.g. Toronto" />
        </FormField>
      </div>
    </div>
  );
}

export function StepTwoConfig({ form }: StepProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;
  const subDomain = watch("subDomain");
  const [subdomainStatus, setSubdomainStatus] = useState<StatusType>("idle");
  const [twilioRoutingNumber, setTwilioRoutingNumber] = useState("");

  useEffect(() => {
    if (!subDomain || subDomain.length < 2) {
      setSubdomainStatus("idle");
      return;
    }

    setSubdomainStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/check-subdomain?slug=${subDomain}`);
        const data = await res.json();
        setSubdomainStatus(data.available ? "available" : "taken");
      } catch {
        setSubdomainStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [subDomain]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features" as never,
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TwilioNumberSelector onSelect={(num) => setTwilioRoutingNumber(num)} />
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
            <Input
              {...register("subDomain")}
              placeholder="my-client"
              className="rounded-r-none"
            />
            <div className="bg-slate-100 border border-l-0 border-slate-200 h-9 px-3 flex items-center text-sm text-slate-500 rounded-r-md text-nowrap">
              .hue-line.com
            </div>
          </div>
          {subdomainStatus === "checking" && (
            <p className="text-xs text-slate-400 mt-1">Checking...</p>
          )}
          {subdomainStatus === "taken" && (
            <p className="text-xs text-red-500 mt-1">
              Subdomain cannot be used
            </p>
          )}
          {subdomainStatus === "available" && (
            <p className="text-xs text-green-500 mt-1">Available!</p>
          )}
        </FormField>

        <FormField
          label="Transfer Number (Optional)"
          error={errors.transferNumber?.message}
        >
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

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold text-slate-700">
            AI Capabilities
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append("")}
            className="h-8"
          >
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
            <p className="text-xs text-red-500 font-medium">
              {errors.features.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StepThreeReview({ data }: { data: ClientFormData }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 flex items-center mb-4">
          <User className="w-4 h-4 mr-2 text-blue-600" /> Project Details
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <ReviewItem label="First Name" value={data.firstName} />
          <ReviewItem label="Last Name" value={data.lastName} />
          <ReviewItem label="Company" value={data.company} />
          <ReviewItem label="Email" value={data.email} />
          <ReviewItem label="Phone" value={data.phone} />
          <ReviewItem label="Country" value={data.country} />
          <ReviewItem label="State" value={data.state} />
          <ReviewItem label="City" value={data?.city || "Add City"} />
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
          <ReviewItem
            label="Voice"
            value={`${data.voiceName} (${data.voiceGender})`}
          />
          <ReviewItem
            label="Subdomain"
            value={`${data.subDomain}.hue-line.com`}
          />
        </dl>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Features
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.features.map(
              (f, i) =>
                f && (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {f}
                  </span>
                ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}