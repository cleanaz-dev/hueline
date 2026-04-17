"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Card, CardContent } from "../card";
import { 
  Palette, 
  Calculator, 
  Users2, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Clock,
  ShieldCheck
} from "lucide-react";

interface ChallengeMetrics {
  value: string;
  label: string;
  colorClass: string;
  icon: ReactNode;
}

interface BusinessChallenge {
  id: number;
  title: string;
  challenge: string;
  solution: string;
  icon: ReactNode;
  metric: ChallengeMetrics;
}

const challenges: BusinessChallenge[] =[
  {
    id: 1,
    title: "Closing Delays Due to Color Indecision",
    challenge: "Clients hesitate to commit or pay deposits because they can't visualize the final look, leading to endless back-and-forth consultations.",
    solution: "With Hue-Line integration, instantly generate hyper-realistic paint mockups during the consultation. Show them the result and close the deal on the spot.",
    icon: <Palette className="size-7" />,
    metric: {
      value: "+40%",
      label: "Higher Close Rate",
      colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: <TrendingUp className="size-4" />
    }
  },
  {
    id: 2,
    title: "Inefficient Quoting Process",
    challenge: "Time-consuming site visits, manual measurements, and building estimates drastically reduce your team's billable hours.",
    solution: "Generate professional, highly accurate proposals instantly using automated calculations and voice-to-text project scope capture.",
    icon: <Calculator className="size-7" />,
    metric: {
      value: "10x",
      label: "Faster Quoting",
      colorClass: "text-amber-700 bg-amber-50 border-amber-200",
      icon: <Clock className="size-4" />
    }
  },
  {
    id: 3,
    title: "Client Experience & Follow-Ups",
    challenge: "Managing customer communications manually leads to forgotten follow-ups, dropped leads, and inconsistent client experiences.",
    solution: "Automated CRM updates, personalized client portals, and premium SMS follow-ups keep your sales pipeline moving completely on autopilot.",
    icon: <Users2 className="size-7" />,
    metric: {
      value: "24/7",
      label: "Lead Engagement",
      colorClass: "text-indigo-700 bg-indigo-50 border-indigo-200", // Switched to indigo to match portal styling
      icon: <ShieldCheck className="size-4" />
    }
  }
];

// The words that will cycle in the header
const painPoints = ["friction","delays", "trust"];

export default function BusinessChallenges() {
  const [wordIndex, setWordIndex] = useState(0);

  // Cycle through the words every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % painPoints.length);
    }, 2500);
    return () => clearInterval(interval);
  },[]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, 
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      } 
    },
  };

  return (
    <section id="solutions" className="py-16 md:py-24 overflow-visible bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MATCHED HEADER SECTION */}
        <div className="header-section-div text-center mb-10 md:mb-16">
          <h1 className="section-badge">Business Challenges</h1>
          <h2 className="section-header">
            Stop losing jobs to{" "}
            <span className="inline-flex relative justify-center text-muted-foreground/50">
              <AnimatePresence mode="wait">
                <motion.span
                  key={painPoints[wordIndex]}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="inline-block line-through decoration-slate-500/40 decoration-4"
                >
                  {painPoints[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            . <br className="hidden md:block" />
            <span>Start closing with <span className="text-primary">clarity</span>.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Our specialized AI tools are engineered specifically to remove operational bottlenecks and accelerate your sales pipeline.
          </p>
        </div>
        
        {/* Animated List */}
        <motion.div 
          className="flex flex-col gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {challenges.map((item) => (
            <motion.div key={item.id} variants={cardVariants}>
              <Card className="overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/40 rounded-3xl bg-white hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    
                    {/* Left Panel: Title & Metric */}
                    <div className="p-8 md:p-10 md:w-2/5 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center relative overflow-hidden">
                      {/* Subtle background decoration */}
                      <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                      
                      <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-primary mb-6">
                          {item.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 leading-snug mb-6">
                          {item.title}
                        </h3>
                        
                        {/* Metric Pill */}
                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-sm ${item.metric.colorClass}`}>
                          {item.metric.icon}
                          <span className="font-bold tracking-wide">{item.metric.value}</span>
                          <span className="text-sm font-medium opacity-80 border-l border-current pl-2.5">
                            {item.metric.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Challenge vs Solution */}
                    <div className="p-8 md:p-10 md:w-3/5 flex flex-col justify-center gap-8">
                      
                      {/* The Challenge */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-slate-400">
                          <XCircle className="w-5 h-5 text-rose-400" /> 
                          The Bottleneck
                        </div>
                        <p className="text-slate-600 leading-relaxed md:text-lg">
                          {item.challenge}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="w-full h-px bg-gradient-to-r from-slate-100 via-slate-200 to-transparent" />

                      {/* The Solution */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-primary">
                          <CheckCircle2 className="w-5 h-5 text-primary" /> 
                          The AI Solution
                        </div>
                        <p className="text-slate-900 font-medium leading-relaxed md:text-lg">
                          {item.solution}
                        </p>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}