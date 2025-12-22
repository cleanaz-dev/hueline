import { 
  MessageCircle, Ear, Zap, GripVertical, BookOpen, X, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AgentStep, StepType } from "@/types/call-flow-types";

interface AgentScriptBuilderProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  addStep: (type: StepType) => void;
  updateStep: (id: string, field: keyof AgentStep, value: string) => void;
  removeStep: (id: string) => void;
  toggleContext: (key: string) => void;
  availableVariables: { key: string; value: string }[];
}

export function AgentScriptBuilder({
  formData, updateField, addStep, updateStep, removeStep, toggleContext, availableVariables
}: AgentScriptBuilderProps) {
  
  return (
    <div className="space-y-6">
      {/* 1. AGENT IDENTITY */}
      <section className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold text-sm">
           <Brain className="w-4 h-4" /> Agent Identity
        </div>
        <div className="space-y-2">
           <label className="text-xs font-semibold text-gray-500">Agent Name</label>
           <Input 
             value={formData.title}
             onChange={(e) => updateField('title', e.target.value)}
             className="bg-white border-blue-200"
             placeholder="e.g. Booking Assistant"
           />
        </div>
      </section>

      {/* 2. CONTEXT BACKPACK */}
      <section className="space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
           <BookOpen className="w-3 h-3" /> Agent Context (Knowledge)
        </label>
        <div className="flex flex-wrap gap-2">
          {availableVariables.map((v) => {
             const isActive = formData.contextKeys.includes(v.key);
             return (
                <button
                  key={v.key}
                  onClick={() => toggleContext(v.key)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                     isActive 
                       ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                       : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {v.key}
                </button>
             );
          })}
        </div>
      </section>

      {/* 3. SCRIPT STEPS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
             Run of Show (Script)
           </label>
        </div>

        <div className="space-y-2">
          {formData.steps.map((step: AgentStep) => (
            <div key={step.id} className="group flex items-start gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative">
               <div className="mt-2 text-gray-300 cursor-grab"><GripVertical className="w-4 h-4" /></div>
               
               <div className={`mt-1 p-1.5 rounded-lg shrink-0 ${
                  step.type === 'say' ? 'bg-blue-50 text-blue-600' :
                  step.type === 'collect' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-amber-50 text-amber-600'
               }`}>
                  {step.type === 'say' && <MessageCircle className="w-4 h-4" />}
                  {step.type === 'collect' && <Ear className="w-4 h-4" />}
                  {step.type === 'execute' && <Zap className="w-4 h-4" />}
               </div>

               <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold uppercase text-gray-400">{step.type}</span>
                     <button onClick={() => removeStep(step.id)} className="text-gray-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  
                  {step.type === 'collect' && (
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">Var:</span>
                        <input 
                           value={step.variable}
                           onChange={(e) => updateStep(step.id, 'variable', e.target.value)}
                           className="flex-1 text-xs border-b border-gray-200 focus:border-blue-500 outline-none pb-0.5 font-mono text-emerald-600"
                           placeholder="variable_name"
                        />
                     </div>
                  )}
                  
                  <textarea 
                     value={step.content}
                     onChange={(e) => updateStep(step.id, 'content', e.target.value)}
                     className="w-full text-sm resize-none outline-none bg-transparent placeholder:text-gray-300"
                     rows={step.type === 'say' ? 2 : 1}
                     placeholder={step.type === 'say' ? "Agent says..." : "Logic..."}
                  />
               </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
           <Button variant="outline" size="sm" onClick={() => addStep('say')} className="text-blue-600 border-blue-200 hover:bg-blue-50">
              <MessageCircle className="w-3 h-3 mr-2" /> + Say
           </Button>
           <Button variant="outline" size="sm" onClick={() => addStep('collect')} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              <Ear className="w-3 h-3 mr-2" /> + Collect
           </Button>
           <Button variant="outline" size="sm" onClick={() => addStep('execute')} className="text-amber-600 border-amber-200 hover:bg-amber-50">
              <Zap className="w-3 h-3 mr-2" /> + Fn
           </Button>
        </div>
      </section>
    </div>
  );
}