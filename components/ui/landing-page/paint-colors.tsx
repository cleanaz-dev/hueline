"use client"
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { PaintBucket, Layers, Zap } from 'lucide-react';

const BM_COLORS = [
  { name: 'Hale Navy',      code: 'HC-154',   hex: '#434C56' },
  { name: 'Aegean Teal',    code: '2136-40',  hex: '#71898B' },
  { name: 'Chantilly Lace', code: 'OC-65',    hex: '#F5F5EF' },
];

const RAL_COLORS = [
  { name: 'Traffic Red',    code: 'RAL 3020', hex: '#BB1E10' },
  { name: 'Ultramarine',    code: 'RAL 5002', hex: '#00387B' },
  { name: 'Light Ivory',    code: 'RAL 1015', hex: '#E6D2B5' },
];

const FEATURES =[
  {
    title: 'Native Benjamin Moore',
    desc: 'Direct integration with Benjamin Moore libraries. Access entire collections with guaranteed color accuracy.',
    icon: <PaintBucket className="w-6 h-6 text-primary flex-shrink-0" />
  },
  {
    title: 'Complete European RAL',
    desc: 'Industry-standard RAL Classic palette built-in. Perfect for matching powder-coats and industrial finishes.',
    icon: <Layers className="w-6 h-6 text-primary flex-shrink-0" />
  },
  {
    title: 'One-click Mockups',
    desc: 'Apply true-to-life colors instantly. Export client-ready, color-accurate mockups with a single click.',
    icon: <Zap className="w-6 h-6 text-primary flex-shrink-0" />
  }
];

type CardCustomProps = {
  index: number;
  total: number;
  offset: number;
};

export default function LandingColorsFeature() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, rotate: -10 },
    visible: (custom: CardCustomProps) => {
      const middle = (custom.total - 1) / 2;
      const rotate = (custom.index - middle) * 15; // 15 degrees spread per card
      return {
        opacity: 1,
        y: 0,
        rotate: rotate + custom.offset,
        transition: {
          type: 'spring' as const,
          damping: 20,
          stiffness: 100,
        },
      };
    },
  };

  const SwatchRow = ({
    colors,
    label,
    offset,
    delay = 0,
  }: {
    colors: typeof BM_COLORS;
    label: string;
    offset: number;
    delay?: number;
  }) => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delayChildren: delay }}
      className="flex justify-center items-end h-48 sm:h-56"
    >
      {colors.map((color, idx) => (
        <motion.div
          key={color.code}
          custom={{ index: idx, total: colors.length, offset }}
          variants={cardVariants}
          whileHover={{
            y: -20,
            scale: 1.05,
            zIndex: 40,
            transition: { type: 'spring' as const, stiffness: 300 },
          }}
          whileTap={{
            y: -20,
            scale: 1.05,
            zIndex: 40,
            transition: { type: 'spring' as const, stiffness: 300 },
          }}
          // Adjusted negative margin on mobile so text isn't fully obscured by overlaps
          className={`relative origin-bottom w-24 h-40 lg:w-28 lg:h-44 bg-card rounded-xl shadow-xl border border-border overflow-hidden flex flex-col cursor-pointer transition-shadow hover:shadow-2xl ${
            idx !== 0 ? '-ml-8 sm:-ml-12 lg:-ml-14' : ''
          }`}
        >
          <div className="w-full flex-grow" style={{ backgroundColor: color.hex }} />
          {/* Added shrink-0 and reduced mobile padding to prevent the text area from collapsing out of view */}
          <div className="shrink-0 p-2 sm:p-3 bg-card h-16 sm:h-20 flex flex-col justify-center border-t border-border/50">
            {/* Hidden on mobile to make room for the actual color names */}
            <span className="hidden sm:block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
              {label}
            </span>
            <span className="text-[11px] sm:text-xs lg:text-sm font-extrabold text-foreground leading-tight truncate">
              {color.name}
            </span>
            <span className="text-[10px] lg:text-xs font-medium text-muted-foreground mt-0.5">
              {color.code}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <section className="px-4 py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Centered Header */}
        <div className="header-section-div text-center mb-20">
            <h1 className="section-badge">
            Industry Standards
          </h1>
           <h2 className="section-header">
            Flawless <span className="text-primary">color </span>accuracy, right out of the box.
          </h2>
        </div>

        {/* Main Grid: Left Features, Right Swatch Fans */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">

          {/* Left Column: Feature Blocks */}
          <motion.ul
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 space-y-8 lg:pr-8"
          >
            {FEATURES.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-start gap-5"
              >
                <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          {/* Right Column: Fanning Swatch Decks */}
          <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center gap-8 lg:gap-12 pt-8 lg:pt-0">
            {/* Subtle background glow to anchor the cards */}
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[80px] -z-10 w-3/4 h-3/4 m-auto" />
            
            <SwatchRow colors={BM_COLORS} label="Benjamin Moore" offset={-6} delay={0} />
            <SwatchRow colors={RAL_COLORS} label="RAL Classic" offset={6} delay={0.2} />
          </div>

        </div>

      </div>
    </section>
  );
}