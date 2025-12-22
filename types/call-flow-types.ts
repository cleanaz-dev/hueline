// components/admin/call-flow/types.ts

export type NodeType = "trigger" | "action" | "decision" | "end" | "api" | "sms" | "email";

// NEW: The types for the "Pills" inside an Agent
export type StepType = "say" | "collect" | "execute";

export interface AgentStep {
  id: string;
  type: StepType;
  content: string; // The text to say, or the function name
  variable?: string; // For 'collect', where to save the data (e.g. 'user_name')
}

export interface FlowNode {
  id: string;
  type: NodeType;
  title: string;
  content: string; // Legacy/Summary text
  label?: string; 
  
  // NEW FIELDS FOR AGENTS
  steps?: AgentStep[]; 
  contextKeys?: string[]; // IDs of Knowledge Base items this agent knows
  
  children: FlowNode[];
}

export interface KnowledgeItem {
  id: string;
  key: string;
  value: string;
}