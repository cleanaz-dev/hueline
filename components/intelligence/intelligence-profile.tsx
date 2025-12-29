"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Fingerprint, 
  MessageSquareQuote, 
  Database,
  Globe
} from "lucide-react";

export default function IntelligenceProfile({ subdomain }: { subdomain: any }) {
  // Pull data from the Intelligence relation (General Voice/Text Brain)
  const intel = subdomain?.intelligence;
  
  // Fallback to Subdomain data if Intelligence specific prompt isn't set
  const companyName = subdomain?.companyName || "Unknown Company";
  const promptPreview = intel?.prompt || `You are a helpful assistant for ${companyName}...`;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      
      {/* 1. IDENTITY CARD */}
      <Card className="md:col-span-2 border-zinc-200 shadow-sm bg-gradient-to-br from-white to-zinc-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-zinc-500">
            <Fingerprint className="w-4 h-4" /> System Persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-2xl font-bold text-zinc-900">{companyName} AI</h3>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Custom Trained
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  v2.0 Model
                </Badge>
              </div>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <MessageSquareQuote className="w-3 h-3" /> Base System Prompt
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed font-mono line-clamp-3">
                "{promptPreview}"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. KNOWLEDGE GRAPH / CONFIG STATS */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-zinc-500">
            <Database className="w-4 h-4" /> Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Knowledge Base</p>
                <p className="text-xs text-muted-foreground">Website & Docs</p>
              </div>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>

          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Response Temp</span>
              <span className="font-mono">0.7</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-zinc-300 w-[70%]" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Strictness</span>
              <span className="font-mono">High</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[90%]" />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}