import { useState, useEffect } from "react";
import { FlowNode, NodeType, AgentStep, StepType } from "@/types/call-flow-types";

interface UseNodeFormProps {
  node: FlowNode | null;
}

export function useNodeForm({ node }: UseNodeFormProps) {
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    type: NodeType;
    label?: string;
    steps: AgentStep[];
    contextKeys: string[];
  }>({
    title: "", content: "", type: "action", label: undefined, steps: [], contextKeys: []
  });

  // Sync when node opens
  useEffect(() => {
    if (node) {
      setFormData({
        title: node.title,
        content: node.content,
        type: node.type,
        label: node.label,
        steps: node.steps || [],
        contextKeys: node.contextKeys || []
      });
    }
  }, [node]);

  // --- ACTIONS ---
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addStep = (type: StepType) => {
    const newStep: AgentStep = {
      id: `step-${Date.now()}`,
      type,
      content: "",
      variable: type === 'collect' ? 'data_var' : undefined
    };
    setFormData(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const updateStep = (id: string, field: keyof AgentStep, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeStep = (id: string) => {
    setFormData(prev => ({ ...prev, steps: prev.steps.filter(s => s.id !== id) }));
  };

  const toggleContext = (key: string) => {
    setFormData(prev => {
      const exists = prev.contextKeys.includes(key);
      return {
        ...prev,
        contextKeys: exists 
          ? prev.contextKeys.filter(k => k !== key)
          : [...prev.contextKeys, key]
      };
    });
  };

  return {
    formData,
    updateField,
    addStep,
    updateStep,
    removeStep,
    toggleContext
  };
}