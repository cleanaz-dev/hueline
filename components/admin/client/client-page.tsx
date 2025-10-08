"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Search, X } from "lucide-react";
import Logo from "@/public/images/logo3-2-min.png";
import Image from "next/image";

export default function ClientPage() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchClient = async () => {
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/client-form?email=${email}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Client not found");
      }

      setData(json.data || null);
      if (!json.data) {
        setError("No client found with that email");
      }
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const saveClient = async () => {
    if (!data) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/client-form/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save changes");
      }

      setSuccessMessage("✅ Changes saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendSubscription = async () => {
    if (!data.email) return setError("Missing client email");

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/email/send-subscription-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          company: data.company,
        }),
      });

      if (!res.ok) throw new Error("Failed to send subscription email");

      setSuccessMessage("✅ Subscription link email sent!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  function updateFeature(index: number, value: string) {
    const updated = [...data.features];
    updated[index] = value;
    setData({ ...data, features: updated });
  }

  function addFeature() {
    setData({ ...data, features: [...data.features, ""] });
  }

  function removeFeature(index: number) {
    const updated = data.features.filter((_: any, i: number) => i !== index);
    setData({ ...data, features: updated });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-1 md:py-12 md:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-8">
          <Image src={Logo} width={125} height={125} priority alt="logo" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl md:text-3xl">Find Client</CardTitle>
            <CardDescription>
              Search for a client by email to edit their information
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchClient()}
                  disabled={loading}
                />
              </div>
              <Button onClick={fetchClient} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {data && (
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Update the client details below</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="p-4 md:p-6 bg-slate-50 rounded-2xl mb-2 md:mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                  {/* Title */}
                  <h2 className="text-lg md:text-xl font-semibold text-slate-700">
                    Subscription Info
                  </h2>

                  <div className="flex  gap-3">
                    {/* Setup Fee Status */}
                    <Button
                      disabled
                      className={`px-4 py-2 rounded-lg font-medium ${
                        data.feePaid
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {data.feePaid
                        ? "Paid Setup Fee"
                        : "Setup Fee Not Paid Yet"}
                    </Button>

                    {/* Subscription Status */}
                    <Button
                      onClick={
                        !data.subscribed && !data.subLinkSent
                          ? handleSendSubscription
                          : undefined
                      }
                      disabled={data.subscribed || data.subLinkSent}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        data.subscribed
                          ? "bg-blue-100 text-blue-800 cursor-not-allowed"
                          : data.subLinkSent
                          ? "bg-green-100 text-green-800 cursor-not-allowed"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {data.subscribed
                        ? "Subscribed"
                        : data.subLinkSent
                        ? "Sub Link Sent"
                        : "Not Subscribed (Send Link)"}
                    </Button>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveClient();
                }}
                className="space-y-6"
              >
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="John Doe"
                    disabled={saving}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={data.email}
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value })
                    }
                    placeholder="john@company.com"
                    disabled={saving}
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={data.company}
                    onChange={(e) =>
                      setData({ ...data, company: e.target.value })
                    }
                    placeholder="Acme Inc."
                    disabled={saving}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone || ""}
                    onChange={(e) =>
                      setData({ ...data, phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                    disabled={saving}
                  />
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Label>Project Features</Label>
                  <div className="space-y-3">
                    {data.features.map((feature: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="e.g., Voice AI integration"
                          disabled={saving}
                          className="flex-1"
                        />
                        {data.features.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeFeature(index)}
                            disabled={saving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    onClick={addFeature}
                    disabled={saving}
                    className="px-0"
                  >
                    + Add another feature
                  </Button>
                </div>

                {/* Preferred Hours */}
                <div className="space-y-2">
                  <Label htmlFor="hours">Preferred Contact Hours</Label>
                  <Input
                    id="hours"
                    value={data.hours || ""}
                    onChange={(e) =>
                      setData({ ...data, hours: e.target.value })
                    }
                    placeholder="e.g., 9am–5pm EST"
                    disabled={saving}
                  />
                </div>

                {/* Save Button */}
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Client Information"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
