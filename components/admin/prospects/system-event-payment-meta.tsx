// system-event-payment-meta.tsx

export interface PaymentMetadataProps {
  meta: {
    amount?: number;
    currency?: string;
    stripePaymentIntentId?: string;
    stripeSessionId?: string;
  };
}

export function PaymentMetadata({ meta }: PaymentMetadataProps) {
  if (meta?.amount == null) return null;
  
  return (
    <div className="flex items-center gap-3 mt-2 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 w-fit">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600/70 dark:text-emerald-500/70 mb-0.5">
          Amount Captured
        </span>
        <span className="text-[14px] font-bold text-emerald-700 dark:text-emerald-400">
          ${meta.amount} {meta.currency?.toUpperCase() || "USD"}
        </span>
        <span className="text-[10px] text-emerald-600/60 dark:text-emerald-500/50 font-mono mt-1">
          Txn: {meta.stripePaymentIntentId || meta.stripeSessionId}
        </span>
      </div>
    </div>
  );
}

