"use client";

import { useState, useRef } from "react";
import { 
  Phone, 
  MessageSquare, 
  GitFork, 
  Database, 
  Trash2, 
  Plus, 
  Settings, 
  X,
  ChevronRight,
  Save,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// --- TYPES ---
type NodeType = "trigger" | "action" | "decision" | "end";

interface FlowNode {
  id: string;
  type: NodeType;
  title: string;
  content: string;
  children: FlowNode[];
}

interface KnowledgeItem {
  id: string;
  key: string;
  value: string;
}

// --- INITIAL DATA ---
const INITIAL_FLOW: FlowNode = {
  id: "root",
  type: "trigger",
  title: "Incoming Call",
  content: "User calls the main business line.",
  children: [
    {
      id: "node-1",
      type: "action",
      title: "Greeting AI",
      content: "Hello! Thanks for calling Hue-Line. How can I help you today?",
      children: [
        {
          id: "node-2",
          type: "decision",
          title: "Check Intent",
          content: "Analyze user response for keywords.",
          children: [
            {
              id: "node-3",
              type: "action",
              title: "Booking Path",
              content: "Great, I can help you schedule a quote.",
              children: []
            },
            {
              id: "node-4",
              type: "action",
              title: "Support Path",
              content: "I understand you have a question about an existing project.",
              children: []
            }
          ]
        }
      ]
    }
  ]
};

const INITIAL_KNOWLEDGE: KnowledgeItem[] = [
  { id: "1", key: "Business Hours", value: "Mon-Fri, 8am - 6pm EST" },
  { id: "2", key: "Pricing Base", value: "$350 per room (approx)" },
  { id: "3", key: "Emergency Contact", value: "555-0199" },
];

// --- COMPONENT ---
export default function CallFlowComponent() {
  const [flow, setFlow] = useState<FlowNode>(INITIAL_FLOW);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>(INITIAL_KNOWLEDGE);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // For editing
  const [editForm, setEditForm] = useState<{ title: string; content: string } | null>(null);

  // --- ACTIONS ---

  // Helper to traverse and find/update nodes
  const updateNodeInTree = (
    node: FlowNode, 
    targetId: string, 
    transform: (n: FlowNode) => FlowNode
  ): FlowNode => {
    if (node.id === targetId) return transform(node);
    return {
      ...node,
      children: node.children.map(child => updateNodeInTree(child, targetId, transform))
    };
  };

  const deleteNodeInTree = (node: FlowNode, targetId: string): FlowNode => {
    return {
      ...node,
      children: node.children
        .filter(child => child.id !== targetId)
        .map(child => deleteNodeInTree(child, targetId))
    };
  };

  const handleAddChild = (parentId: string) => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: "action",
      title: "New Step",
      content: "Define action details...",
      children: []
    };

    setFlow(prev => updateNodeInTree(prev, parentId, (node) => ({
      ...node,
      children: [...node.children, newNode]
    })));
    
    // Auto select new node
    setSelectedNodeId(newNode.id);
    setEditForm({ title: newNode.title, content: newNode.content });
    setIsSidebarOpen(true);
  };

  const handleDelete = (id: string) => {
    if (id === "root") return; // Protect root
    setFlow(prev => deleteNodeInTree(prev, id));
    if (selectedNodeId === id) {
      setIsSidebarOpen(false);
      setSelectedNodeId(null);
    }
  };

  const handleNodeClick = (node: FlowNode) => {
    setSelectedNodeId(node.id);
    setEditForm({ title: node.title, content: node.content });
    setIsSidebarOpen(true);
  };

  const saveNodeChanges = () => {
    if (!selectedNodeId || !editForm) return;
    setFlow(prev => updateNodeInTree(prev, selectedNodeId, (node) => ({
      ...node,
      title: editForm.title,
      content: editForm.content
    })));
  };

  // --- RENDERERS ---

  const NodeIcon = ({ type }: { type: NodeType }) => {
    switch (type) {
      case "trigger": return <Phone className="w-4 h-4 text-green-600" />;
      case "decision": return <GitFork className="w-4 h-4 text-orange-600" />;
      case "end": return <X className="w-4 h-4 text-red-600" />;
      default: return <MessageSquare className="w-4 h-4 text-blue-600" />;
    }
  };

  // Recursive Tree Renderer
  const FlowTree = ({ node }: { node: FlowNode }) => {
    const isSelected = selectedNodeId === node.id;

    return (
      <div className="flex flex-col items-center">
        {/* The Node Card */}
        <div 
          onClick={(e) => { e.stopPropagation(); handleNodeClick(node); }}
          className={`
            relative w-64 p-4 rounded-xl border transition-all cursor-pointer bg-white group
            ${isSelected 
              ? "border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)] ring-1 ring-blue-500" 
              : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${
                node.type === 'trigger' ? 'bg-green-50' : 
                node.type === 'decision' ? 'bg-orange-50' : 'bg-blue-50'
              }`}>
                <NodeIcon type={node.type} />
              </div>
              <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                {node.title}
              </span>
            </div>
            {/* Delete (Hover only, protect root) */}
            {node.id !== "root" && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Content Preview */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {node.content}
          </p>

          {/* Add Child Button (Bottom Center) */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); handleAddChild(node.id); }}
              className="h-6 w-6 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Lines & Children Container */}
        {node.children.length > 0 && (
          <div className="flex flex-col items-center">
            {/* Vertical Line Down */}
            <div className="h-8 w-px bg-gray-300"></div>
            
            {/* Horizontal Connector Bar (if multiple children) */}
            <div className="flex items-start">
              {node.children.map((child, index) => (
                <div key={child.id} className="flex flex-col items-center px-4 relative">
                  
                  {/* Top Connector Lines Logic */}
                  {node.children.length > 1 && (
                    <>
                      {/* Horizontal Bar */}
                      <div className={`absolute top-0 h-px bg-gray-300 w-full 
                        ${index === 0 ? "left-1/2 w-1/2" : ""} 
                        ${index === node.children.length - 1 ? "w-1/2 right-1/2 left-0" : ""}
                      `} />
                      {/* Vertical connector to node */}
                      <div className="h-8 w-px bg-gray-300"></div>
                    </>
                  )}
                  
                  {/* Recurse */}
                  <FlowTree node={child} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-100px)] border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden relative">
      
      {/* --- CANVAS --- */}
      <div className="flex-1 overflow-auto p-12 cursor-grab active:cursor-grabbing">
        <div className="min-w-max flex justify-center">
          <FlowTree node={flow} />
        </div>
      </div>

      {/* --- FLOATING KNOWLEDGE BASE TOGGLE --- */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-72 hidden md:block">
          <div className="flex items-center gap-2 mb-3">
             <Database className="w-4 h-4 text-purple-600" />
             <h3 className="text-sm font-bold text-gray-900">Knowledge Base</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Variables available to the AI during this call flow.
          </p>
          <div className="space-y-2">
            {knowledgeBase.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700">{item.key}</span>
                <span className="font-mono text-gray-500 truncate max-w-[100px]">{item.value}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3 text-xs h-8">
             Manage Variables
          </Button>
        </div>
      </div>

      {/* --- EDIT SIDEBAR (Sheet) --- */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Edit Step
            </SheetTitle>
          </SheetHeader>

          {selectedNodeId && editForm && (
            <div className="space-y-6">
              
              {/* Type Selection (Simplified) */}
              <div className="grid grid-cols-3 gap-2">
                 {(['action', 'decision', 'end'] as NodeType[]).map(t => (
                   <button
                     key={t}
                     onClick={() => {
                        setFlow(prev => updateNodeInTree(prev, selectedNodeId, n => ({...n, type: t})))
                     }}
                     className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all
                       ${flow.id === selectedNodeId ? 'opacity-50 cursor-not-allowed' : ''} 
                       ${(selectedNodeId !== 'root' && (flow as any /* find logic needed */).type === t) // simplified check
                         ? 'border-blue-500 bg-blue-50 text-blue-700' 
                         : 'border-gray-200 hover:bg-gray-50'}
                     `}
                   >
                      <span className="capitalize">{t}</span>
                   </button>
                 ))}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">Step Title</label>
                <Input 
                  value={editForm.title} 
                  onChange={(e) => setEditForm(prev => prev ? {...prev, title: e.target.value} : null)}
                  placeholder="e.g. Ask for Budget"
                  className="font-bold"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">
                   Script / Logic Instruction
                </label>
                <Textarea 
                  value={editForm.content} 
                  onChange={(e) => setEditForm(prev => prev ? {...prev, content: e.target.value} : null)}
                  placeholder="What should the AI say or do here?"
                  className="min-h-[150px] resize-none text-sm leading-relaxed"
                />
                <p className="text-xs text-gray-400">
                  Tip: Reference variables using curly braces, e.g. {"{Pricing Base}"}
                </p>
              </div>

              {/* Dynamic Variable Inserter */}
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Insert Variable</p>
                <div className="flex flex-wrap gap-2">
                  {knowledgeBase.map(kb => (
                    <Badge 
                      key={kb.id} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => setEditForm(prev => prev ? {...prev, content: prev.content + ` {${kb.key}}`} : null)}
                    >
                      {kb.key}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex gap-3 pt-4">
                <Button onClick={() => { saveNodeChanges(); setIsSidebarOpen(false); }} className="flex-1">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
                {selectedNodeId !== "root" && (
                   <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(selectedNodeId)}
                    className="w-12 px-0"
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}