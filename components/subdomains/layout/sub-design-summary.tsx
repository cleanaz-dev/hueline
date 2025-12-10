
import { useState, useRef } from "react";
import { Sparkles, Quote, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useBooking } from "@/context/booking-context";

interface BookingParams {
  booking: {
    summary: string;
  };

}

export default function SubDesignSummary({
  booking: { summary },

}: BookingParams) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { subdomain, booking } = useBooking()

  const handleTTS = async () => {
    // If already playing, stop it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      // Call your API route
      const response = await fetch(
        `/api/subdomain/${subdomain.slug}/booking/${booking.huelineId}/tts`
      );

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        alert("Error playing audio");
      };

      await audio.play();

    } catch (error) {
      console.error("TTS Error:", error);
      setIsLoading(false);
      alert("Failed to generate speech. Please try again.");
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto">
      <div className="group relative overflow-hidden bg-white rounded-3xl  border border-gray-100">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />
        
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <Quote size={120} />
        </div>

        <div className="flex flex-col md:flex-row relative z-10">
          
          <div className="md:w-1/4 p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-50 bg-gray-50/30">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Sparkles size={18} />
                </div>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Visual Summary
                </h2>
              </div>
              
              {/* <button
                onClick={handleTTS}
                disabled={isLoading}
                className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <VolumeX size={16} />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={16} />
                    <span>Listen</span>
                  </>
                )}
              </button> */}
            </div>
          </div>

          <div className="md:w-3/4 p-8 md:p-10 bg-white">
            <div className="prose prose-lg max-w-none">
              <p className="
                text-gray-600 
                text-base md:text-lg 
                leading-[1.8] 
                tracking-wide
                
                first-letter:float-left 
                first-letter:text-6xl 
                first-letter:font-serif 
                first-letter:font-bold 
                first-letter:mr-4 
                first-letter:mt-[-6px]
                first-letter:text-transparent 
                first-letter:bg-clip-text 
                first-letter:bg-gradient-to-br 
                first-letter:from-gray-900 
                first-letter:to-gray-500
              ">
                {summary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}