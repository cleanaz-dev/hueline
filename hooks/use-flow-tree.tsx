// components/admin/call-flow/use-flow-tree.ts

import { useState } from "react";
import { FlowNode, NodeType } from "@/types/call-flow-types";

const INITIAL_FLOW: FlowNode = {
  id: "root",
  type: "trigger",
  title: "Incoming Call",
  content: "+1 (888) PAINT-PRO",
  children: [
    {
      id: "api-lookup",
      type: "api",
      title: "GET /crm/lookup",
      content: "Check if caller exists in DB. Fetch Name & Address.",
      children: [
        {
          id: "agent-helper",
          type: "action",
          title: "Helper Agent",
          content: "Main Concierge. Handles pricing questions, hours, and KB info. Routes intent.",
          children: [
            {
              id: "decision-intent",
              type: "decision",
              title: "User Intent?",
              content: "Classify: 'Speak to Human' vs 'Get Quote'",
              children: [
                {
                  id: "branch-human",
                  type: "action",
                  title: "Transfer Agent",
                  label: "Speak to Rep",
                  content: "I see you're an existing customer, Jim. Let me get your account manager.",
                  children: [
                    {
                      id: "action-warm-transfer",
                      type: "end",
                      title: "Warm Transfer",
                      content: "Dialing +1 (555) 0199... Handoff context to human.",
                      children: []
                    }
                  ]
                },
                {
                  id: "branch-mockup",
                  type: "action",
                  title: "Mockup Agent",
                  label: "Book / Quote",
                  content: "Collects photo via MMS. 'Please text me a photo of your room.'",
                  children: [
                     {
                        id: "api-sms",
                        type: "api",
                        title: "POST /sms/send",
                        content: "Send 'Magic Link' to customer portal with generated mockup.",
                        children: [
                           {
                             id: "decision-followup",
                             type: "decision",
                             title: "Talk Now?",
                             content: "Ask if they want to discuss the price immediately.",
                             children: [
                               {
                                 id: "branch-talk-yes",
                                 type: "action",
                                 title: "Init. Call Agent",
                                 label: "Yes",
                                 content: "Great, connecting you to sales to close the deal.",
                                 children: [
                                    {
                                        id: "api-save-1",
                                        type: "api",
                                        title: "POST /db/save",
                                        content: "Log call outcome: 'Warm Transfer'",
                                        children: []
                                    }
                                 ]
                               },
                               {
                                 id: "branch-talk-no",
                                 type: "end",
                                 title: "End Call",
                                 label: "No",
                                 content: "Okay, check your text message for the quote. Goodbye!",
                                 children: [
                                     {
                                        id: "api-save-2",
                                        type: "api",
                                        title: "POST /db/save",
                                        content: "Log call outcome: 'Self-Serve Sent'",
                                        children: []
                                    }
                                 ]
                               }
                             ]
                           }
                        ]
                     }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export function useFlowTree() {
  const [flow, setFlow] = useState<FlowNode>(INITIAL_FLOW);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Helper: Recursive Update
  const updateNode = (
    node: FlowNode,
    targetId: string,
    transform: (n: FlowNode) => FlowNode
  ): FlowNode => {
    if (node.id === targetId) return transform(node);
    return {
      ...node,
      children: node.children.map((child) =>
        updateNode(child, targetId, transform)
      ),
    };
  };

  // Helper: Recursive Delete
  const deleteNode = (node: FlowNode, targetId: string): FlowNode => {
    return {
      ...node,
      children: node.children
        .filter((child) => child.id !== targetId)
        .map((child) => deleteNode(child, targetId)),
    };
  };

  // Actions
   const addNode = (parentId: string, label?: string) => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: "action",
      title: label ? `${label} Path` : "New Step",
      content: "",
      label: label || undefined, // Store the connection label
      children: [],
    };

    setFlow((prev) =>
      updateNode(prev, parentId, (n) => ({
        ...n,
        children: [...n.children, newNode],
      }))
    );
    setSelectedNodeId(newNode.id);
  };

  const removeNode = (id: string) => {
    if (id === "root") return;
    setFlow((prev) => deleteNode(prev, id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const updateNodeData = (id: string, data: Partial<FlowNode>) => {
    setFlow((prev) =>
      updateNode(prev, id, (n) => ({ ...n, ...data }))
    );
  };

  return {
    flow,
    selectedNodeId,
    setSelectedNodeId,
    addNode,
    removeNode,
    updateNodeData,
  };
}