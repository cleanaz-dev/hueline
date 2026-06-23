export interface SystemEventMetadata {
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
  // Follow-up specific
  reason?: string; // <-- Added reason here
  triggerAt?: string | Date;
  scheduleName?: string;
  status?: string;

  followUpId?: string;
  threadId?: string;
}

export interface SystemActivityEventProps {
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