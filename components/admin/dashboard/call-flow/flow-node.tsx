// components/admin/call-flow/flow-node.tsx

import { 
  Phone, 
  GitFork, 
  X, 
  Trash2, 
  Plus, 
  Server, 
  Smartphone, 
  Mail,
  Brain,
  MessageCircle,
  Ear,
  Zap  
} from "lucide-react";
import { FlowNode, NodeType } from "@/types/call-flow-types";

interface FlowNodeProps {
  node: FlowNode;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onAddChild: () => void;
}

const NodeIcon = ({ type }: { type: NodeType }) => {
  switch (type) {
    // INTELLIGENCE
    case "action": return <Brain className="w-4 h-4 text-blue-100" />; // Lighter icon for contrast

    // STRUCTURE
    case "trigger": return <Phone className="w-4 h-4 text-green-600" />;
    case "decision": return <GitFork className="w-4 h-4 text-orange-600" />;
    case "end": return <X className="w-4 h-4 text-red-600" />;
    
    // SYSTEM
    case "api": return <Server className="w-4 h-4 text-purple-400" />;
    case "sms": return <Smartphone className="w-4 h-4 text-emerald-400" />;
    case "email": return <Mail className="w-4 h-4 text-amber-400" />;
    
    default: return <Brain className="w-4 h-4 text-gray-400" />;
  }
};

export const FlowNodeCard = ({ node, isSelected, onClick, onDelete, onAddChild }: FlowNodeProps) => {
  // 1. Identify Node Categories
  const isSystem = ["api", "sms", "email"].includes(node.type);
  const isAgent = node.type === "action"; // The "AI Brain" nodes
  
  // 2. Determine Style Classes
  let cardStyles = "bg-white border-gray-200 text-gray-900 shadow-md hover:shadow-lg hover:-translate-y-1"; // Default
  
  if (isSystem) {
    // Technical/Backend Look (Slate Dark)
    cardStyles = "bg-slate-900 border-slate-800 text-slate-100 shadow-xl";
  } else if (isAgent) {
    // AI/Intelligence Look (Deep Blue/Navy) - UPDATED TO BLUE-900
    cardStyles = "bg-blue-900 border-blue-800 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1";
  }

  // 3. Determine Selection Ring Color
  const ringClass = isSelected 
    ? isSystem 
      ? "ring-2 ring-purple-500 border-transparent"
      : isAgent
        ? "ring-2 ring-blue-400 border-transparent" // Lighter blue ring for visibility against dark card
        : "ring-2 ring-blue-500 border-blue-500"
    : "";

  return (
    <div className="flex flex-col items-center z-10">
      <div
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`
          no-drag relative w-64 p-4 rounded-xl border transition-all cursor-pointer group select-none
          ${cardStyles}
          ${ringClass}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Icon Box */}
            <div className={`p-1.5 rounded-lg border ${
               isSystem ? "bg-slate-800 border-slate-700" :
               isAgent  ? "bg-blue-800 border-blue-700/50 shadow-inner" : // Darker blue inset for icon
               node.type === 'trigger' ? 'bg-green-50 border-green-100' :
               node.type === 'decision' ? 'bg-orange-50 border-orange-100' : 
               'bg-gray-50 border-gray-100'
            }`}>
              <NodeIcon type={node.type} />
            </div>
            
            {/* Title & Badges */}
            <div className="flex flex-col">
              <span className={`text-sm font-bold truncate max-w-[120px] ${
                isSystem || isAgent ? "text-white" : "text-gray-900"
              }`}>
                {node.title}
              </span>
              
              {/* Special Badge for AI */}
              {isAgent && (
                 <span className="text-[9px] text-blue-200/80 font-mono tracking-wider uppercase flex items-center gap-1">
                   INTELLIGENCE
                 </span>
              )}
              
              {/* Context Badges for System Nodes */}
              {node.type === "api" && <span className="text-[9px] text-purple-400 font-mono tracking-tight">WEBHOOK</span>}
              {node.type === "sms" && <span className="text-[9px] text-emerald-400 font-mono tracking-tight">SMS</span>}
              {node.type === "email" && <span className="text-[9px] text-amber-400 font-mono tracking-tight">EMAIL</span>}
            </div>
          </div>

          {node.id !== "root" && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className={`opacity-0 group-hover:opacity-100 p-1 transition-opacity ${
                  isSystem || isAgent ? "text-white/40 hover:text-red-300" : "text-gray-400 hover:text-red-500"
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

          {isAgent ? (
          /* AGENT VIEW: Render the Stack of Pills */
          <div className="space-y-1.5 mt-2 mb-1">
            
            {/* 1. Context Badges (The Backpack) */}
            {node.contextKeys && node.contextKeys.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {node.contextKeys.map(k => (
                  <span key={k} className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-800/50 text-blue-200 border border-blue-700/50 truncate max-w-full">
                    {k}
                  </span>
                ))}
              </div>
            )}

            {/* 2. The Script Steps (The Pills) */}
            {node.steps && node.steps.length > 0 ? (
              <div className="flex flex-col gap-1">
                {node.steps.slice(0, 4).map((step) => (
                  <div key={step.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-blue-800/40 border border-blue-700/30 text-xs">
                    {/* Icon based on step type */}
                    <span className="opacity-70">
                      {step.type === 'say' && <MessageCircle className="w-3 h-3 text-blue-300" />}
                      {step.type === 'collect' && <Ear className="w-3 h-3 text-emerald-300" />}
                      {step.type === 'execute' && <Zap className="w-3 h-3 text-amber-300" />}
                    </span>
                    {/* Content */}
                    <span className="text-blue-50 truncate flex-1">
                      {step.type === 'collect' ? `Collect: ${step.variable}` : step.content}
                    </span>
                  </div>
                ))}
                {node.steps.length > 4 && (
                   <div className="text-[9px] text-center text-blue-300 pt-0.5 opacity-70">
                     + {node.steps.length - 4} more steps
                   </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-blue-300/50 italic py-2 text-center border border-dashed border-blue-700/30 rounded">
                No script steps...
              </div>
            )}
          </div>
        ) : (
          /* STANDARD VIEW (System/Logic nodes) */
          <p className={`text-xs line-clamp-2 leading-relaxed min-h-[2.5em] ${
              isSystem ? "text-slate-400 font-mono" : "text-gray-500"
          }`}>
            {node.content || <span className="italic opacity-50">No config...</span>}
          </p>
        )}
        
        {/* Content Preview */}
        {/* <p className={`text-xs line-clamp-2 leading-relaxed min-h-[2.5em] ${
            isSystem ? "text-slate-400 font-mono" : 
            isAgent ? "text-blue-100/70" : // Soft white text
            "text-gray-500"
        }`}>
          {node.content || <span className="italic opacity-50">No config...</span>}
        </p> */}

        {/* Add Button */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(); }}
            className="h-6 w-6 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ring-2 ring-white"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};