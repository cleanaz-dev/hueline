"use client";
import { X, Clock } from "lucide-react";

type Booking = {
  title: string;
  start: string;
  end: string;
  type?: string;
  attendees?: { name: string; email: string }[];
};

const EVENT_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  meeting: "#10b981",
  default: "#3174ad",
};

interface CalendarDayModalProps {
  date: Date;
  events: Booking[];
  onClose: () => void;
}

export function CalendarDayModal({ date, events, onClose }: CalendarDayModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {date.toLocaleDateString("en-US", { weekday: "long" })}
            </p>
            <p className="text-lg font-semibold">
              {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No bookings for this day</p>
          ) : (
            <div className="flex flex-col gap-3">
              {events.map((e, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div
                    className="w-1 rounded-full shrink-0"
                    style={{ backgroundColor: EVENT_COLORS[e.type ?? "default"] ?? EVENT_COLORS.default }}
                  />
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      <span>
                        {new Date(e.start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {" — "}
                        {new Date(e.end).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    {e.attendees && e.attendees.length > 0 && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        {e.attendees.map((a, j) => (
                          <p key={j} className="text-xs text-muted-foreground truncate">
                            {a.name} · {a.email}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="text-sm px-4 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}