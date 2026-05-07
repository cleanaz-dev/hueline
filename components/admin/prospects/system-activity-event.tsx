"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Activity,
  Phone,
  Mail,
  PlaySquare,
  Globe,
  ChevronRight
} from "lucide-react";

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

// ─── CONFIG ─────────────────────────────────────────────────────────────────────

const getActivityDesign = (type?: string, activityType?: string) => {
  const combinedType = `${type || ''} ${activityType || ''}`.toUpperCase();

  let design = { Icon: Activity, iconColor: "text-zinc-400 dark:text-zinc-500" };

  if (combinedType.includes("CALL")) design = { Icon: Phone, iconColor: "text-blue-500 dark:text-blue-400" };
  else if (combinedType.includes("PAID") || combinedType.includes("PAYMENT")) design = { Icon: CreditCard, iconColor: "text-emerald-500 dark:text-emerald-400" };
  else if (combinedType.includes("FORM") || combinedType.includes("INTAKE")) design = { Icon: FileText, iconColor: "text-orange-500 dark:text-orange-400" };
  else if (combinedType.includes("EMAIL")) design = { Icon: Mail, iconColor: "text-purple-500 dark:text-purple-400" };
  else if (combinedType.includes("DEMO")) design = { Icon: PlaySquare, iconColor: "text-pink-500 dark:text-pink-400" };
  else if (combinedType.includes("LINK") || combinedType.includes("SUBDOMAIN")) design = { Icon: Globe, iconColor: "text-indigo-500 dark:text-indigo-400" };
  else if (combinedType.includes("COMPLETED") || combinedType.includes("STARTED") || combinedType.includes("APPROVED")) design = { Icon: CheckCircle2, iconColor: "text-green-500 dark:text-green-400" };

  return design;
};

// ─── METADATA COMPONENTS ────────────────────────────────────────────────────────

const CallMetadata = ({ meta }: { meta: SystemEventMetadata }) => {
  if (!meta?.callSummary && !meta?.duration) return null;
  return (
    <div className="flex flex-col gap-2 mt-2 p-3.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-100/80 dark:border-zinc-800/60 shadow-sm">
      {meta.callSummary && (
        <p className="text-[12px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {meta.callSummary}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-zinc-500 pt-1">
        {meta.duration && <span>⏱ {meta.duration}s</span>}
        {meta.estimatedValue != null && <span className="text-zinc-800 dark:text-zinc-200">Est: ${meta.estimatedValue}</span>}
        {meta.callReason && <span>#{meta.callReason.toLowerCase()}</span>}
      </div>
    </div>
  );
};

const PaymentMetadata = ({ meta }: { meta: SystemEventMetadata }) => {
  if (meta?.amount == null) return null;
  return (
    <div className="flex items-center gap-3 mt-2 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 w-fit">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600/70 dark:text-emerald-500/70 mb-0.5">
          Amount Captured
        </span>
        <span className="text-[14px] font-bold text-emerald-700 dark:text-emerald-400">
          ${meta.amount} {meta.currency?.toUpperCase() || 'USD'}
        </span>
        <span className="text-[10px] text-emerald-600/60 dark:text-emerald-500/50 font-mono mt-1">
          Txn: {meta.stripePaymentIntentId || meta.stripeSessionId}
        </span>
      </div>
    </div>
  );
};

const FormMetadata = ({ meta }: { meta: SystemEventMetadata }) => {
  if (!meta?.rooms?.length && !meta?.paintType && !meta?.sqft) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-100/80 dark:border-zinc-800/60 shadow-sm">
      {meta.paintType && (
        <span className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
          {meta.paintType}
        </span>
      )}
      {meta.sqft && (
        <span className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
          {meta.sqft} sqft
        </span>
      )}
      {meta.rooms?.map((room: string) => (
        <span key={room} className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700 capitalize">
          {room}
        </span>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export function SystemActivityEvent({ msg }: SystemActivityEventProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const title = msg.title || msg.body || "System Event";
  const { Icon, iconColor } = getActivityDesign(msg.type, msg.activityType);
  const hasExpandableContent = msg.description || msg.metadata;

  // Spring physics for the buttery layout shift
  const springConfig = { type: "spring" as const, bounce: 0.15, duration: 0.5 };

  return (
    <div className="w-full flex justify-center py-1">
      <motion.div 
        layout
        transition={springConfig}
        className={`w-full max-w-4xl rounded-2xl transition-colors duration-300 ${isExpanded ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'}`}
      >
        {/* CLICKABLE HEADER */}
        <button 
          onClick={() => hasExpandableContent && setIsExpanded(!isExpanded)}
          disabled={!hasExpandableContent}
          className={`w-full flex items-center px-4 py-3 focus:outline-none ${hasExpandableContent ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {/* THE VAN GOGH MAGIC: This collapses width to 0 and fades out when expanded */}
          <motion.div 
            initial={false}
            animate={{ 
              width: isExpanded ? 0 : 80, 
              opacity: isExpanded ? 0 : 1,
              marginRight: isExpanded ? 0 : 12
            }}
            transition={springConfig}
            className="overflow-hidden text-left shrink-0"
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
              SYSTEM
            </span>
          </motion.div>

          {/* MIDDLE: Icon & Title (Glides left due to `layout` prop) */}
          <motion.div layout transition={springConfig} className="flex items-center gap-3 min-w-0 flex-1">
            <Icon size={14} strokeWidth={2.5} className={`shrink-0 ${iconColor}`} />
            <span className={`text-[13px] font-medium truncate transition-colors duration-300 ${isExpanded ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
              {title}
              {msg.metadata?.amount && !isExpanded && (
                <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold text-[12px]">
                  ${msg.metadata.amount}
                </span>
              )}
            </span>
          </motion.div>

          {/* RIGHT: Time & Chevron */}
          <motion.div layout transition={springConfig} className="flex items-center justify-end gap-3 pl-2 shrink-0">
            <span className="text-[11px] font-medium text-zinc-400 shrink-0">
              {time}
            </span>
            {hasExpandableContent ? (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={springConfig}
                className="text-zinc-400 flex items-center justify-center"
              >
                <ChevronRight size={14} className={isExpanded ? "text-zinc-700 dark:text-zinc-300" : ""} />
              </motion.div>
            ) : (
              <div className="w-[14px]" /> 
            )}
          </motion.div>
        </button>

        {/* THE REVEAL: Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ ...springConfig, opacity: { duration: 0.3 } }}
              className="overflow-hidden"
            >
              {/* Padding-left perfectly aligns text under the newly shifted Icon */}
              <div className="pl-[44px] pr-4 sm:pr-8 pb-4 pt-1">
                
                {msg.description && (
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-1">
                    {msg.description}
                  </p>
                )}

                {msg.metadata && (
                  <div className="flex flex-col">
                    {(msg.type === 'CALL' || msg.metadata.callSummary) && <CallMetadata meta={msg.metadata} />}
                    {(msg.metadata.amount != null || msg.metadata.stripePaymentIntentId) && <PaymentMetadata meta={msg.metadata} />}
                    {(msg.metadata.rooms?.length || msg.metadata.sqft) && <FormMetadata meta={msg.metadata} />}
                    
                    {(msg.metadata?.actionUrl || msg.metadata?.recordingUrl) && (
                      <div className="flex items-center gap-2 mt-3">
                        {msg.metadata.recordingUrl && (
                          <a href={msg.metadata.recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors shadow-sm">
                            <PlaySquare size={12} className={iconColor} /> Play Audio
                          </a>
                        )}
                        {msg.metadata.actionUrl && (
                          <a href={msg.metadata.actionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors shadow-sm">
                            {msg.metadata.actionLabel || "View Details"} <ExternalLink size={12} className="text-zinc-400" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}