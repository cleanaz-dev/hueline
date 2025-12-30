"use client";

import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Fingerprint, MessageSquareQuote, Sliders
} from "lucide-react";

export default function IntelligenceProfile({ subdomain }: { subdomain: any }) {
  const intel = subdomain?.intelligence;
  const companyName = subdomain?.companyName || "System";
  // Fallback to a placeholder if empty
  const promptPreview = intel?.prompt || "Standard estimator logic. No custom prompt active.";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      
      {/* IDENTITY CARD */}
      <Card className="md:col-span-2 border-zinc-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/50">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-700">
            <Fingerprint className="w-4 h-4 text-purple-600" /> Identity Persona
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-xl font-bold text-zinc-900">{companyName} AI</h3>
                  <p className="text-xs text-zinc-500 mt-1">Configured for High-Precision Estimating</p>
               </div>
               <Badge className="bg-zinc-900 text-white hover:bg-zinc-800">Production Ready</Badge>
            </div>
            
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <MessageSquareQuote className="w-3 h-3" /> System Instruction Preview
              </div>
              <p className="text-xs text-zinc-600 font-mono leading-relaxed line-clamp-2 opacity-80">
                "{promptPreview.slice(0, 180)}..."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STATS CARD */}
      <Card className="border-zinc-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/50">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-700">
            <Sliders className="w-4 h-4 text-blue-600" /> Model Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          
          <div className="space-y-1">
             <div className="flex justify-between text-xs font-medium text-zinc-700">
               <span>Temperature (Creativity)</span>
               <span className="font-mono">0.1</span>
             </div>
             <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[10%]" />
             </div>
             <p className="text-[10px] text-zinc-400 text-right">Strict / Analytical</p>
          </div>

          <div className="space-y-1">
             <div className="flex justify-between text-xs font-medium text-zinc-700">
               <span>Response Length</span>
               <span className="font-mono">Auto</span>
             </div>
             <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[60%]" />
             </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}