

interface BookingParams {
  booking: {
    prompt: string;
  };
}

export default function SubProjectVision({ booking: { prompt } }: BookingParams) {
  return (
    <section className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 relative overflow-hidden">
        
        {/* Ambient Glow (Subtle yellow tint in top right to match 'Lightbulb' idea) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10">
          {/* Header Section - Matches the 'Label' style of the Hero */}
          <div className="flex items-center gap-3 mb-6">
           
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Project Vision
            </h2>
          </div>
          {/* Editorial Content Section */}
          <div className="relative">
            {/* Large decorative quote mark */}
            <div className="pl-4 md:pl-8 border-l-2 border-primary/20 py-2">
              <p className="text-xl md:text-3xl font-serif italic text-gray-900 leading-relaxed opacity-90">
                "{prompt}"
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}