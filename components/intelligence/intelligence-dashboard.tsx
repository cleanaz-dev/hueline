"use client";

import { useState, useMemo } from "react";
import { useOwner } from "@/context/owner-context";
import { Cpu } from "lucide-react";
import { SubdomainAccountData } from "@/types/subdomain-type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OwnerPageHeader from "../owner/owner-page.header";

// Imports to your new separate components
import { PricingTab } from "./pricing-tab";
import { ListeningTab } from "./listening-tab";
import { RoomVisionTab } from "./room-vision-tab";
import { IntelligenceModal } from "./create-intelligence-modal";
import { IntelligenceConfig } from "./types";

export default function IntelligenceDashboardPage() {
  const { subdomain } = useOwner() as {
    subdomain: SubdomainAccountData | null;
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!subdomain) {
    return <div className="p-8 text-zinc-400">Loading Configuration...</div>;
  }

  const rawIntel = subdomain.intelligence;
  const hasIntelligence = !!rawIntel;

  const adaptedConfig: IntelligenceConfig = useMemo(() => {
    if (!rawIntel)
      return { prompt: "", priceBook: [], contextFlags: [], examples: [] };
    return {
      prompt: rawIntel.prompt || "",
      priceBook: (rawIntel.priceBook as any) || [],
      contextFlags: (rawIntel.contextFlags as any) || [],
      examples: (rawIntel.examples as any) || [],
    };
  }, [rawIntel]);

  const handleSaveIntelligence = async (newConfig: IntelligenceConfig) => {
    if (!rawIntel?.id) return;
    setIsSaving(true);
    try {
      await fetch(`/api/${subdomain.slug}/intelligence/${rawIntel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto">
      <OwnerPageHeader
        title="Intelligence"
        description="Review the active logic gates, pricing models, and vision."
        icon={<Cpu className="size-6 text-zinc-500" />}
        addButtonLabel={
          hasIntelligence ? "Update Intelligence" : "Create Intelligence"
        }
        onAddClick={() => setIsModalOpen(true)}
      />

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="bg-transparent p-0 border-b border-zinc-200 w-full justify-start h-auto rounded-none gap-6 mb-8">
          <TabsTrigger
            value="pricing"
            className="rounded-none border-b-3 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:shadow-none cursor-pointer hover:bg-muted rounded-md"
          >
            Pricing Logic
          </TabsTrigger>
          <TabsTrigger
            value="listening"
            className="rounded-none border-b-3 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:shadow-none cursor-pointer hover:bg-muted rounded-md"
          >
            Active Listening
          </TabsTrigger>
          <TabsTrigger
            value="room"
            className="rounded-none border-b-3 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:shadow-none cursor-pointer hover:bg-muted rounded-md"
          >
            Room Vision
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <PricingTab config={adaptedConfig} />
        </TabsContent>

        <TabsContent value="listening">
          <ListeningTab flags={adaptedConfig.contextFlags} />
        </TabsContent>

        <TabsContent value="room">
          <RoomVisionTab examples={adaptedConfig.examples} />
        </TabsContent>
      </Tabs>

      <IntelligenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={adaptedConfig}
      />
    </div>
  );
}
