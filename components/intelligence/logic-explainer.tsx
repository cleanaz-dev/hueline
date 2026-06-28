"use client";

import { Info } from "lucide-react";
import React from "react";

interface LogicExplainerProps {
  icon: React.ElementType;
  title: string;
  description: string;
  exampleTitle: string;
  exampleContent: React.ReactNode;
}

export function LogicExplainer({
  icon: Icon,
  title,
  description,
  exampleTitle,
  exampleContent,
}: LogicExplainerProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900">
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
        <div className="lg:col-span-1 bg-zinc-50 border border-zinc-200/60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
              {exampleTitle}
            </h3>
          </div>
          <div className="text-xs text-zinc-600 leading-relaxed">
            {exampleContent}
          </div>
        </div>
      </div>
    </div>
  );
}