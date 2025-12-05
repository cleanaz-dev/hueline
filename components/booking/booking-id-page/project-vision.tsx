import { Lightbulb } from "lucide-react"

interface BookingParams {
  booking: {
    prompt: string
  }
}

export default function ProjectVision({ booking: { prompt } }: BookingParams) {
  return (
    <section>
      <div className="bg-background rounded-2xl shadow-sm py-8 px-6 md:px-8 md:py-10">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <h2 className="ml-3 text-lg md:text-2xl font-semibold">
            Project Vision
          </h2>
        </div>
        <div className="bg-primary/5 rounded-xl p-4 md:p-6 border border-primary/10">
          <p className="md:text-lg italic leading-relaxed">
            "{prompt}"
          </p>
        </div>
      </div>
    </section>
  )
}