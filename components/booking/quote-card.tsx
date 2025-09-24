import React, { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CouponCard = () => {
  const [timeLeft, setTimeLeft] = useState(3542); // 59 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-dashed border-orange-400/70 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardContent className="p-6 text-center">
        {/* Coupon Header */}
        <div className="mb-4">

          <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-1 rounded-full mb-2">
            <Timer className="h-4 w-4" />
            <span className="font-bold">LIMITED TIME</span>
          </div>
          <h2 className="text-2xl font-bold text-orange-700">15% OFF</h2>
          <p className="text-orange-600">Your Next Service</p>
          <div className="text-xs text-orange-500 mt-2 p-2 rounded-2xl bg-background/10 text-balance">
    <p>This is what YOUR customers will see—drives instant bookings.</p>
  </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-white border-2 border-orange-300 rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-600 mb-1">Offer expires in</div>
          <div className="text-3xl font-mono font-bold text-orange-600">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Coupon Code */}
        <div className="bg-white border-2 border-green-500 rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-600 mb-1">Use coupon code</div>
          <div className="text-2xl font-mono font-bold text-green-600 tracking-widest">
            SAVE15NOW
          </div>
        </div>

        {/* Book Button */}
        <Button 
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg shadow-lg"
        size="lg"
        asChild
        >
          <Link href="/booking">
          Book Now & Save
          </Link>
        </Button>

        {/* Fine Print */}
        <p className="text-xs text-gray-500 mt-3">
          *Valid for first-time customers. Cannot be combined with other offers.
        </p>
      </CardContent>
    </Card>
  );
};

export default CouponCard;