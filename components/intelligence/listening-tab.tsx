"use client";

import { Ear, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogicExplainer } from "./logic-explainer";

export function ListeningTab({ flags }: { flags: string[] }) {
  const formattedFlags = flags.map((key) => ({
    key,
    label: key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/^is |^has |^requires /i, "").trim(),
  }));

  return (
    <div className="outline-none animate-in fade-in slide-in-from-bottom-1 duration-300">
      <LogicExplainer
        icon={Ear}
        title="Context Detection"
        description="The AI continuously monitors the conversation for these specific signals. When a signal is detected, it is logged to the call record and may trigger downstream pricing rules."
        exampleTitle="Example Trigger"
        exampleContent={
          <div className="space-y-2">
            <p>User: <span className="italic">"The living room has really high vaulted ceilings."</span></p>
            <div className="flex items-center gap-2 mt-2">
              <ArrowRight className="w-3 h-3 text-zinc-400" />
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 text-[10px]">
                has_high_ceilings = TRUE
              </Badge>
            </div>
          </div>
        }
      />

      <div className="border border-zinc-200 rounded-xl shadow-sm overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 hover:bg-zinc-50">
              <TableHead className="w-[300px] text-xs font-bold text-zinc-500 uppercase">Signal Name</TableHead>
              <TableHead className="text-xs font-bold text-zinc-500 uppercase">System Key</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedFlags.map((flag) => (
              <TableRow key={flag.key} className="hover:bg-zinc-50/50">
                <TableCell className="font-bold text-sm text-zinc-700">{flag.label}</TableCell>
                <TableCell className="font-mono text-xs text-zinc-600">{flag.key}</TableCell>
              </TableRow>
            ))}
            {formattedFlags.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-zinc-400 py-8 italic">No context flags configured.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}