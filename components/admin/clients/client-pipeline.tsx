"use client";

import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ChevronDown,
  Send,
  CreditCard,
  Presentation,
  CheckCheck,
  Calendar,
  Clock,
  User,
  Building,
  ArrowRight,
  Hammer,
  ThumbsUp
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ClientData {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  features: string[];
  hours?: string;
  stage: string;
  activities: FormActivity[];
}

interface FormActivity {
  action: string;
  createdAt: string;
  details?: string;
  completed?: boolean;
}

interface ClientPipelineProps {
  data: ClientData;
  stage: string;
  saving: boolean;
  activities?: FormActivity[];
  onUpdateStage?: (stage: string) => Promise<void>;
}

export function ClientPipeline({
  data,
  stage,
  saving,
  activities = [],
  onUpdateStage,
}: ClientPipelineProps) {
  const [showHistory, setShowHistory] = useState(false);

  const stageConfig: Record<string, {
    title: string;
    description: string;
    icon: React.ReactNode;
    nextStage?: string;
    actionLabel?: string;
    color: string;
    timelineColor: string;
    shortLabel?: string;
  }> = {
    INTAKE_FORM_COMPLETE: {
      title: "Intake Form Complete",
      description: "Client has submitted all required information",
      icon: <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
      nextStage: "FEE_PAID",
      actionLabel: "Mark Fee Paid",
      shortLabel: "Mark Paid",
      color: "bg-blue-500 border-blue-600",
      timelineColor: "bg-blue-500",
    },
    FEE_PAID: {
      title: "Fee Paid",
      description: "Setup fee has been received",
      icon: <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />,
      nextStage: "WORK_COMPLETED",
      actionLabel: "Mark Work Completed",
      shortLabel: "Work Done",
      color: "bg-green-500 border-green-600",
      timelineColor: "bg-green-500",
    },
    WORK_COMPLETED: {
      title: "Work Completed",
      description: "Initial setup work is finished",
      icon: <Hammer className="w-4 h-4 sm:w-5 sm:h-5" />,
      nextStage: "DEMO_APPROVED",
      actionLabel: "Mark Demo Approved",
      shortLabel: "Approve Demo",
      color: "bg-purple-500 border-purple-600",
      timelineColor: "bg-purple-500",
    },
    DEMO_APPROVED: {
      title: "Demo Approved",
      description: "Client has approved the demo",
      icon: <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />,
      nextStage: "JOB_COMPLETED",
      actionLabel: "Mark Job Completed",
      shortLabel: "Complete Job",
      color: "bg-orange-500 border-orange-600",
      timelineColor: "bg-orange-500",
    },
    JOB_COMPLETED: {
      title: "Job Completed",
      description: "Project successfully delivered",
      icon: <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "bg-emerald-500 border-emerald-600",
      timelineColor: "bg-emerald-500",
    },
  };

  const current = stageConfig[stage] || stageConfig.INTAKE_FORM_COMPLETE;
  const next = current.nextStage ? stageConfig[current.nextStage] : null;

  const stages = Object.keys(stageConfig);
  const currentStageIndex = stages.indexOf(stage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityLabel = (action: string) => {
    const labels: Record<string, string> = {
      INTAKE_SUBMITTED: "Intake form submitted",
      SETUP_LINK_SENT: "Setup link sent",
      FEE_PAID: "Fee paid",
      WORK_COMPLETED: "Work completed",
      DEMO_APPROVED: "Demo approved",
      JOB_COMPLETED: "Job completed",
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-4 sm:space-y-6 mb-6 px-2 sm:px-0">
      {/* Client Header - Mobile Optimized */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{data.name}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{data.company}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{data.hours || "Standard hours"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-start sm:justify-end">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Active Pipeline</span>
              <span className="sm:hidden">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Progress - Mobile Optimized */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Project Timeline</h3>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 bg-gray-200">
            <div 
              className="bg-blue-500 transition-all duration-500"
              style={{ 
                height: `${(currentStageIndex / (stages.length - 1)) * 100}%` 
              }}
            />
          </div>

          {/* Stages */}
          <div className="space-y-8 sm:space-y-12">
            {stages.map((stageKey, index) => {
              const config = stageConfig[stageKey];
              const isCompleted = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isNextActionable = index === currentStageIndex;
              const nextStageConfig = config.nextStage ? stageConfig[config.nextStage] : null;
              
              return (
                <div key={stageKey} className="relative">
                  {/* Stage Card */}
                  <div className="flex gap-3 sm:gap-4">
                    {/* Timeline Dot */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 flex-shrink-0",
                      isCompleted 
                        ? config.timelineColor + " text-white shadow-lg"
                        : "bg-gray-200 text-gray-400",
                      isCurrent && "ring-3 sm:ring-4 ring-blue-100 scale-110"
                    )}>
                      {isCompleted ? config.icon : <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-current" />}
                    </div>
                    
                    {/* Stage Content */}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "p-3 sm:p-4 rounded-lg border transition-all duration-300",
                        isCompleted 
                          ? "bg-gradient-to-r from-blue-50 to-blue-25 border-blue-200 shadow-sm" 
                          : "bg-gray-50 border-gray-200",
                        isCurrent && "ring-1 sm:ring-2 ring-blue-100 bg-white"
                      )}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <h4 className={cn(
                              "text-sm sm:text-base font-semibold transition-colors truncate",
                              isCompleted ? "text-gray-900" : "text-gray-500"
                            )}>
                              {config.title}
                            </h4>
                            <p className={cn(
                              "text-xs sm:text-sm mt-1 transition-colors line-clamp-2",
                              isCompleted ? "text-gray-600" : "text-gray-400"
                            )}>
                              {config.description}
                            </p>
                          </div>
                          
                          {/* Status Badge */}
                          {isCompleted && (
                            <div className="flex sm:justify-end">
                              <div className={cn(
                                "text-xs px-2 py-1 rounded border flex items-center gap-1",
                                isCurrent 
                                  ? "text-blue-600 bg-blue-50 border-blue-200"
                                  : "text-green-600 bg-green-50 border-green-200"
                              )}>
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="hidden sm:inline">
                                  {isCurrent ? "Current" : "Completed"}
                                </span>
                                <span className="sm:hidden">
                                  {isCurrent ? "Now" : "Done"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button BETWEEN Stages */}
                  {isNextActionable && nextStageConfig && (
                    <div className="mt-4 mb-4 sm:mt-6 sm:mb-6 flex justify-center">
                      <div className="relative flex flex-col items-center gap-3">
                        {/* Connecting line with arrow */}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="h-0.5 w-12 bg-gray-300"></div>
                          <ArrowRight className="w-4 h-4" />
                          <div className="h-0.5 w-12 bg-gray-300"></div>
                        </div>
                        
                        {/* Action Button */}
                        <Button
                          onClick={() => onUpdateStage?.(config.nextStage!)}
                          disabled={saving}
                          size="sm"
                          className={cn(
                            "shadow-sm transition-all duration-300 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300",
                            "px-4 py-2 h-auto min-h-9"
                          )}
                        >
                          {saving ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span>Updating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm font-medium">
                              {nextStageConfig.icon}
                              <span>{config.actionLabel}</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </Button>

                        {/* Next stage preview */}
                        <div className="text-center">
                          <p className="text-xs text-gray-500">
                            Next: <span className="font-medium text-gray-700">{nextStageConfig.title}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simple connector for completed stages */}
                  {isCompleted && !isNextActionable && index < stages.length - 1 && (
                    <div className="mt-4 mb-4 sm:mt-6 sm:mb-6 flex justify-center">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="h-0.5 w-20 bg-gray-300"></div>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <div className="h-0.5 w-20 bg-gray-300"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity History */}
      {activities.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <span className="hidden sm:inline">Activity Timeline</span>
              <span className="sm:hidden">Activity</span>
              <span className="text-gray-500">({activities.length})</span>
            </h3>
            <ChevronDown
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-300 flex-shrink-0",
                showHistory ? "rotate-180" : ""
              )}
            />
          </button>

          {showHistory && (
            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
              {activities.map((activity, idx) => (
                <div key={idx} className="flex gap-2 sm:gap-3 group">
                  <div className="flex flex-col items-center pt-0.5">
                    <div className={cn(
                      "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                      activity.completed ? "bg-green-500" : "bg-blue-500"
                    )} />
                    <div className="w-0.5 h-full bg-gray-200 group-last:h-0 mt-1" />
                  </div>
                  <div className="flex-1 pb-3 sm:pb-4 group-last:pb-0 min-w-0">
                    <div className={cn(
                      "rounded-lg p-2 sm:p-3 border",
                      activity.completed 
                        ? "bg-green-50 border-green-200" 
                        : "bg-blue-50 border-blue-200"
                    )}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {getActivityLabel(activity.action)}
                        </p>
                        <div className="flex items-center gap-2">
                          {activity.completed && (
                            <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                          )}
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border shrink-0">
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                      {activity.details && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{activity.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}