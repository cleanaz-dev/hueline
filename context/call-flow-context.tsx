// context/call-flow-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import useSWR from "swr";
import { FlowNode, NodeType } from "@/types/call-flow-types";
import { CallFlow } from "@/app/generated/prisma";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const INITIAL_FLOW: FlowNode = {
  id: "root",
  type: "trigger",
  title: "Incoming Call",
  content: "+1 (888) PAINT-PRO",
  children: [],
};

interface CallFlowContextType {
  subdomainSlug: string | null;
  setSubdomainSlug: (slug: string | null) => void;
  versions: CallFlow[];
  activeFlowId: string | null;
  currentVersionId: string | null;
  setCurrentVersionId: (id: string | null) => void;
  flow: FlowNode;
  setFlow: (flow: FlowNode) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  
  // SWR states
  isLoading: boolean;
  error: any;
  refreshFlows: () => void;
  
  addNode: (parentId: string, label?: string) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNode>) => void;
}

const CallFlowContext = createContext<CallFlowContextType | undefined>(undefined);

// Helper functions
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

export function CallFlowProvider({ children }: { children: ReactNode }) {
  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [flow, setFlow] = useState<FlowNode>(INITIAL_FLOW);

  // ✅ SWR Hook - automatically refetches when subdomainSlug changes
  const { data, error, isLoading, mutate } = useSWR(
    subdomainSlug ? `/api/subdomain/${subdomainSlug}/flow` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onSuccess: (data) => {
        // Auto-load the latest version when data arrives
        if (data.versions && data.versions.length > 0) {
          const latest = data.versions[0];
          setFlow(latest.nodes);
          setCurrentVersionId(latest.id);
        } else {
          setFlow(INITIAL_FLOW);
        }
      }
    }
  );

  // Extract versions and activeFlowId from SWR data
  const versions = data?.versions || [];
  const activeFlowId = data?.activeFlowId || null;

  // Actions
  const addNode = useCallback((parentId: string, label?: string) => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: "action",
      title: label ? `${label} Path` : "New Step",
      content: "",
      label: label || undefined,
      children: [],
    };

    setFlow((prev) =>
      updateNodeInTree(prev, parentId, (n) => ({
        ...n,
        children: [...n.children, newNode],
      }))
    );
    
    setSelectedNodeId(newNode.id);
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    if (nodeId === "root") return;
    setFlow((prev) => deleteNodeInTree(prev, nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }, [selectedNodeId]);

  const updateNodeData = useCallback((nodeId: string, data: Partial<FlowNode>) => {
    setFlow((prev) =>
      updateNodeInTree(prev, nodeId, (n) => ({ ...n, ...data }))
    );
  }, []);

  return (
    <CallFlowContext.Provider
      value={{
        subdomainSlug,
        setSubdomainSlug,
        versions,
        activeFlowId,
        currentVersionId,
        setCurrentVersionId,
        flow,
        setFlow,
        selectedNodeId,
        setSelectedNodeId,
        isLoading,
        error,
        refreshFlows: mutate,
        addNode,
        removeNode,
        updateNodeData,
      }}
    >
      {children}
    </CallFlowContext.Provider>
  );
}

export function useCallFlow() {
  const context = useContext(CallFlowContext);
  if (!context) throw new Error("useCallFlow must be used within a CallFlowProvider");
  return context;
}