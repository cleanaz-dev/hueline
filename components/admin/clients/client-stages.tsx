"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, User, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  stageConfig,
  activityLabels,
  formatActivityDate,
  type StageConfig,
} from "@/lib/config/stage-config";

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

interface ClientStagesProps {
  data: ClientData;
  stage: string;
  saving: boolean;
  activities?: FormActivity[];
  onUpdateStage?: (stage: string) => Promise<void>;
}

export function ClientStages({
  data,
  stage,
  saving,
  activities = [],
  onUpdateStage,
}: ClientStagesProps) {
  const [showHistory, setShowHistory] = useState(false);

  const current: StageConfig =
    stageConfig[stage] || stageConfig.INTAKE_FORM_COMPLETE;
  const next = current.nextStage ? stageConfig[current.nextStage] : null;

  const getActivityLabel = (action: string): string => {
    return activityLabels[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* Client Info */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {data.name}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="truncate">{data.company}</span>
            <span>•</span>
            <span>{data.hours || "Standard hours"}</span>
            <span>•</span>
            <span>{data.phone}</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-2 py-4 md:px-8 md:py-6 rounded-lg space-y-4 mb-4">
        {/* Current Stage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Current Stage</h4>
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Active
            </div>
          </div>

          <div
            className={cn(
              "p-4 rounded-lg border border-gray-200 flex items-start gap-3",
              current.color
            )}
          >
            <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              {current.icon}
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 text-sm md:text-base">
                {current.title}
              </h5>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {current.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {current.nextStage && (
          <div className="flex justify-center">
            <Button
              onClick={() => onUpdateStage?.(current.nextStage!)}
              disabled={saving}
              variant="ghost"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {current.actionLabel}
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        )}

        {/* Next Stage */}
        {next && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Next Stage</h4>
            <div className="p-4 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg border border-gray-200">
                {next.icon}
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-700 text-sm md:text-base">
                  {next.title}
                </h5>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {next.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity History */}
      {activities.length > 0 && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-left group"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Recent Activity ({activities.length})
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-gray-600",
                showHistory ? "rotate-180" : ""
              )}
            />
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {activities.slice(0, 3).map((activity, idx) => (
                <div key={idx} className="flex gap-3 text-sm pl-4">
                  <div className="text-gray-400 flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0 pb-2 border-b border-gray-100 last:border-b-0">
                    <p className="font-medium text-gray-900">
                      {getActivityLabel(activity.action)}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {formatActivityDate(activity.createdAt)}
                    </p>
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
