"use client";

import { useOwner } from "@/context/owner-context";
import { SubdomainAccountData } from "@/types/subdomain-type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OwnerPageHeader from "../owner/owner-page.header";

// Imports for your separate components
import { PricingTab } from "./pricing-tab";
import { ListeningTab } from "./listening-tab";
import { RoomVisionTab } from "./room-vision-tab";
import { useRouter } from "next/navigation";
import { Cpu } from "lucide-react"; // Added this to fix the icon error

export default function IntelligenceDashboardPage() {
  const { subdomain } = useOwner() as { subdomain: SubdomainAccountData | null };
  const { push } = useRouter();

  if (!subdomain) {
    return <div>Loading Configuration...</div>;
  }

  // We only need the ID now to navigate, we don't need the whole rawIntel object
  const intelligenceId = subdomain.intelligence?.id;
  const hasIntelligence = !!intelligenceId;

  const handleButtonClick = () => {
    if (intelligenceId) {
      // Added backticks to make this a proper template literal string
      push(`/my/intelligence/${intelligenceId}`);
    } else {
      // Fallback route if they need to create one
      push(`/my/intelligence/new`); 
    }
  };

  return (
    <div className="w-full">
      <OwnerPageHeader 
        title="Intelligence" 
        description="Review the active logic gates, pricing models, and vision." 
        icon={<Cpu />} 
        addButtonLabel={hasIntelligence ? "View Intelligence" : "Create Intelligence"} 
        onAddClick={handleButtonClick} 
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
          {/* Removed `config={adaptedConfig}` since adaptedConfig was undefined and you are using hardcoded examples inside the tab now */}
          <PricingTab />
        </TabsContent>

        <TabsContent value="listening">
          <ListeningTab />
        </TabsContent>

        <TabsContent value="room">
          <RoomVisionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

