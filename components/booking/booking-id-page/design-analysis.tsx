import { Sparkles } from "lucide-react";
interface BookingParams {
  booking: {
    summary: string;
  };
}

export default function DesignAnalysis({
  booking: { summary },
}: BookingParams) {
  return (
    <section>
      <div className="bg-background rounded-2xl shadow-sm border border-primary/10 py-8 px-6 md:px-8 md:py-10">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="ml-3 text-lg md:text-2xl font-semibold">
            Design Analysis
          </h2>
        </div>
        <div className="prose prose-lg max-w-none text-sm md:text-base leading-6 md:leading-normal">
          <p>{summary}</p>
        </div>
      </div>
    </section>
  );
}
