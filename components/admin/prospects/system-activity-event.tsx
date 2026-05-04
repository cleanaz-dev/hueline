"use client";

import { 
  MousePointerClick, 
  ExternalLink, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Activity,
  Phone,
  Mail,
  PlaySquare,
  Globe
} from "lucide-react";

// 1. Better Type Safety instead of `any`
interface SystemEventMetadata {
  callSummary?: string;
  duration?: number | string;
  estimatedValue?: number;
  costBreakdown?: string;
  callReason?: string;
  projectScope?: string;
  amount?: number;
  currency?: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  rooms?: string[];
  paintType?: string;
  sqft?: number | string;
  subject?: string;
  actionUrl?: string;
  actionLabel?: string;
  recordingUrl?: string;
  demoUrl?: string;
}

interface SystemActivityEventProps {
  msg: {
    id: string;
    title?: string;
    body?: string;        
    description?: string; 
    createdAt: Date | string;
    type?: string;        
    activityType?: string;
    metadata?: SystemEventMetadata;
  };
}

const getActivityDesign = (type?: string, activityType?: string) => {
  const combinedType = `${type || ''} ${activityType || ''}`.toUpperCase();

  if (combinedType.includes("CALL")) return { Icon: Phone, color: "text-blue-500" };
  if (combinedType.includes("PAID") || combinedType.includes("PAYMENT")) return { Icon: CreditCard, color: "text-emerald-500" };
  if (combinedType.includes("FORM") || combinedType.includes("INTAKE")) return { Icon: FileText, color: "text-orange-500" };
  if (combinedType.includes("EMAIL")) return { Icon: Mail, color: "text-purple-500" };
  if (combinedType.includes("DEMO")) return { Icon: PlaySquare, color: "text-pink-500" };
  if (combinedType.includes("LINK") || combinedType.includes("SUBDOMAIN")) return { Icon: Globe, color: "text-indigo-500" };
  if (combinedType.includes("COMPLETED") || combinedType.includes("STARTED")) return { Icon: CheckCircle2, color: "text-green-500" };
  
  return { Icon: Activity, color: "text-zinc-400" };
};

// ─── METADATA RENDERERS ─────────────────────────────────────────────────────────

const CallMetadata = ({ meta }: { meta: SystemEventMetadata }) => {
  if (!meta?.callSummary && !meta?.duration) return null;
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-3.5 text-left space-y-2.5 relative z-10">
      {meta.callSummary && (
        <p className="text-[12px] text-zinc-600 dark:text-zinc-300 leading-relaxed break-words">
          <strong className="font-semibold text-zinc-900 dark:text-zinc-100 mr-1">AI Summary:</strong> 
          {meta.callSummary}
        </p>
      )}
      {((meta.estimatedValue != null && meta.estimatedValue > 0) || meta.costBreakdown) && (
        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-2.5 rounded-lg text-[11px] border border-zinc-100 dark:border-zinc-800/50">
          {meta.estimatedValue != null && (
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Est. Value: ${meta.estimatedValue}</span>
          )}
          {meta.costBreakdown && <p className="text-zinc-500 dark:text-zinc-400 mt-1 break-words">{meta.costBreakdown}</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-zinc-400 font-mono uppercase tracking-wider pt-1">
        {meta.duration && <span className="flex items-center gap-1">⏱ {meta.duration}s</span>}
        {meta.callReason && <span className="truncate max-w-[150px]">• TAG: {meta.callReason}</span>}
        {meta.projectScope && <span className="truncate max-w-[150px]">• SCOPE: {meta.projectScope}</span>}
      </div>
    </div>
  );
};

const PaymentMetadata = ({ meta }: { meta: SystemEventMetadata }) => {
  // 3. Fixed Falsy value bug (0 is a valid amount)
  if (meta?.amount == null) return null;
  return (
    <div className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 border border-emerald-500/20 shadow-sm rounded-xl p-4 text-left relative overflow-hidden z-10">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
      
      <div className="flex flex-col pl-2">
        <span className="uppercase text-[9px] font-bold text-emerald-600/80 dark:text-emerald-400/80 mb-0.5">Amount Paid</span>
        <span className="text-[15px] font-black text-emerald-700 dark:text-emerald-400">
          ${meta.amount} {meta.currency?.toUpperCase() || 'USD'}
        </span>
      </div>
      <div className="flex flex-col text-right">
        <span className="uppercase text-[9px] font-bold text-emerald-600/80 dark:text-emerald-400/80 mb-0.5">Txn ID</span>
        <span className="font-mono text-[10px] text-emerald-700/80 dark:text-emerald-400/80 truncate max-w-[100px] sm:max-w-[130px]">
          {meta.stripePaymentIntentId || meta.stripeSessionId}
        </span>
      </div>
    </div>
  );
};

const FormMetadata = ({ meta }: { meta: SystemEventMetadata }) => {
  if (!meta?.rooms?.length && !meta?.paintType && !meta?.sqft) return null;
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-1 relative z-10">
      {meta.paintType && (
        <span className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-600 dark:text-zinc-300 max-w-[150px] truncate">
          {meta.paintType}
        </span>
      )}
      {meta.sqft && (
        <span className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
          {meta.sqft} sqft
        </span>
      )}
      {meta.rooms?.map((room: string) => (
        <span key={room} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-500 capitalize max-w-[120px] truncate">
          {room}
        </span>
      ))}
    </div>
  );
};

// Main Export
export function SystemActivityEvent({ msg }: SystemActivityEventProps) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const title = msg.title || msg.body || "System Activity";
  const { Icon, color } = getActivityDesign(msg.type, msg.activityType);

  return (
    <div className="relative flex flex-col items-center justify-center w-full py-4 group">
      
      {/* 
        1. Fixed line bleed: Added group-first and group-last to ensure the line 
        doesn't bleed out into empty space at the top/bottom of the chat feed.
      */}
      <div className="absolute -top-4 -bottom-4 left-1/2 w-px bg-zinc-200 dark:bg-zinc-800 -translate-x-1/2 z-0 group-first:top-1/2 group-last:bottom-1/2" />

      {/* Main Content Wrapper - Centered & Compact */}
      <div className="flex flex-col items-center w-full max-w-[90%] sm:max-w-md">
        
        {/* The Central Minimal Pill */}
        <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-full text-[10px] text-zinc-500 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
          <Icon size={12} className={color} strokeWidth={2.5} />
          <span className="uppercase tracking-wider font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
            {title}
          </span>
          <span className="opacity-50 ml-1 font-normal tracking-normal shrink-0">{time}</span>
        </div>

        {/* 2. Fixed Ugly Boxes: Applied background to the div, not the span, matching chat background */}
        {msg.description && (
          <div className="relative z-10 mt-2.5 max-w-[90%] text-center bg-white dark:bg-zinc-950 px-3 py-1 rounded-md">
            <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 break-words">
              {msg.description}
            </p>
          </div>
        )}

        {/* Embedded Metadata Blocks */}
        {msg.metadata && (
          <div className="mt-3 w-full max-w-[95%] sm:max-w-sm flex flex-col items-center gap-3">
            {(msg.type === 'CALL' || msg.metadata.callSummary) && <CallMetadata meta={msg.metadata} />}
            {(msg.metadata.amount != null || msg.metadata.stripePaymentIntentId) && <PaymentMetadata meta={msg.metadata} />}
            {(msg.metadata.rooms?.length || msg.metadata.sqft) && <FormMetadata meta={msg.metadata} />}
            
            {/* Fallback for simple email/integration metadata strings */}
            {msg.metadata.subject && (
              <div className="relative z-10 w-full text-center text-[11px] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-2 px-3 rounded-lg shadow-sm truncate">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Subj:</span> {msg.metadata.subject}
              </div>
            )}

            {/* Action Buttons */}
            {(msg.metadata?.actionUrl || msg.metadata?.recordingUrl || msg.metadata?.demoUrl) && (
              <div className="relative z-10 flex justify-center gap-2 mt-1">
                {msg.metadata.recordingUrl && (
                  <a href={msg.metadata.recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-semibold rounded-full transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1">
                    <PlaySquare size={11} className="text-zinc-400" /> Play Audio
                  </a>
                )}
                {msg.metadata.actionUrl && (
                  <a href={msg.metadata.actionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-semibold rounded-full transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1">
                    {msg.metadata.actionLabel || "View"} <ExternalLink size={11} className="text-zinc-400" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}