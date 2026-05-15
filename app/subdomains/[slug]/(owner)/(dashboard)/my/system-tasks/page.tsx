"use client"

import OwnerPageHeader from "@/components/owner/owner-page.header";
import { HatGlasses } from "lucide-react";
import { useOwner } from "@/context/owner-context";

export default function Page() {

  const { setReportTaskDialogOpen } = useOwner()
  return (
    <main>
      <div className="container max-w-7xl mx-auto">
        <OwnerPageHeader
          title="System Tasks"
          description="View all system tasks here."
          count={10}
          countLabel="Tasks"
          countIcon={<HatGlasses className="size-4 text-zinc-400" />}
          icon={<HatGlasses className="size-6" />}
          addButtonLabel="Report Task"
          onAddClick={() => setReportTaskDialogOpen(true)}
        />
      </div>
    </main>
  );
}
