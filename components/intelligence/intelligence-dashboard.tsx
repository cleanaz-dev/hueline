"use client";

import { useState } from "react";
import { useOwner } from "@/context/owner-context";
import { 
  Calculator, 
  Ear, 
  Eye, 
  Sparkles, 
  ArrowRight, 
  Zap,
  TrendingUp,
  Ruler,
  Quote,
  Hammer,
  Cpu,
  ListFilter,
  Hash,
  HelpCircle,
  Dot,
  CheckCircle2
} from "lucide-react";
import { SubdomainAccountData } from "@/types/subdomain-type";

// --- TYPES ---
interface VoiceValues { [key: string]: number; }
interface VoiceSchema { [key: string]: string; }
interface RoomExampleOutput {
  category?: string;
  item?: string;
  action?: string;
  items?: any[];
}
interface RoomExample {
  transcript: string;
  output: RoomExampleOutput;
}
interface RoomIntelJSON {
  categories: Record<string, string>;
  examples: RoomExample[];
}

// --- FORMATTERS ---
const formatLabel = (key: string) => {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Multiplier ", "")
    .replace("Rate ", "")
    .replace("Is ", "")
    .replace("Has ", "")
    .trim();
};

const formatValue = (key: string, val: number) => {
  const isMultiplier = key.toLowerCase().includes("multiplier") || (val < 2 && val > 0 && !key.includes("fee"));
  
  if (isMultiplier) {
    return { 
      type: 'multiplier', 
      value: `+${(val * 100).toFixed(0)}%`, 
      desc: 'Adjustment applied to base' 
    };
  }
  return { 
    type: 'currency', 
    value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val),
    desc: 'Fixed rate'
  };
};

export default function IntelligenceDashboardPage() {
  const { subdomain } = useOwner() as { subdomain: SubdomainAccountData | null };
  const [activeTab, setActiveTab] = useState<"voice" | "room">("voice");

  if (!subdomain) return <DashboardSkeleton />;

  // Data Preparation
  const voiceIntel = subdomain.intelligence;
  const roomIntel = subdomain.roomIntelligence;
  const pricingValues = (voiceIntel?.values as unknown as VoiceValues) || {};
  const schemaDefinition = (voiceIntel?.schema as unknown as VoiceSchema) || {};
  const roomJson = (roomIntel?.intelligence as unknown as RoomIntelJSON) || {};
  const roomCategories = roomJson.categories || {};
  const roomExamples = roomJson.examples || [];

  const baseRates = Object.entries(pricingValues).filter(([k]) => !k.toLowerCase().includes("multiplier"));
  const multipliers = Object.entries(pricingValues).filter(([k]) => k.toLowerCase().includes("multiplier"));

  // Sort Schema Alphabetically by Display Name
  const schemaEntries = Object.entries(schemaDefinition);
  
  const booleanFlags = schemaEntries
    .filter(([, type]) => type === 'boolean')
    .sort((a, b) => formatLabel(a[0]).localeCompare(formatLabel(b[0]))); // Sort by formatted label

  const enumsAndNumbers = schemaEntries
    .filter(([, type]) => type !== 'boolean')
    .sort((a, b) => formatLabel(a[0]).localeCompare(formatLabel(b[0]))); // Sort by formatted label

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-10">
      
      {/* --- RESPONSIVE HEADER --- */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm md:shadow-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:h-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand / Title */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-900 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200 shrink-0">
              <Cpu className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight text-zinc-900 leading-tight">Intelligence Architect</h1>
              <p className="text-[11px] md:text-xs text-zinc-500 font-medium hidden md:block">Core logic & behavioral configuration</p>
            </div>
          </div>
          
          {/* Mobile-First Tab Switcher */}
          <div className="bg-zinc-100 p-1 rounded-lg flex w-full md:w-[350px] gap-2">
             <TabButton 
               active={activeTab === 'voice'} 
               onClick={() => setActiveTab('voice')} 
               icon={<Ear className="w-3.5 h-3.5" />} 
               label="Voice Agent" 
             />
             <TabButton 
               active={activeTab === 'room'} 
               onClick={() => setActiveTab('room')} 
               icon={<Eye className="w-3.5 h-3.5" />} 
               label="Room Vision" 
             />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-6 md:space-y-10">
        
        {/* --- VOICE INTELLIGENCE --- */}
        {activeTab === 'voice' && (
          <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* 1. PRICING DNA */}
            <section>
              <SectionHeader 
                icon={<Calculator />} 
                title="Pricing DNA" 
                desc="How the AI constructs quotes." 
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                
                {/* Base Rates Card */}
                <div className="col-span-1 lg:col-span-4 bg-white rounded-xl md:rounded-2xl border border-zinc-200 shadow-sm p-5 md:p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                  <h3 className="text-xs md:text-sm font-bold text-zinc-900 mb-4 md:mb-6 flex items-center gap-2">
                    <Ruler className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" /> Base Constants
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {baseRates.map(([key, val]) => {
                      const fmt = formatValue(key, val);
                      return (
                        <div key={key} className="flex justify-between items-center pb-3 md:pb-4 border-b border-zinc-50 last:border-0 last:pb-0">
                          <span className="text-xs md:text-sm font-medium text-zinc-600 truncate mr-2">{formatLabel(key)}</span>
                          <span className="text-base md:text-lg font-mono font-bold text-zinc-900">{fmt.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Multipliers Card */}
                <div className="col-span-1 lg:col-span-8 bg-zinc-900 rounded-xl md:rounded-2xl shadow-xl shadow-zinc-200 p-5 md:p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 relative z-10 gap-2">
                    <div>
                      <h3 className="text-sm md:text-base font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-400" /> Contextual Adjustments
                      </h3>
                      <p className="text-zinc-400 text-xs md:text-sm mt-1">Applied when conditions are met during the call.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 relative z-10">
                    {multipliers.map(([key, val]) => {
                      const fmt = formatValue(key, val);
                      return (
                        <div key={key} className="bg-white/5 border border-white/10 rounded-lg md:rounded-xl p-3 md:p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-0.5">
                              IF DETECTED
                            </span>
                            <span className="text-xs md:text-sm font-medium text-zinc-100 truncate pr-2">{formatLabel(key)}</span>
                          </div>
                          <div className="text-lg md:text-xl font-mono font-bold text-white tracking-tight">
                            {fmt.value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </section>

            {/* 2. ACTIVE LISTENING */}
            <section>
              <SectionHeader 
                icon={<Ear />} 
                title="Active Listening Targets" 
                desc="The checklist the AI uses to qualify leads and categorize projects." 
              />
              
              <div className="bg-white rounded-xl md:rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                {/* Legend Header */}
                <div className="bg-zinc-50 border-b border-zinc-100 p-4 md:px-6 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium text-zinc-600">Categories</span>
                    <span className="text-zinc-400 hidden sm:inline">– Classifies the job type</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dot className="w-3.5 h-3.5 text-orange-500" />
                    <span className="font-medium text-zinc-600">Logic Triggers</span>
                    <span className="text-zinc-400 hidden sm:inline">– Activates pricing rules (Yes/No)</span>
                  </div>
                </div>

                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Column 1: Classification */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Project Context</h4>
                    <div className="flex flex-col gap-2">
                      {enumsAndNumbers.map(([key, type]) => {
                         const isNum = type === 'number';
                         return (
                           <div key={key} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 bg-zinc-50/50">
                             <div className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isNum ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                               {isNum ? <Hash className="w-3.5 h-3.5" /> : <ListFilter className="w-3.5 h-3.5" />}
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-center mb-1">
                                 <span className="text-sm font-semibold text-zinc-700 truncate">{formatLabel(key)}</span>
                                 <span className="text-[10px] font-bold text-zinc-400 uppercase bg-white border border-zinc-200 px-1.5 rounded">
                                   {isNum ? 'Metric' : 'Selection'}
                                 </span>
                               </div>
                               <p className="text-[11px] text-zinc-500 leading-tight">
                                 {isNum ? 'Used for base calculations.' : type.split('|').join(', ')}
                               </p>
                             </div>
                           </div>
                         )
                      })}
                    </div>
                  </div>

                  {/* Column 2: Boolean Flags */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Conditions & Modifiers</h4>
                    <div className="flex flex-wrap gap-2">
                       {booleanFlags.map(([key]) => (
                         <div key={key} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md border border-orange-100 bg-orange-50/50">
                            <span className="text-sm font-medium text-zinc-700">{formatLabel(key)}</span>
                         </div>
                       ))}
                    </div>
                    <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100 flex gap-3">
                       <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                       <p className="text-[11px] text-zinc-500 leading-relaxed">
                         These flags are automatically detected during conversation. When set to <strong className="text-zinc-700">True</strong>, they may trigger the pricing adjustments shown in the section above.
                       </p>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          </div>
        )}

        {/* --- ROOM INTELLIGENCE --- */}
        {activeTab === 'room' && (
          <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* 1. VISION CAPABILITIES */}
            <section>
              <SectionHeader 
                icon={<Eye />} 
                title="Visual Detection" 
                desc="What the AI looks for in photos." 
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {Object.entries(roomCategories).map(([code, desc]) => (
                  <div key={code} className="bg-white p-4 md:p-5 rounded-xl border border-zinc-200 shadow-sm hover:border-purple-200 transition-colors group flex sm:block items-center sm:items-start gap-4 sm:gap-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-0 md:mb-4 group-hover:bg-purple-100 transition-colors shrink-0">
                      <Zap className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 mb-1 md:mb-2">{formatLabel(code)}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 md:line-clamp-none">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. COGNITIVE FLOW (EXAMPLES) */}
            <section>
              <SectionHeader 
                icon={<Sparkles />} 
                title="Logic Processing" 
                desc="Examples of Speech-to-Scope conversion." 
              />
              <div className="bg-white rounded-xl md:rounded-2xl border border-zinc-200 shadow-sm overflow-hidden divide-y divide-zinc-100">
                {roomExamples.map((ex, i) => {
                  const hasAction = !!ex.output.category;
                  return (
                    <div key={i} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-start md:items-center hover:bg-zinc-50/50 transition-colors">
                      
                      {/* INPUT (Mobile: Top, Desktop: Left) */}
                      <div className="md:col-span-5 flex gap-3">
                        <div className="mt-1 shrink-0">
                          <Quote className="w-3 h-3 md:w-4 md:h-4 text-zinc-300 transform scale-x-[-1]" />
                        </div>
                        <p className="text-sm text-zinc-600 font-medium leading-relaxed italic md:not-italic">
                          "{ex.transcript}"
                        </p>
                      </div>

                      {/* PROCESS (Mobile: Hidden/Small, Desktop: Center) */}
                      <div className="hidden md:flex md:col-span-2 justify-center">
                        <ArrowRight className="w-4 h-4 text-zinc-300" />
                      </div>

                      {/* OUTPUT (Mobile: Bottom, Desktop: Right) */}
                      <div className="md:col-span-5 w-full pl-6 md:pl-0 border-l-2 md:border-l-0 border-zinc-100 md:border-none">
                        {hasAction ? (
                          <div className="bg-zinc-50 md:bg-white md:border border-zinc-200 rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm relative overflow-hidden">
                             <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 hidden md:block" />
                             <div className="flex flex-wrap items-center gap-2 mb-1.5">
                               <span className="text-[10px] font-bold text-white bg-purple-600 px-1.5 py-0.5 rounded">
                                 {ex.output.category}
                               </span>
                               <span className="text-xs font-bold text-zinc-900">{ex.output.item}</span>
                             </div>
                             <div className="flex items-start gap-2 text-xs text-zinc-500">
                               <Hammer className="w-3 h-3 mt-0.5 shrink-0 hidden md:block" />
                               {ex.output.action}
                             </div>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-400 italic py-1 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" />
                            No scope impact detected.
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-bold transition-all ${
      active 
        ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" 
        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
    }`}
  >
    {icon} {label}
  </button>
);

const SectionHeader = ({ icon, title, desc }: any) => (
  <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
      <div className="text-zinc-900 w-4 h-4 md:w-5 md:h-5 [&>svg]:w-full [&>svg]:h-full">{icon}</div>
    </div>
    <div>
      <h2 className="text-base md:text-lg font-bold text-zinc-900">{title}</h2>
      <p className="text-xs md:text-sm text-zinc-500 max-w-2xl">{desc}</p>
    </div>
  </div>
);

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-zinc-200 h-auto py-4 px-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-200 rounded-xl animate-pulse shrink-0" />
          <div className="space-y-2 w-full">
            <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse hidden md:block" />
          </div>
        </div>
        <div className="w-full h-10 bg-zinc-100 rounded-lg animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-zinc-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-zinc-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-zinc-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="col-span-1 md:col-span-4 h-48 md:h-64 bg-white border border-zinc-200 rounded-2xl animate-pulse" />
            <div className="col-span-1 md:col-span-8 h-48 md:h-64 bg-zinc-900/5 border border-zinc-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}