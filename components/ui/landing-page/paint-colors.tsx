"use client"
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Palette, CheckCircle2 } from 'lucide-react';

// --- Landing Page Display Data ---
const BM_COLORS =[
  { name: 'Hale Navy', code: 'HC-154', hex: '#464E5A' },
  { name: 'Aegean Teal', code: '2136-40', hex: '#4F7276' },
  { name: 'Chantilly Lace', code: 'OC-65', hex: '#F5F7F2' },
];

const RAL_COLORS =[
  { name: 'Traffic Red', code: 'RAL 3020', hex: '#CC0605' },
  { name: 'Ultramarine', code: 'RAL 5002', hex: '#201370' },
  { name: 'Light Ivory', code: 'RAL 1015', hex: '#E6D9BD' },
];

// Define our custom props type for the variants
type CardCustomProps = {
  index: number;
  total: number;
  offset: number;
};

export default function LandingColorsFeature() {
  // Explicitly type as Variants for Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, rotate: 0 },
    visible: (custom: CardCustomProps) => {
      // Calculate rotation to make a "fan" shape
      const middle = (custom.total - 1) / 2;
      const rotate = (custom.index - middle) * 12; // 12 degrees spread
      
      return {
        opacity: 1,
        y: 0,
        rotate: rotate + custom.offset, // offset to tilt the whole deck slightly
        transition: {
          type: 'spring' as const, 
          damping: 20,
          stiffness: 100,
        },
      };
    },
  };

  return (
    <section className="w-full bg-background py-20 px-6 md:px-12 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Typography & Copy */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-primary text-sm font-semibold tracking-wide mb-6 border border-border">
              <Palette className="w-4 h-4" />
              Industry Standards
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              Flawless color accuracy, right out of the box.
            </h2>
            <p className="text-lg text-muted-foreground mt-4 leading-relaxed max-w-lg">
              Stop guessing hex codes. We've built in the exact color libraries you and your clients already use. Easily search, select, and specify paint for any room.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              'Native Benjamin Moore integration',
              'Complete European RAL classic palette',
              'One-click mockup generation',
            ].map((feature, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-3 text-foreground font-medium"
              >
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                {feature}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right Side: Fixed Layout with Flexbox */}
        <div className="w-full flex flex-col items-center justify-center gap-12 min-h-[500px] lg:min-h-[550px]">
          
          {/* Benjamin Moore Row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex justify-center gap-6 flex-wrap"
          >
            {BM_COLORS.map((color, idx) => (
              <motion.div
                key={color.code}
                custom={{ index: idx, total: BM_COLORS.length, offset: -4 }}
                variants={cardVariants}
                whileHover={{ 
                  y: -15, 
                  scale: 1.05, 
                  rotate: 0, 
                  zIndex: 30,
                  transition: { type: 'spring' as const, stiffness: 300 } 
                }}
                className="w-32 h-52 sm:w-36 sm:h-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden flex flex-col cursor-pointer transition-shadow hover:shadow-2xl"
              >
                <div 
                  className="w-full flex-grow" 
                  style={{ backgroundColor: color.hex }} 
                />
                <div className="p-3 bg-card h-16 sm:h-20 flex flex-col justify-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Benjamin Moore
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-foreground leading-tight mt-0.5 truncate">
                    {color.name}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                    {color.code}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* RAL Row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex justify-center gap-6 flex-wrap"
          >
            {RAL_COLORS.map((color, idx) => (
              <motion.div
                key={color.code}
                custom={{ index: idx, total: RAL_COLORS.length, offset: 4 }}
                variants={cardVariants}
                whileHover={{ 
                  y: -15, 
                  scale: 1.05, 
                  rotate: 0, 
                  zIndex: 30,
                  transition: { type: 'spring' as const, stiffness: 300 } 
                }}
                className="w-32 h-52 sm:w-36 sm:h-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden flex flex-col cursor-pointer transition-shadow hover:shadow-2xl"
              >
                <div 
                  className="w-full flex-grow" 
                  style={{ backgroundColor: color.hex }} 
                />
                <div className="p-3 bg-card h-16 sm:h-20 flex flex-col justify-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    RAL Classic
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-foreground leading-tight mt-0.5 truncate">
                    {color.name}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                    {color.code}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
        
      </div>
    </section>
  );
}