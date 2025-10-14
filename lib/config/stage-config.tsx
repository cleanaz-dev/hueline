//lib/config/stage-config.tsx
import { 
  CheckCircle2, 
  CreditCard, 
  CheckCheck, 
  Hammer, 
  ThumbsUp 
} from "lucide-react";

export interface StageConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  nextStage?: string;
  actionLabel?: string;
  color: string;
}

export const stageConfig: Record<string, StageConfig> = {
  INTAKE_FORM_COMPLETE: {
    title: "Intake Form Complete",
    description: "Client has submitted all required information",
    icon: <CheckCheck className="w-4 h-4" />,
    nextStage: "FEE_PAID",
    actionLabel: "Send Payment Link",
    color: "text-blue-600 bg-blue-50",
  },
  FEE_PAID: {
    title: "Fee Paid",
    description: "Setup fee has been received",
    icon: <CreditCard className="w-4 h-4" />,
    nextStage: "WORK_COMPLETED",
    actionLabel: "Mark Work Completed",
    color: "text-green-600 bg-green-50",
  },
  WORK_COMPLETED: {
    title: "Work Completed",
    description: "Initial setup work is finished",
    icon: <Hammer className="w-4 h-4" />,
    nextStage: "DEMO_APPROVED",
    actionLabel: "Mark Demo Approved",
    color: "text-purple-600 bg-purple-50",
  },
  DEMO_APPROVED: {
    title: "Demo Approved",
    description: "Client has approved the demo",
    icon: <ThumbsUp className="w-4 h-4" />,
    nextStage: "JOB_COMPLETED",
    actionLabel: "Mark Job Completed",
    color: "text-orange-600 bg-orange-50",
  },
  JOB_COMPLETED: {
    title: "Job Completed",
    description: "Project successfully delivered",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-emerald-600 bg-emerald-50",
  },
};

export const activityLabels: Record<string, string> = {
  INTAKE_SUBMITTED: "Intake form submitted",
  FEE_PAID: "Fee paid",
  WORK_COMPLETED: "Work completed",
  DEMO_APPROVED: "Demo approved",
  JOB_COMPLETED: "Job completed",
};

export const formatActivityDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};