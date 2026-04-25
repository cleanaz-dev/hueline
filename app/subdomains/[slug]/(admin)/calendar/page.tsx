"use client"
import useSWR from "swr"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = momentLocalizer(moment)
const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CalendarPage() {
  const { data, isLoading, error } = useSWR("/api/admin/get-calendar", fetcher)

  const events = (data ?? []).map((b: any) => ({
    title: b.title,
    start: new Date(b.startTime),
    end: new Date(b.endTime),
  }))

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Failed to load bookings.</p>

  return (
    <div style={{ height: "100vh", padding: "1rem" }}>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="month"
        views={["month", "week", "day", "agenda"]}
      />
    </div>
  )
}