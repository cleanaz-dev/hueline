"use client";

import { 
  Settings, Trash2, Save, Phone, GitFork, 
  MessageSquare, StopCircle, Server, Smartphone, Mail, Brain, Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";

import { FlowNode, NodeType } from "@/types/call-flow-types";
import { useNodeForm } from "@/hooks/use-node-form";
import { AgentScriptBuilder } from "./agent-script-builder";
import { LucideIcon } from "lucide-react";

// --- PROPS ---
interface EditNodeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  node: FlowNode | null;
  onUpdate: (data: Partial<FlowNode>) => void;
  onDelete: () => void;
  availableVariables?: Array<{ key: string; value: string }>; 
  onAddBranch: (parentId: string, label: string) => void;
}

// Add interface for NodeTypeOption
interface NodeTypeOptionProps {
  current: NodeType;
  value: NodeType;
  label: string;
  icon: LucideIcon;
  color: string;
  onClick: (type: NodeType) => void;
  disabled?: boolean;
}

const DEFAULT_VARIABLES = [
  { key: "Business Hours", value: "Mon-Fri 8-6" },
  { key: "Pricing Base", value: "$350/room" },
];

export function EditNodeSheet({
  isOpen, onClose, node, onUpdate, onDelete, onAddBranch,
  availableVariables = DEFAULT_VARIABLES,
}: EditNodeSheetProps) {
  
  // 1. USE THE CUSTOM HOOK (Clean Logic)
  const { 
    formData, updateField, addStep, updateStep, removeStep, toggleContext 
  } = useNodeForm({ node });

  if (!node) return null;
  const isAgent = formData.type === "action";

  const handleSave = () => {
    onUpdate(formData);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[100%] sm:w-[540px] overflow-y-auto p-0 flex flex-col gap-0 border-l border-gray-200 shadow-2xl">
        
        {/* HEADER */}
        <SheetHeader className="px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-gray-900">Configure Step</SheetTitle>
              <SheetDescription className="text-xs text-gray-500">
                ID: <span className="font-mono">{node.id}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-gray-50/30">
          
          {/* 1. TYPE SELECTOR (Common for all) */}
          <section className="space-y-4">
             {/* Group A: Voice Logic */}
             <div>
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Conversation Logic</label>
               <div className="grid grid-cols-2 gap-3">
                 <NodeTypeOption current={formData.type} value="trigger" label="Trigger" icon={Phone} color="text-green-600 bg-green-50" onClick={(t: NodeType) => updateField('type', t)} disabled={node.id !== "root"} />
                 <NodeTypeOption current={formData.type} value="action" label="AI Agent" icon={Brain} color="text-blue-100 bg-blue-900" onClick={(t: NodeType) => updateField('type', t)} />
                 <NodeTypeOption current={formData.type} value="decision" label="Decision" icon={GitFork} color="text-orange-600 bg-orange-50" onClick={(t: NodeType) => updateField('type', t)} />
                 <NodeTypeOption current={formData.type} value="end" label="End Call" icon={StopCircle} color="text-red-600 bg-red-50" onClick={(t: NodeType) => updateField('type', t)} />
               </div>
             </div>
             {/* Group B: System Actions */}
             <div>
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Zap className="w-3 h-3" /> System Actions</label>
               <div className="grid grid-cols-3 gap-2">
                 <NodeTypeOption current={formData.type} value="api" label="API" icon={Server} color="text-purple-600 bg-purple-50" onClick={(t: NodeType) => updateField('type', t)} />
                 <NodeTypeOption current={formData.type} value="sms" label="SMS" icon={Smartphone} color="text-emerald-600 bg-emerald-50" onClick={(t: NodeType) => updateField('type', t)} />
                 <NodeTypeOption current={formData.type} value="email" label="Email" icon={Mail} color="text-amber-600 bg-amber-50" onClick={(t: NodeType) => updateField('type', t)} />
               </div>
             </div>
          </section>

          {/* 2. DYNAMIC EDITOR */}
          {isAgent ? (
            
            /* -- CASE A: AGENT EDITOR (New Clean Component) -- */
            <AgentScriptBuilder 
               formData={formData}
               updateField={updateField}
               addStep={addStep}
               updateStep={updateStep}
               removeStep={removeStep}
               toggleContext={toggleContext}
               availableVariables={availableVariables}
            />

          ) : (
            
            /* -- CASE B: STANDARD EDITOR -- */
            <>
               {/* Branching Buttons (Only for Decision) */}
               {formData.type === "decision" && (
                <section className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-3">
                  <div className="flex items-center gap-2 text-orange-700">
                    <GitFork className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Branching Logic</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100" onClick={() => onAddBranch(node.id, "Yes")}>+ Add "Yes"</Button>
                    <Button size="sm" variant="outline" className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100" onClick={() => onAddBranch(node.id, "No")}>+ Add "No"</Button>
                    <Button size="sm" variant="outline" className="col-span-2 bg-white border-orange-200 text-orange-700 hover:bg-orange-100" onClick={() => onAddBranch(node.id, "Custom")}>+ Add Custom Path</Button>
                  </div>
                </section>
               )}

               {/* Standard Inputs */}
               <section className="space-y-4">
                  {/* Branch Label Input (If Child) */}
                  {node.label !== undefined && (
                    <div className="space-y-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">Connection Label</label>
                      <Input value={formData.label || ""} onChange={(e) => updateField('label', e.target.value)} className="bg-white border-blue-200" />
                    </div>
                  )}

                  {/* Node Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Step Title</label>
                    <Input value={formData.title} onChange={(e) => updateField('title', e.target.value)} className="bg-white font-medium" />
                  </div>

                  {/* Content / Script */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                      {['api', 'sms', 'email'].includes(formData.type) ? "Configuration / Payload" : "Logic Instructions"}
                    </label>
                    <Textarea value={formData.content} onChange={(e) => updateField('content', e.target.value)} className="min-h-[200px] bg-white resize-none text-sm leading-relaxed p-4" />
                  </div>

                  {/* Variable Injector (Only for non-agents now) */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {availableVariables.map((v) => (
                      <Badge key={v.key} variant="outline" className="cursor-pointer bg-white hover:bg-blue-50" onClick={() => updateField('content', formData.content + ` {${v.key}} `)}>
                        {v.key}
                      </Badge>
                    ))}
                  </div>
               </section>
            </>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex gap-3">
           <Button onClick={handleSave} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-11"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
           {node.id !== "root" && (
              <Button variant="destructive" onClick={onDelete} className="w-12 px-0 h-11 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100 shadow-none"><Trash2 className="w-4 h-4" /></Button>
           )}
        </div>

      </SheetContent>
    </Sheet>
  );
}

// ✅ Fixed with proper types
function NodeTypeOption({ 
  current, 
  value, 
  label, 
  icon: Icon, 
  color, 
  onClick, 
  disabled 
}: NodeTypeOptionProps) {
  const isSelected = current === value;
  return (
    <button 
      type="button" 
      disabled={disabled} 
      onClick={() => onClick(value)} 
      className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
        disabled 
          ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-100" 
          : "cursor-pointer"
      } ${
        isSelected 
          ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/20" 
          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? color : "bg-gray-100 text-gray-500"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className={`text-sm font-medium ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
        {label}
      </span>
      {isSelected && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-in zoom-in" />
      )}
    </button>
  );
}