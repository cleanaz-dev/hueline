"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Percent, DollarSign, PhoneOff } from "lucide-react";

export default function CalculateROI() {
  const [monthlyCalls, setMonthlyCalls] = useState(15);
  const [conversionRate, setConversionRate] = useState(20);
  const [averageJob, setAverageJob] = useState(5000);

  const monthlyRevenue = Math.round(
    monthlyCalls * (conversionRate / 100) * averageJob
  );
  const yearlyRevenue = monthlyRevenue * 12;

  return (
    <section id="roi" className="py-20">
      <div className="container mx-auto px-6">
        {/* HEADER */}
        <div className="header-section-div mb-12 text-center">
          <h2 className="section-badge">Calculate Your ROI</h2>
          <h1 className="section-header text-balance">
            <span className="text-primary">Hue-Line </span>Pays for Itself
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            See how much revenue you could recover by never missing another call
          </p>
        </div>

        {/* CENTERED BOX */}
        <div className="flex justify-center">
          <Card className="p-8 w-full max-w-4xl rounded-2xl shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <CardContent className="space-y-10 p-0">
              {/* INPUTS — grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="monthly-calls" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <PhoneOff className="w-4 h-4 text-primary" />
                    Monthly Missed Calls
                  </Label>
                  <Input
                    id="monthly-calls"
                    type="number"
                    min={0}
                    value={monthlyCalls}
                    onChange={(e) => setMonthlyCalls(Number(e.target.value))}
                    className="text-lg h-12 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="conversion-rate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-primary" />
                    Conversion Rate (%)
                  </Label>
                  <Input
                    id="conversion-rate"
                    type="number"
                    min={0}
                    max={100}
                    value={conversionRate}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="text-lg h-12 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="average-job" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Average Job Value ($)
                  </Label>
                  <Input
                    id="average-job"
                    type="number"
                    min={0}
                    value={averageJob}
                    onChange={(e) => setAverageJob(Number(e.target.value))}
                    className="text-lg h-12 border-2 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* RESULTS SECTION */}
              <div className="space-y-6">
                {/* Monthly Revenue */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-primary rounded-xl p-8 text-center transform transition-all hover:shadow-md">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                      Monthly Revenue Potential
                    </h3>
                  </div>
                  
                  <div className="text-4xl md:text-6xl font-extrabold md:font-bold text-primary mb-3 tracking-tight">
                    ${monthlyRevenue.toLocaleString()}
                  </div>
                  
                  <p className="text-gray-700 text-base">
                    from {Math.round(monthlyCalls * (conversionRate / 100))} converted call(s) per month
                  </p>
                </div>

                {/* Yearly Projection */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 border-2 border-green-500 rounded-xl p-6 text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Annual Revenue Potential</p>
                  <div className="text-4xl font-bold text-green-600">
                    ${yearlyRevenue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* FOOTER NOTE */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p>💡 These calculations show potential revenue recovery based on your inputs</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}