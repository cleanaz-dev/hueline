"use client";
import useSWR from "swr";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarDayModal } from "./calendar-day-modal";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type Booking = { 
  title: string; 
  start: string; 
  end: string; 
  type?: string;
  meetingUrl?: string;
  location?: string
};

const EVENT_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  meeting: "#10b981",
  default: "#3174ad",
};

export default function CalendarPage() {
  const today = new Date();
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selected, setSelected] = useState<Date | null>(null);

  const { data, isLoading, error } = useSWR(
    "/api/admin/get-calendar",
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: false,
      errorRetryCount: 3,
      errorRetryInterval: 5_000,
    },
  );

  const events: Booking[] = Array.isArray(data) ? data : [];

  const eventsOnDay = (date: Date) =>
    events.filter((b) => {
      const d = new Date(b.start);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay
      ? null
      : new Date(current.year, current.month, i - firstDay + 1),
  );

  const prev = () =>
    setCurrent((c) =>
      c.month === 0
        ? { year: c.year - 1, month: 11 }
        : { ...c, month: c.month - 1 },
    );
  const next = () =>
    setCurrent((c) =>
      c.month === 11
        ? { year: c.year + 1, month: 0 }
        : { ...c, month: c.month + 1 },
    );

  const selectedEvents = selected ? eventsOnDay(selected) : [];

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner className="animate-spin size-8 text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-muted-foreground">
          Failed to load.{" "}
          <button
            className="underline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </p>
      </div>
    );

  return (
    <div className="admin-first-div p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-primary font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="font-medium w-40 text-center">
            {MONTHS[current.month]} {current.year}
          </span>
          <button
            onClick={next}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-xs font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-l border-t border-border flex-1">
        {cells.map((date, i) => {
          if (!date)
            return (
              <div
                key={`empty-${i}`}
                className="border-r border-b border-border bg-muted/30 min-h-0"
              />
            );

          const dayEvents = eventsOnDay(date);
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selected?.toDateString() === date.toDateString();

          return (
            <div
              key={date.toISOString()}
              onClick={() => setSelected(isSelected ? null : date)}
              className={`border-r border-b border-border min-h-20 p-1 cursor-pointer transition-colors
                ${isSelected ? "bg-primary/5" : "hover:bg-muted/40"}`}
            >
              <div
                className={`text-xs w-6 h-6 flex items-center justify-center rounded-full mb-1
                ${isToday ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}`}
              >
                {date.getDate()}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 2).map((e, idx) => (
                  <div
                    key={idx}
                    className="text-[10px] truncate rounded px-1 text-white leading-4"
                    style={{
                      backgroundColor:
                        EVENT_COLORS[e.type ?? "default"] ??
                        EVENT_COLORS.default,
                    }}
                  >
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-muted-foreground pl-1">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selected && (
        <CalendarDayModal
          date={selected}
          events={eventsOnDay(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
