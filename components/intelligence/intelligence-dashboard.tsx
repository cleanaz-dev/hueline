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
import { IntelligenceConfig, IntelligenceModal } from "./create-intelligence-model";

export default function IntelligenceDashboardPage() {
  const { subdomain } = useOwner() as {
    subdomain: SubdomainAccountData | null;
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!subdomain) {
    return <div className="p-8 text-zinc-400">Loading Configuration...</div>;
  }

  const rawIntel = subdomain.intelligence;
  const hasIntelligence = !!rawIntel;

  // Data Adapter: Maps legacy dynamic variables into the structured PriceBook config on the fly
  const adaptedConfig: IntelligenceConfig = useMemo(() => {
    if (!rawIntel) return { prompt: "", priceBook: [], contextFlags: [] };

    // 1. If it's already using the new PriceBook schema
    if ((rawIntel.values as any)?.priceBook) {
      return {
        prompt: rawIntel.prompt || "",
        priceBook: (rawIntel.values as any).priceBook,
        contextFlags: (rawIntel.values as any).contextFlags || [],
      };
    }

    // 2. Legacy adapter for existing DB rows
    const legacyValues = (rawIntel.values as Record<string, any>) || {};
    const legacySchema = (rawIntel.schema as Record<string, string>) || {};

    const priceBook = Object.entries(legacyValues).map(([k, v]) => {
      const isObj = typeof v === "object" && v !== null;
      const val = isObj ? v.value : (v as number);
      const type = isObj ? v.type : (val < 2 && val > 0 ? "MULTIPLIER" : "FLAT_FEE");
      const label = isObj && v.label ? v.label : k.replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim();

      return {
        id: crypto.randomUUID(),
        name: label,
        amount: val,
        type: type,
      };
    });

    const contextFlags = Object.keys(legacySchema).filter((k) => legacySchema[k] === "boolean");

    return { prompt: rawIntel.prompt || "", priceBook, contextFlags };
  }, [rawIntel]);

  const roomJson = (subdomain.roomIntelligence?.intelligence as any) || {};
  const roomExamples = roomJson.examples || [];

  const handleSaveIntelligence = async (newConfig: IntelligenceConfig) => {
    console.log("Saving new logic:", newConfig);
    // TODO: Await your server action here
    setIsModalOpen(false);
  };

  return (
    <div className="container max-w-7xl mx-auto">
      <OwnerPageHeader
        title="Intelligence"
        description="Review the active logic gates, pricing models, and vision."
        icon={<Cpu className="size-6 text-zinc-500" />}
        addButtonLabel={hasIntelligence ? "Update Intelligence" : "Create Intelligence"}
        onAddClick={() => setIsModalOpen(true)}
      />

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="bg-transparent p-0 border-b border-zinc-200 w-full justify-start h-auto rounded-none gap-6 mb-8">
          <TabsTrigger value="pricing" className="rounded-none border-b-3 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:shadow-none cursor-pointer hover:bg-muted rounded-md">
            Pricing Logic
          </TabsTrigger>
          <TabsTrigger value="listening" className="rounded-none border-b-3 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:shadow-none cursor-pointer hover:bg-muted rounded-md">
            Active Listening
          </TabsTrigger>
          <TabsTrigger value="room" className="rounded-none border-b-3 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:shadow-none cursor-pointer hover:bg-muted rounded-md">
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
          <RoomVisionTab examples={roomExamples} />
        </TabsContent>
      </Tabs>

      <IntelligenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={adaptedConfig}
        onSave={handleSaveIntelligence}
      />
    </div>
  );
}