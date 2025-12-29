"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PhoneIncoming, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  BarChart3,
  ArrowUpRight
} from "lucide-react";

export default function CallIntelligenceOverview({ subdomain }: { subdomain: any }) {
  const calls = subdomain?.calls || [];

  // --- STATS CALCULATION ---
  const total = calls.length;
  
  // 1. Outcomes
  const outcomes = {
    POSITIVE: calls.filter((c: any) => c.intelligence?.callOutcome === "POSITIVE").length,
    NEGATIVE: calls.filter((c: any) => c.intelligence?.callOutcome === "NEGATIVE").length,
    NEUTRAL: calls.filter((c: any) => c.intelligence?.callOutcome === "NEUTRAL").length,
  };

  // 2. Reasons (Top 3)
  const reasonCounts = calls.reduce((acc: any, call: any) => {
    const reason = call.intelligence?.callReason || "OTHER";
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});

  const topReasons = Object.entries(reasonCounts)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 4);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      
      {/* LEFT COL: Outcome Analysis (4/7 width) */}
      <Card className="col-span-4 border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>Call Outcome Analysis</CardTitle>
          <CardDescription>
            AI sentiment classification of recent phone interactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Positive */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-medium text-zinc-700">Positive / Closed</span>
              </div>
              <span className="text-muted-foreground font-mono">{outcomes.POSITIVE}</span>
            </div>
            <Progress value={(outcomes.POSITIVE / total) * 100 || 0} className="h-2 bg-green-100" indicatorClassName="bg-green-500" />
          </div>

          {/* Neutral */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-zinc-700">Neutral / Inquiry</span>
              </div>
              <span className="text-muted-foreground font-mono">{outcomes.NEUTRAL}</span>
            </div>
            <Progress value={(outcomes.NEUTRAL / total) * 100 || 0} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
          </div>

          {/* Negative */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="font-medium text-zinc-700">Negative / Lost</span>
              </div>
              <span className="text-muted-foreground font-mono">{outcomes.NEGATIVE}</span>
            </div>
            <Progress value={(outcomes.NEGATIVE / total) * 100 || 0} className="h-2 bg-red-100" indicatorClassName="bg-red-500" />
          </div>

        </CardContent>
      </Card>

      {/* RIGHT COL: Call Reasons (3/7 width) */}
      <Card className="col-span-3 border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>Top Call Drivers</CardTitle>
          <CardDescription>Primary reasons for customer contact.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topReasons.length > 0 ? (
              topReasons.map(([reason, count]: any, idx: number) => (
                <div key={reason} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-sm border ${
                        idx === 0 ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-white text-zinc-500 border-zinc-200"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium capitalize text-zinc-700">
                      {reason.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-mono bg-white border-zinc-200">
                    {count}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                <span className="text-sm">No analytics available</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* BOTTOM ROW: Recent Activity List (Full Width) */}
      <Card className="col-span-7 border-zinc-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Intelligence Log</CardTitle>
            <CardDescription>Real-time processing feed of incoming calls.</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 text-zinc-500">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {calls.length > 0 ? (
              calls.slice(0, 5).map((call: any) => (
                <div key={call.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-lg transition-colors group cursor-pointer border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full">
                      <PhoneIncoming className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {call.intelligence?.callSummary || "AI Processing..."}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(call.createdAt).toLocaleDateString()} • {new Date(call.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        {call.audioUrl && (
                           <Badge variant="outline" className="text-[9px] h-4 px-1 border-blue-200 text-blue-500">Audio</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize text-zinc-600 border-zinc-300">
                      {(call.intelligence?.callReason || "Unknown").replace(/_/g, " ").toLowerCase()}
                    </Badge>
                    
                    {call.intelligence?.callOutcome === "POSITIVE" && (
                        <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">Positive</Badge>
                    )}
                    {call.intelligence?.callOutcome === "NEGATIVE" && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">Negative</Badge>
                    )}
                    {(!call.intelligence?.callOutcome || call.intelligence?.callOutcome === "NEUTRAL") && (
                        <Badge variant="secondary" className="text-zinc-500">Neutral</Badge>
                    )}
                    
                    <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors ml-2" />
                  </div>
                </div>
              ))
            ) : (
                <div className="text-center py-12 text-muted-foreground text-sm opacity-60">
                    No recent calls recorded.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}