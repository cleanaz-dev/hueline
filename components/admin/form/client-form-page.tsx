// app/client-form/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";
import Logo from "@/public/images/logo-2--increased-brightness.png";
import FeaturesList from "@/components/admin/form/features-list";
import ClientInformationList from "@/components/admin/form/client-information-list";
import {
  ClientFormData,
  ClientInformationData,
  FeaturesData,
  clientFormSchema,
} from "@/lib/schema";
import { toast } from "sonner";

export default function ClientFormPage() {
  const [form, setForm] = useState<ClientFormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    hours: "",
    features: [""],
    twilioNumber: "",
    crm: "",
    transferNumber: "",
    subDomain: "",
    voiceGender: "male",
    voiceName: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ClientFormData, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ------------------------------
  // Handlers
  // ------------------------------

  const handleClientInfoChange = (clientInfo: ClientInformationData): void => {
    setForm({ ...form, ...clientInfo });
  };

  const handleFeaturesChange = (featuresData: FeaturesData): void => {
    setForm({ ...form, ...featuresData });
  };

  const handleFeatureChange = (index: number, value: string): void => {
    const newFeatures = [...form.features];
    newFeatures[index] = value;
    setForm({ ...form, features: newFeatures });
  };

  const addFeature = (): void => {
    setForm({ ...form, features: [...form.features, ""] });
  };

  const removeFeature = (index: number): void => {
    if (form.features.length > 1) {
      const newFeatures = form.features.filter((_, i) => i !== index);
      setForm({ ...form, features: newFeatures });
    }
  };

  // ------------------------------
  // Submit Handler
  // ------------------------------

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    const filteredFeatures = form.features.filter((f) => f.trim() !== "");
    const formData: ClientFormData = { ...form, features: filteredFeatures };

    const result = clientFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ClientFormData, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ClientFormData;
        if (key) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/client-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data: { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Error saving form");

      setMessage("✅ Form saved successfully!");
      setForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        hours: "",
        features: [""],
        twilioNumber: "",
        crm: "",
        transferNumber: "",
        subDomain: "",
        voiceGender: "male",
        voiceName: "",
      });

      setTimeout(() => setMessage(""), 5000);
      toast.success("Form Submitted Successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unexpected error occurred";
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Render
  // ------------------------------

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-10 px-2 md:px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-4 md:mb-8">
          <Image src={Logo} width={150} height={150} priority alt="logo" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-blue-950">
              Client Intake Form
            </CardTitle>
            <CardDescription>
              Tell us about your project and we&apos;ll get back to you soon.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {message && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  message.includes("✅")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Information List Component */}
              <ClientInformationList
                data={{
                  name: form.name,
                  email: form.email,
                  company: form.company,
                  phone: form.phone,
                  hours: form.hours,
                }}
                onChange={handleClientInfoChange}
                disabled={loading}
                errors={{
                  name: errors.name,
                  email: errors.email,
                  company: errors.company,
                  phone: errors.phone,
                  hours: errors.hours,
                }}
              />

             

              {/* Features List Component */}

              <FeaturesList
                data={{
                  twilioNumber: form.twilioNumber,
                  crm: form.crm,
                  transferNumber: form.transferNumber,
                  subDomain: form.subDomain,
                  voiceGender: form.voiceGender,
                  voiceName: form.voiceName,
                }}
                onChange={handleFeaturesChange}
                disabled={loading}
                errors={{
                  twilioNumber: errors.twilioNumber,
                  crm: errors.crm,
                  transferNumber: errors.transferNumber,
                  subDomain: errors.subDomain,
                  voiceGender: errors.voiceGender,
                  voiceName: errors.voiceName,
                }}
              />

               {/* Features Array Section */}
              <div>
                <header className="mb-4">
                  <h1 className="text-xl text-blue-950 font-medium">
                    Additional Features
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    List the features you want for your AI assistant
                  </p>
                </header>
                <div className="space-y-4">
                  {form.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Feature ${
                          index + 1
                        } (e.g., Call screening, Appointment scheduling)`}
                        value={feature}
                        onChange={(e) =>
                          handleFeatureChange(index, e.target.value)
                        }
                        disabled={loading}
                        className={errors.features ? "border-red-500" : ""}
                      />
                      {form.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFeature(index)}
                          disabled={loading}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {errors.features && (
                    <p className="text-sm text-red-600">{errors.features}</p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    disabled={loading}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Feature
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Form"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
