"use client";

import {
  Ear,
  MessageSquareQuote,
  Sparkles,
  ArrowRight,
  Paintbrush,
  Clock,
  Layers,
  Grid3X3,
  Palette,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LogicExplainer } from "./logic-explainer";
import { INTELLIGENCE_EXAMPLES } from "./constants";

const SIGNAL_ICONS: Record<string, LucideIcon> = {
  "ex-1": Paintbrush,
  "ex-2": Clock,
  "ex-3": Layers,
  "ex-4": Grid3X3,
  "ex-5": Palette,
  "ex-6": Briefcase,
};

export function ListeningTab({ flags }: { flags?: string[] }) {
  const examples = INTELLIGENCE_EXAMPLES.contextDetection;
  const [featured, ...moreExamples] = examples;

  return (
    <div className="outline-none animate-in fade-in slide-in-from-bottom-1 duration-300 space-y-5">
      <LogicExplainer
        icon={Ear}
        title="Context Detection"
        description="The AI listens during the estimate call and flags painter-specific job details. These flags feed directly into pricing rules, crew selection, and material estimates."
        exampleTitle="Example"
        exampleContent={
          <div className="space-y-3">
            <blockquote className="border-l-2 border-emerald-300 pl-3 text-sm italic text-zinc-700">
              &ldquo;{featured.utterance}&rdquo;
            </blockquote>

            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
              <span>Detected flag:</span>
              <Badge
                variant="outline"
                className={`${featured.badgeColor} text-xs shadow-none font-medium`}
              >
                {featured.result}
              </Badge>
            </div>
          </div>
        }
      />

      {/* MORE SIGNALS */}
      <div className="space-y-3">
      

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {moreExamples.map((example) => {
            const Icon = SIGNAL_ICONS[example.id] ?? MessageSquareQuote;
            const bgClass = example.badgeColor.split(" ")[0];

            return (
              <div
                key={example.id}
                className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-background p-3 shadow-sm"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bgClass}`}
                >
                  <Icon className="h-4 w-4 text-current opacity-80" />
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-900">
                      {example.title}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${example.badgeColor}  shadow-none font-medium whitespace-nowrap`}
                      
                    >
                      {example.result}
                    </Badge>
                  </div>

                  <blockquote className="border-l-2 border-zinc-300 pl-2.5  italic text-zinc-600">
                    &ldquo;{example.utterance}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <Sparkles className="h-3 w-3" />
                    <span>Detected from natural language</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIGURED FLAGS */}
      {flags && flags.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <h4 className="mb-2 text-xs font-bold uppercase text-zinc-500">
            Configured Signals
          </h4>
          <div className="flex flex-wrap gap-2">
            {flags.map((flag) => (
              <Badge
                key={flag}
                variant="secondary"
                className="font-mono text-xs"
              >
                {flag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

