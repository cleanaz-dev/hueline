"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Cloud,
  History,
  CheckCircle,
  AlertCircle,
  Code,
} from "lucide-react";
import { generatePythonScript } from "@/lib/utils/code-generator";
import { CodeViewer } from "./call-flow/code-viewer";
// UI Components
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom Flow Components
import { InfiniteCanvas } from "./call-flow/infinite-canvas";
import { FlowNodeCard } from "./call-flow/flow-node";
import { EditNodeSheet } from "./call-flow/edit-node-sheet";
import { KnowledgeBaseCard } from "./call-flow/knowledge-base-card";
import { SubdomainSelector } from "../subdomain-selector";

// Logic / Types
import { FlowNode } from "@/types/call-flow-types";
import { useCallFlow } from "@/context/call-flow-context";

export default function CallFlowBuilder() {
  // 1. GET EVERYTHING FROM CONTEXT
  // We don't use local state for the tree anymore. The Provider handles it.
  const {
    flow,
    setFlow,
    selectedNodeId,
    setSelectedNodeId,
    subdomainSlug,
    setSubdomainSlug,
    versions,
    activeFlowId,
    currentVersionId,
    setCurrentVersionId,
    isLoading, // ✅ Now from context/SWR
    error, // ✅ Now from context/SWR
    refreshFlows, // ✅ Now from context/SWR
    removeNode,
    updateNodeData,
    addNode,
  } = useCallFlow();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false); // State for modal
  const [generatedCode, setGeneratedCode] = useState("");

  const handleViewCode = () => {
    const code = generatePythonScript(flow);
    setGeneratedCode(code);
    setIsCodeOpen(true);
  };

  // 3. HANDLE SAVE
  const handleSave = async () => {
    if (!subdomainSlug) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/subdomain/${subdomainSlug}/flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: flow }),
      });
      if (!res.ok) throw new Error();

      const data = await res.json();
      toast.success(`Version ${data.flow.version} saved!`);

      // ✅ Refresh with SWR
      refreshFlows();
    } catch (e) {
      toast.error("Failed to save flow");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Publish
  const handlePublish = async () => {
    if (!currentVersionId || !subdomainSlug) return;
    try {
      const res = await fetch(`/api/subdomain/${subdomainSlug}/flow`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowId: currentVersionId }),
      });
      if (res.ok) {
        toast.success("Flow published to Live Agent!");
        refreshFlows(); // ✅ Refresh to update activeFlowId
      }
    } catch (e) {
      toast.error("Failed to publish");
    }
  };

  // 5. HELPER: OPEN SHEET
  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
    setIsSheetOpen(true);
  };

  // 6. HELPER: FIND NODE DATA FOR SIDEBAR
  // We need to pass the actual node object to the sheet, not just the ID
  const findNode = (node: FlowNode, id: string): FlowNode | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  };

  const selectedNode = selectedNodeId ? findNode(flow, selectedNodeId) : null;

  // --- RECURSIVE RENDERER ---
  const RenderTree = ({ node }: { node: FlowNode }) => {
    return (
      <div className="flex flex-col items-center">
        {/* Node Card */}
        <FlowNodeCard
          node={node}
          isSelected={selectedNodeId === node.id}
          onClick={() => handleNodeClick(node.id)}
          onDelete={() => removeNode(node.id)}
          onAddChild={() => addNode(node.id)}
        />

        {/* Children (The "Floating UI" Look) */}
        {node.children.length > 0 && (
          <div className="flex flex-col items-center animate-in fade-in duration-300">
            {/* Spacing Zone */}
            <div className="flex items-start justify-center gap-6 pt-3">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Connector Logic */}
                  <div className="flex flex-col items-center h-10 justify-end pb-2">
                    {child.label ? (
                      <div className="flex flex-col items-center">
                        {/* The Pill */}
                        <div className="px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm flex items-center gap-1">
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                            {child.label}
                          </span>
                        </div>
                        {/* Tiny Arrow */}
                        <div className="text-gray-300 -mt-1">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 5v14" />
                            <path d="m19 12-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      /* Direct Flow Arrow */
                      <div className="text-gray-300/50">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 5v14" />
                          <path d="m19 12-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Recurse */}
                  <RenderTree node={child} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- MAIN LAYOUT ---
  return (
    <div className="h-[calc(100vh-100px)] w-full relative flex flex-col">
      {/* 1. HEADER TOOLBAR */}
      <div className="flex items-center justify-between pb-4  mb-4 px-1">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">Call Flow Editor</h2>

          <div className="h-6 w-px bg-gray-200" />

          {/* Subdomain Selector */}
          <SubdomainSelector
            value={subdomainSlug}
            onChange={setSubdomainSlug}
          />

          {/* Version Selector (Only if client selected) */}
          {subdomainSlug && (
            <>
              <div className="h-6 w-px bg-gray-200" />
              <Select
                value={currentVersionId || ""}
                onValueChange={(id) => {
                  const v = versions.find((v) => v.id === id);
                  if (v) {
                    setFlow(v.nodes as any);
                    setCurrentVersionId(id);
                  }
                }}
              >
                <SelectTrigger className="w-auto h-9 bg-white">
                  <History className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Select Version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <div className="flex items-center gap-2">
                        <span>v{v.version}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </span>
                        {v.id === activeFlowId && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded-full font-bold">
                            LIVE
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

               <Button 
                  variant="outline" 
                  className="h-9 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  onClick={handleViewCode}
               >
                 <Code className="w-4 h-4 mr-2" /> View Code
               </Button>
            </>
          )}
        </div>

        {/* Save/Publish Actions */}
        {subdomainSlug && (
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400 mr-2 items-center gap-1 hidden md:flex">
              <Cloud className="w-3 h-3" />
              {isSaving ? "Saving..." : "Changes local"}
            </div>

            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9"
            >
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>

            <Button
              onClick={handlePublish}
              disabled={currentVersionId === activeFlowId}
              className={`h-9 ${
                currentVersionId === activeFlowId
                  ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 shadow-none"
                  : "bg-gray-900 text-white"
              }`}
            >
              {currentVersionId === activeFlowId ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" /> Live
                </>
              ) : (
                "Publish"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 2. CANVAS AREA */}
      <div className="flex-1 relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
        {/* Case A: No Client Selected */}
        {!subdomainSlug ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">Select a client to begin editing</p>
          </div>
        ) : isLoading ? (
          /* Case B: Loading */
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          /* Case C: The Builder */
          <>
            <InfiniteCanvas>
              <RenderTree node={flow} />
            </InfiniteCanvas>
            <KnowledgeBaseCard className="absolute top-6 right-6 hidden md:block" />
          </>
        )}
      </div>

      {/* 3. SIDEBAR (Edit Sheet) */}
      <EditNodeSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        node={selectedNode}
        onUpdate={(data) => {
          if (selectedNodeId) updateNodeData(selectedNodeId, data);
        }}
        onDelete={() => {
          if (selectedNodeId) removeNode(selectedNodeId);
          setIsSheetOpen(false);
        }}
        onAddBranch={(parentId, label) => {
          addNode(parentId, label);
          // We keep the sheet open on parent so you can add multiple branches quickly
        }}
      />
        <CodeViewer 
           isOpen={isCodeOpen} 
           onClose={() => setIsCodeOpen(false)} 
           code={generatedCode} 
        />
    </div>
  );
}
