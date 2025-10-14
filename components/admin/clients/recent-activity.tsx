"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { activityLabels, formatActivityDate } from "@/lib/config/stage-config";

interface FormActivity {
  action: string;
  createdAt: string;
  details?: string;
  completed?: boolean;
}

interface RecentActivityProps {
  activities: FormActivity[];
  maxItems?: number;
  className?: string;
}

export function RecentActivity({ 
  activities, 
  maxItems = 3,
  className 
}: RecentActivityProps) {
  const [showHistory, setShowHistory] = useState(false);

  const getActivityLabel = (action: string): string => {
    return activityLabels[action] || action;
  };

  const displayedActivities = showHistory 
    ? activities.slice(0, maxItems * 2) // Show more when expanded
    : activities.slice(0, maxItems);

  if (activities.length === 0) {
    return (
      <div className={cn("text-center py-4 text-gray-500 text-sm", className)}>
        No activity yet
      </div>
    );
  }

  return (
    <div className={cn("border-t pt-4", className)}>
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
          {displayedActivities.map((activity, idx) => (
            <div key={idx} className="flex gap-3 text-sm pl-4">
              <div className="text-gray-400 flex-shrink-0 mt-0.5">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  activity.completed ? "bg-green-500" : "bg-blue-500"
                )} />
              </div>
              <div className="flex-1 min-w-0 pb-2 border-b border-gray-100 last:border-b-0">
                <p className="font-medium text-gray-900">
                  {getActivityLabel(activity.action)}
                </p>
                {activity.details && (
                  <p className="text-gray-600 text-xs mt-0.5">{activity.details}</p>
                )}
                <p className="text-gray-500 text-xs mt-0.5">
                  {formatActivityDate(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}