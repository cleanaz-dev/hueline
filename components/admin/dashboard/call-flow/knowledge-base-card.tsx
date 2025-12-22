"use client";

import { useState } from "react";
import { 
  Database, 
  Search, 
  Copy, 
  Check, 
  Settings2, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

// Example data - in real app, pass this via props
const DEMO_VARIABLES = [
  { id: "1", key: "Business Hours", value: "Mon-Fri, 8am - 6pm EST" },
  { id: "2", key: "Pricing Base", value: "$350 per room (starting)" },
  { id: "3", key: "Emergency Contact", value: "+1 (555) 019-2834" },
  { id: "4", key: "Company Name", value: "Hue-Line Painting" },
  { id: "5", key: "Service Area", value: "Greater Metro Region" },
];

interface KnowledgeBaseCardProps {
  className?: string;
  variables?: Array<{ id: string; key: string; value: string }>;
  onManage?: () => void;
}

export function KnowledgeBaseCard({ 
  className, 
  variables = DEMO_VARIABLES,
  onManage 
}: KnowledgeBaseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filtered = variables.filter(v => 
    v.key.toLowerCase().includes(search.toLowerCase()) || 
    v.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (key: string) => {
    // Copy the variable in the format the AI needs, e.g., {VariableName}
    const textToCopy = `{${key}}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className={`
              h-10 w-10 rounded-xl shadow-sm border-gray-200 transition-all
              ${isOpen 
                ? "bg-purple-50 border-purple-200 text-purple-600 ring-2 ring-purple-100" 
                : "bg-white hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <Database className="w-5 h-5" />
          </Button>
        </PopoverTrigger>

        {/* --- FLOATING CARD CONTENT --- */}
        <PopoverContent 
          side="left" 
          align="start" 
          sideOffset={10}
          className="w-80 p-0 rounded-xl border-gray-200 shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-50/50 p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-md text-purple-600">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Knowledge Base</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Global context variables</p>
                </div>
              </div>
              {onManage && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onManage}>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input 
                placeholder="Find variable..." 
                className="h-8 pl-8 text-xs bg-white border-gray-200 focus-visible:ring-purple-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div 
                  key={item.id} 
                  className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer"
                  onClick={() => handleCopy(item.key)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-gray-700 truncate">
                        {item.key}
                      </span>
                      {/* Copy Feedback Badge */}
                      {copiedKey === item.key && (
                        <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-green-50 text-green-600 border-green-100">
                          Copied
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate font-mono bg-gray-50/50 px-1.5 py-0.5 rounded w-fit max-w-full">
                      {item.value}
                    </p>
                  </div>
                  
                  {/* Copy Icon (Visible on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center text-gray-400">
                    {copiedKey === item.key ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-gray-400">No variables found.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 justify-center">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border border-gray-200 bg-white flex items-center justify-center">
                   <span className="text-[8px]">⌘</span>
                </div>
                Click row to copy
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}