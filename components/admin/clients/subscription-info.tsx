"use client";

import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  Link2,
  CreditCard,
  Copy,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

interface ClientData {
  id?: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  features: string[];
  hours?: string;
  feePaid: boolean;
  subscribed: boolean;
  subLinkSent: boolean;
}

interface FormActivity {
  action: string;
  createdAt: string;
  details?: string;
}

interface SubscriptionInfoProps {
  data: ClientData;
  saving: boolean;
  activities?: FormActivity[];
  onSendSubscription: () => Promise<void>;
  onRequestPayment?: () => Promise<void>;
}

export function SubscriptionInfo({
  data,
  saving,
  activities = [],
  onSendSubscription,
  onRequestPayment,
}: SubscriptionInfoProps) {
  const [showHistory, setShowHistory] = useState(false);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "SUB_LINK_SENT":
        return <Send className="w-4 h-4" />;
      case "PAYMENT_REQUESTED":
        return <CreditCard className="w-4 h-4" />;
      case "SUBSCRIBED":
        return <CheckCircle2 className="w-4 h-4" />;
      case "FEE_PAID":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "SUB_LINK_SENT":
        return "Subscription link sent";
      case "PAYMENT_REQUESTED":
        return "Payment requested";
      case "SUBSCRIBED":
        return "Subscription activated";
      case "FEE_PAID":
        return "Setup fee paid";
      default:
        return action;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 bg-gradient-to-b from-primary/15 to-primary/5 rounded-lg space-y-4 mb-6">
      <div>
        <h2 className="text-sm md:text-base font-semibold mb-3">
          Subscription & Payment Status
        </h2>
        
        <div className="space-y-3">
          {/* Setup Fee Status */}
          <div className="p-3 bg-muted rounded-lg border">
            <div className="flex items-start gap-3 mb-3">
              {data.feePaid ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {data.feePaid ? "Setup Fee Paid" : "Setup Fee Pending"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.feePaid
                    ? "One-time setup fee received"
                    : "Client needs to pay the initial setup fee"}
                </p>
              </div>
            </div>
            {!data.feePaid && (
              <Button
                onClick={onRequestPayment}
                disabled={saving}
                size="sm"
                variant="outline"
                className="w-full"
                title="Send client an invoice or payment link for the setup fee"
              >
                <CreditCard className="w-4 h-4 mr-1" />
                Send Invoice
              </Button>
            )}
          </div>

          {/* Subscription Status */}
          <div className="p-3 bg-muted rounded-lg border">
            <div className="flex items-start gap-3 mb-3">
              {data.subscribed ? (
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : data.subLinkSent ? (
                <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {data.subscribed
                    ? "Subscription Active"
                    : data.subLinkSent
                    ? "Subscription Link Sent"
                    : "Subscription Not Started"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.subscribed
                    ? "Client has an active subscription"
                    : data.subLinkSent
                    ? "Waiting for client to complete signup"
                    : "Client hasn't received signup link yet"}
                </p>
              </div>
            </div>
            {!data.subscribed && (
              <Button
                onClick={onSendSubscription}
                disabled={saving}
                size="sm"
                variant="outline"
                className="w-full"
                title={
                  data.subLinkSent
                    ? "Send the subscription link again"
                    : "Send client the subscription signup link"
                }
              >
                {data.subLinkSent ? (
                  <>
                    <Link2 className="w-4 h-4 mr-1" />
                    Resend Link
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Send Link
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      {activities.length > 0 && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showHistory ? "rotate-180" : ""
              }`}
            />
            Activity History ({activities.length})
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {activities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5 text-muted-foreground">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {getActionLabel(activity.action)}
                    </p>
                    {activity.details && (
                      <p className="text-muted-foreground">{activity.details}</p>
                    )}
                    <p className="text-muted-foreground">
                      {formatDate(activity.createdAt)}
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