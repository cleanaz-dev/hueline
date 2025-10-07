"use client";
import React, { useState } from "react";
import Logo from "@/public/images/logo3-2-min.png";
import Image from "next/image";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";

const clientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name is required"),
  phone: z.string().optional(),
  features: z.array(z.string().min(1, "Feature cannot be empty")).min(1, "At least one feature is required"),
  hours: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export default function ClientFormPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    features: [""],
    hours: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateFeature(index: number, value: string) {
    const updated = [...form.features];
    updated[index] = value;
    setForm({ ...form, features: updated });
  }

  function addFeature() {
    setForm({ ...form, features: [...form.features, ""] });
  }

  function removeFeature(index: number) {
    const updated = form.features.filter((_, i) => i !== index);
    setForm({ ...form, features: updated });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    const filteredFeatures = form.features.filter(f => f.trim() !== "");
    const formData = { ...form, features: filteredFeatures };

    const result = clientFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof ClientFormData] = issue.message;
        }
      });
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error saving form");

      setMessage("✅ Form saved successfully!");
      setForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        features: [""],
        hours: "",
      });
      
      setTimeout(() => setMessage(""), 5000);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-8">
          <Image src={Logo} width={125} height={125} priority alt="logo" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Client Intake Form</CardTitle>
            <CardDescription>
              Tell us about your project and we'll get back to you soon.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.includes("✅") 
                  ? "bg-green-50 border border-green-200 text-green-700" 
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={loading}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">
                  Company <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Acme Inc."
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  disabled={loading}
                  className={errors.company ? "border-red-500" : ""}
                />
                {errors.company && (
                  <p className="text-sm text-red-600">{errors.company}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  disabled={loading}
                />
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label>
                  Project Features <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-3">
                  {form.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="e.g., Voice AI integration, Custom chatbot"
                        disabled={loading}
                        className="flex-1"
                      />
                      {form.features.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeFeature(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.features && (
                  <p className="text-sm text-red-600">{errors.features}</p>
                )}
                <Button
                  type="button"
                  variant="link"
                  onClick={addFeature}
                  disabled={loading}
                  className="px-0"
                >
                  + Add another feature
                </Button>
              </div>

              {/* Preferred Hours */}
              <div className="space-y-2">
                <Label htmlFor="hours">Hours of Operation</Label>
                <Input
                  id="hours"
                  type="text"
                  placeholder="e.g., 9am–5pm EST"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  disabled={loading}
                />
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