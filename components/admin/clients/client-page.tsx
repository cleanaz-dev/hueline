"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";
import Logo from "@/public/images/logo-2--increased-brightness.png";
import { BookingTable } from "./booking-table";
import { ClientStages } from "./client-stages";
import { ClientConfigSection } from "./client-config-section";
import { ClientInformationSection } from "./client-information-section";
import { ClientUISection } from "./client-ui-section";

// ------------------------------
// Types
// ------------------------------

interface ClientConfig {
  twilioNumber?: string;
  crm?: string;
  transferNumber?: string;
  subDomain?: string;
  voiceGender?: string;
  voiceName?: string;
  [key: string]: string | undefined; // Add index signature
}

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
  config?: ClientConfig;
  subdomain?: {
    // Change from logoUrl/splashScreenUrl to nested subdomain
    logo?: string;
    splashScreen?: string;
  };
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

  console.log("client data:", data);

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
          stage: newStage,
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

  const handleDataChange = (updates: Partial<ClientData>) => {
    if (!data) return;
    setData({ ...data, ...updates });
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
              <CardTitle className="md:text-2xl">Client</CardTitle>
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
                <ClientInformationSection
                  data={data}
                  onDataChange={handleDataChange}
                  disabled={saving}
                />

                <ClientConfigSection
                  config={data.config}
                  onConfigChange={(newConfig) =>
                    handleDataChange({ config: newConfig })
                  }
                  disabled={saving}
                />
                <ClientUISection
                  logoUrl={data.subdomain?.logo || ""}
                  splashScreenUrl={data.subdomain?.splashScreen || ""}
                  onLogoUrlChange={(url) =>
                    handleDataChange({
                      subdomain: {
                        ...data.subdomain,
                        logo: url,
                      },
                    })
                  }
                  onSplashScreenUrlChange={(url) =>
                    handleDataChange({
                      subdomain: {
                        ...data.subdomain,
                        splashScreen: url,
                      },
                    })
                  }
                  disabled={saving}
                />
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
