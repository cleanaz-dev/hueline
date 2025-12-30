"use client";

import { useState } from "react";
import { useOwner } from "@/context/owner-context";
import {
  Calculator,
  Ear,
  Eye,
  Quote,
  ArrowRight,
  Info,
  Hash,
  Scale,
  ScanEye,
  Cpu,
  Hammer,
  Radar,
} from "lucide-react";
import { SubdomainAccountData } from "@/types/subdomain-type";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- TYPES & HELPERS ---
type VariableValue =
  | number
  | { value: number; type: "FEE" | "MULTIPLIER"; label: string };

const normalizeVariable = (key: string, val: VariableValue) => {
  if (typeof val === "object" && val !== null) {
    return {
      key,
      value: val.value,
      type: val.type,
      label: val.label || key,
      display:
        val.type === "MULTIPLIER"
          ? `${val.value}x`
          : `$${val.value.toLocaleString()}`,
    };
  }
  const isMultiplier =
    key.toLowerCase().includes("multiplier") ||
    key.toLowerCase().includes("factor") ||
    (val < 2 && val > 0 && !key.toLowerCase().includes("fee"));

  return {
    key,
    value: val,
    type: isMultiplier ? "MULTIPLIER" : "FEE",
    label: key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim(),
    display: isMultiplier ? `${val}x` : `$${(val as number).toLocaleString()}`,
  };
};

// --- LOGIC EXPLAINER COMPONENT ---
const LogicExplainer = ({
  icon: Icon,
  title,
  description,
  exampleTitle,
  exampleContent,
}: {
  icon: any;
  title: string;
  description: string;
  exampleTitle: string;
  exampleContent: React.ReactNode;
}) => (
  <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-6 shadow-sm">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Concept Definition */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900">
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>

      {/* Right: Concrete Example */}
      <div className="lg:col-span-1 bg-zinc-50 border border-zinc-200/60 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-500" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
            {exampleTitle}
          </h3>
        </div>
        <div className="text-xs text-zinc-600 leading-relaxed">
          {exampleContent}
        </div>
      </div>
    </div>
  </div>
);

export default function IntelligenceDashboardPage() {
  const { subdomain } = useOwner() as {
    subdomain: SubdomainAccountData | null;
  };

  if (!subdomain)
    return <div className="p-8 text-zinc-400">Loading Configuration...</div>;

  // --- DATA PREP ---
  const voiceIntel = subdomain.intelligence;
  const values = (voiceIntel?.values as Record<string, VariableValue>) || {};
  const schema = (voiceIntel?.schema as Record<string, string>) || {};

  // Variables
  const parsedVars = Object.entries(values).map(([k, v]) =>
    normalizeVariable(k, v)
  );
  const baseRates = parsedVars.filter((v) => v.type === "FEE");
  const multipliers = parsedVars.filter((v) => v.type === "MULTIPLIER");

  // Flags
  const flagKeys = Object.keys(schema).filter((k) => schema[k] === "boolean");
  const activeFlags = flagKeys.map((key) => ({
    key,
    label: key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^is |^has |^requires /i, "")
      .trim(),
  }));

  // Room Vision
  const roomJson = (subdomain.roomIntelligence?.intelligence as any) || {};
  const roomExamples = roomJson.examples || [];

  return (
    <div className="">
      {/* --- ADDED HEADER SECTION --- */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-zinc-100 rounded-2xl  items-center justify-center border border-zinc-200 shadow-sm hidden md:flex">
          <Cpu className="w-7 h-7 text-zinc-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Intelligence
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
            Review the active logic gates, pricing models, and vision
            capabilities currently deployed to your AI agent.
          </p>
        </div>
      </div>
      {/* --------------------------- */}

      <Tabs defaultValue="pricing" className="w-full ">
        <TabsList className="bg-transparent p-0 border-b border-zinc-200 w-full justify-start h-auto rounded-none gap-6 mb-8">
          <TabsTrigger
            value="pricing"
            className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
          >
            Pricing Logic
          </TabsTrigger>
          <TabsTrigger
            value="listening"
            className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
          >
            Active Listening
          </TabsTrigger>
          <TabsTrigger
            value="room"
            className="rounded-none border-b-2 border-transparent px-0 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
          >
            Room Vision
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 1: PRICING --- */}
        <TabsContent
          value="pricing"
          className="outline-none animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          <LogicExplainer
            icon={Calculator}
            title="Pricing Configuration"
            description="These variables control the math behind every quote. The AI starts with Base Rates, then applies Multipliers if specific conditions are met during the conversation."
            exampleTitle="Calculation Logic"
            exampleContent={
              <>
                <div className="flex items-center justify-between mb-1">
                  <span>Base Rate:</span>{" "}
                  <span className="font-mono">$4.00</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span>High Ceiling:</span>{" "}
                  <span className="font-mono">x1.2</span>
                </div>
                <div className="pt-1 mt-1 border-t border-zinc-200 font-bold flex justify-between">
                  <span>Total:</span> <span>$4.80 / unit</span>
                </div>
              </>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-zinc-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2">
                <Hash className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-bold text-zinc-700">Base Rates</h3>
              </div>
              <div className="divide-y divide-zinc-100">
                {baseRates.map((item) => (
                  <div
                    key={item.key}
                    className="flex justify-between items-center px-4 py-3 hover:bg-zinc-50/50"
                  >
                    <span className="text-sm font-medium text-zinc-700">
                      {item.label}
                    </span>
                    <span className="text-sm font-mono font-bold text-zinc-900">
                      {item.display}
                    </span>
                  </div>
                ))}
                {baseRates.length === 0 && (
                  <div className="p-4 text-xs text-zinc-400 italic">
                    No base rates found.
                  </div>
                )}
              </div>
            </div>

            <div className="border-zinc-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2">
                <Scale className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-bold text-zinc-700">Multipliers</h3>
              </div>
              <div className="divide-y divide-zinc-100">
                {multipliers.map((item) => (
                  <div
                    key={item.key}
                    className="flex justify-between items-center px-4 py-3 hover:bg-zinc-50/50"
                  >
                    <span className="text-sm font-medium text-zinc-700">
                      {item.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className="font-mono text-zinc-900 bg-zinc-100"
                    >
                      {item.display}
                    </Badge>
                  </div>
                ))}
                {multipliers.length === 0 && (
                  <div className="p-4 text-xs text-zinc-400 italic">
                    No multipliers found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- TAB 2: ACTIVE LISTENING --- */}
        <TabsContent
          value="listening"
          className="outline-none animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          <LogicExplainer
            icon={Ear}
            title="Context Detection"
            description="The AI continuously monitors the conversation for these specific signals. When a signal is detected, it is logged to the call record and may trigger downstream pricing rules."
            exampleTitle="Example Trigger"
            exampleContent={
              <div className="space-y-2">
                <p>
                  User:{" "}
                  <span className="italic">
                    "The living room has really high vaulted ceilings."
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 text-[10px]">
                    has_high_ceilings = TRUE
                  </Badge>
                </div>
              </div>
            }
          />

          <div className="border-zinc-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                  <TableHead className="w-[300px] text-xs font-bold text-zinc-500 uppercase">
                    Signal Name
                  </TableHead>
                  <TableHead className="text-xs font-bold text-zinc-500 uppercase">
                    System Key
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeFlags.map((flag) => (
                  <TableRow key={flag.key} className="hover:bg-zinc-50/50">
                    <TableCell className="font-bold text-sm text-zinc-700">
                      {flag.label}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {flag.key}
                    </TableCell>
                  </TableRow>
                ))}
                {activeFlags.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-zinc-400 py-8"
                    >
                      No context flags configured.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* --- TAB 3: ROOM VISION --- */}
        <TabsContent
          value="room"
          className="outline-none animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          <LogicExplainer
            icon={Radar}
            title="Real-Time Processing"
            description="Automatically converts spoken descriptions into detailed scope items during calls while ignoring non-actionable conversation, ensuring every detail is captured accurately."
            exampleTitle="Speech Conversion"
            exampleContent={
              <div className="space-y-2">
                <p>
                  Input:{" "}
                  <span className="italic">"There's mold in the corner."</span>
                </p>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                  <span className="font-bold">Wood Rot Repair</span>
                </div>
              </div>
            }
          />

          <div className="border-zinc-200 shadow-sm overflow-hidden bg-white rounded-md">
            <div className="divide-y divide-zinc-100">
              {roomExamples.map((ex: any, i: number) => {
                const hasAction = !!ex.output?.category;
                return (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-4 hover:bg-zinc-50/50 transition-colors"
                  >
                    {/* INPUT */}
                    <div className="flex-1 flex gap-3 min-w-0">
                      <Quote className="w-4 h-4 text-zinc-300 shrink-0 transform scale-x-[-1] mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Input
                        </span>
                        <p className="text-sm text-zinc-700 font-medium italic">
                          "{ex.transcript}"
                        </p>
                      </div>
                    </div>

                    {/* ARROW */}
                    <div className="hidden md:flex shrink-0 text-zinc-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    {/* OUTPUT */}
                    <div className="flex-1 md:pl-6">
                      {hasAction ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                              Result
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-zinc-900 text-white hover:bg-zinc-800 text-[10px] h-5 px-1.5 border-none">
                              {ex.output.category}
                            </Badge>
                            <span className="text-sm font-bold text-zinc-900">
                              {ex.output.item}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Hammer className="w-3 h-3 text-zinc-400" />
                            <span className="truncate">
                              Action: {ex.output.action}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 h-full text-zinc-400">
                          <Info className="w-4 h-4" />
                          <span className="text-xs">
                            No scope action triggered
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {roomExamples.length === 0 && (
                <div className="p-12 text-center text-zinc-400 italic">
                  No vision scenarios available.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
