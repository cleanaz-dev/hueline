"use client";

import { useState, KeyboardEvent } from "react";
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
import Image from "next/image";
import Logo from "@/public/images/logo-2--increased-brightness.png";
import { BookingTable } from "./booking-table";
import { ClientStages } from "./client-stages"; // Updated import

// ------------------------------
// Types
// ------------------------------

interface ClientData {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  features: string[];
  hours?: string;
  stage: string;
  activities: FormActivity[];
}

interface FormActivity {
  action: string;
  createdAt: string;
  details?: string;
}

interface BookingData {
  id?: string;
  name: string;
  phone: string;
  createdAt?: Date;
}

interface ClientPageProps {
  bookingData: BookingData[];
}
// ------------------------------
// Component
// ------------------------------

export default function ClientPage({ bookingData }: ClientPageProps) {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showList, setShowList] = useState(false);


  // ------------------------------
  // Handlers
  // ------------------------------

  const fetchClient = async (): Promise<void> => {
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch(
        `/api/client-form?email=${encodeURIComponent(email)}`
      );
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Client not found");

      const client: ClientData | null = json.data;
      if (!client) {
        setError("No client found with that email");
        setData(null);
      } else {
        setData(client);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const saveClient = async (): Promise<void> => {
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

      if (!res.ok) throw new Error("Failed to save changes");

      setSuccessMessage("✅ Changes saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

const handleUpdateStage = async (newStage: string): Promise<void> => {
  if (!data?.email) return;

  setSaving(true);
  setError("");

  try {
    const res = await fetch(`/api/client/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: data.email, 
        stage: newStage 
      }),
    });

    if (!res.ok) throw new Error("Failed to update stage");

    setData({ ...data, stage: newStage });
    setSuccessMessage("✅ Stage updated!");
    setTimeout(() => setSuccessMessage(""), 2000);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to update stage");
  } finally {
    setSaving(false);
  }
};
  const updateFeature = (index: number, value: string): void => {
    if (!data) return;
    const updated = [...data.features];
    updated[index] = value;
    setData({ ...data, features: updated });
  };

  const addFeature = (): void => {
    if (!data) return;
    setData({ ...data, features: [...data.features, ""] });
  };

  const removeFeature = (index: number): void => {
    if (!data) return;
    const updated = data.features.filter((_, i) => i !== index);
    setData({ ...data, features: updated });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") fetchClient();
  };


  // ------------------------------
  // Render
  // ------------------------------

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-1 md:py-8 md:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-8">
          <Image src={Logo} width={140} height={140} priority alt="logo" />
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
                  onKeyDown={handleKeyDown}
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
                    <Search className="md:mr-2 h-4 w-4" />
                    <span className="hidden md:flex">Search</span>
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

            <BookingTable
              bookingData={bookingData}
              showList={showList}
              setShowList={setShowList}
            />
          </CardContent>
        </Card>

        {data && (
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Update the client details below</CardDescription>
            </CardHeader>

            <CardContent>
             <ClientStages
                data={data}
                stage={data.stage}
                saving={saving}
                activities={data.activities || []}
                onUpdateStage={handleUpdateStage}
              />


              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveClient();
                }}
                className="space-y-6"
              >
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

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone ?? ""}
                    onChange={(e) =>
                      setData({ ...data, phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project Features</Label>
                  <div className="space-y-3">
                    {data.features.map((feature, index) => (
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

                <div className="space-y-2">
                  <Label htmlFor="hours">Preferred Contact Hours</Label>
                  <Input
                    id="hours"
                    value={data.hours ?? ""}
                    onChange={(e) =>
                      setData({ ...data, hours: e.target.value })
                    }
                    placeholder="e.g., 9am–5pm EST"
                    disabled={saving}
                  />
                </div>

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
