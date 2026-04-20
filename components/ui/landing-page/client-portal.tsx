"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Lock, Image as ImageIcon, Users, Check, Gem, Images } from "lucide-react";
// Ensure this path matches your project structure
import Stroke from "@/public/images/square-logo-brush.png";

const features = [
  {
    id: 0,
    title: "Branded & Secure Login",
    description:
      "Look like a premium agency. Your clients log into a personalized, white-labeled portal under your domain.",
    icon: Lock,
    listItems: [
      "PIN-protected access for clients",
      "Custom subdomain (yoursite.hue-line.com)",
      "Your logo, brand colors, and identity",
    ],
    // REPLACE WITH YOUR LOGIN/PIN SCREENSHOT
    image:
      "https://res.cloudinary.com/dmllgn0t7/image/upload/v1776272939/Generated_Image_April_15_2026_-_12_36PM.png",
    imageAlt: "White-label PIN login screen",
  },
  {
    id: 1,
    title: "4K/8K Mockup Generation",
    description:
      "Clients can easily explore new color options on the fly and export stunning, photorealistic renders.",
    icon: Gem,
    listItems: [
      "Export in crystal clear 4K & 8K",
      "Generate unlimited color variations",
      "Adjust lighting conditions instantly",
    ],
    // REPLACE WITH YOUR COLOR GENERATOR SCREENSHOT
    image:
      "https://res.cloudinary.com/dmllgn0t7/image/upload/v1776273328/hjsdfoer34erenrern.png",
    imageAlt: "4K Color Mockup Generator Interface",
  },
  {
    id: 2,
    title: "Image Comparison",
    description:
      "Eliminate the endless email chains. Clients can compare image options with partners and finalize decisions in one place.",
    icon: Images,
    listItems: [
      "Shareable project links for partners/spouses to compare images",
      "Built-in side-by-side image comparison & feedback system",
      "Track version history, image iterations and approvals",
    ],
    // REPLACE WITH YOUR IMAGE COMPARISON SCREENSHOT
    image:
      "https://res.cloudinary.com/dmllgn0t7/image/upload/v1776272897/replicate-prediction-p986gf6mn1rmw0cxj8dbgrvb3g.png",
    imageAlt: "Side-by-side image comparison and collaboration dashboard",
  },
];

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const handleManualClick = (index: number) => {
    setActiveTab(index);
    setIsAutoPlay(false);
  };

  useEffect(() => {
    if (!isAutoPlay || isPaused) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, isAutoPlay]);

  return (
    <section
      className="py-16 md:py-24 overflow-visible bg-transparent"
      id="client-portal"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="header-section-div text-center mb-10 md:mb-16">
          <h1 className="section-badge">White-Label Portal</h1>
          <h2 className="section-header">
            Close More Jobs with a{" "}
            <span className="text-primary">Professional</span> Presentation
          </h2>
       
        </div>

        {/* --- MOBILE ONLY: TOP TAB BAR --- */}
        <div className="lg:hidden grid grid-cols-3 gap-2 mb-6 border-b border-gray-100">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => handleManualClick(index)}
              className={`text-sm font-bold pb-2 px-1 transition-colors relative ${
                activeTab === index
                  ? "text-indigo-500 border-b-2 border-indigo-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {feature.title}
            </button>
          ))}
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-stretch"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* LEFT COLUMN: DESKTOP ONLY Controller */}
          <div className="hidden lg:flex space-y-8 order-2 lg:order-1 flex-col justify-center">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  onClick={() => handleManualClick(index)}
                  className={`
                    group relative p-5 rounded-2xl transition-all duration-300 cursor-pointer border
                    ${
                      activeTab === index
                        ? "bg-slate-50 border-indigo-200 shadow-sm"
                        : "bg-white border-transparent hover:bg-slate-50"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                      flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                      ${activeTab === index ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:text-primary"}
                    `}
                    >
                      <feature.icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-2  ${activeTab === index ? "text-slate-900 " : "text-slate-500"}`}
                      >
                        {feature.title}
                      </h3>
                      <div
                        className={`
                        grid transition-all duration-500 ease-in-out overflow-hidden
                        ${activeTab === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                      `}
                      >
                        <div className="min-h-0">
                          <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                            {feature.description}
                          </p>
                          <ul className="space-y-2">
                            {feature.listItems.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-center text-sm text-slate-700 font-medium"
                              >
                                <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Image Container */}
          <div className="order-1 lg:order-2 flex flex-col items-center h-full">
            {/* TOP STROKE */}
            <div className="hidden lg:block relative w-48 h-16 opacity-30 grayscale mb-6 flex-shrink-0">
              <Image
                src={Stroke}
                alt="brush decoration top"
                fill
                className="object-contain rotate-180 opacity-25"
              />
            </div>

            {/* MAIN IMAGE CONTAINER */}
            <div className="relative w-full rounded-3xl shadow-2xl bg-white flex-1 min-h-[300px] aspect-[16/10] lg:aspect-auto border border-slate-100">
              {/* IMAGE SWITCHER LOGIC */}
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`absolute inset-0 transition-opacity duration-700 overflow-hidden rounded-3xl ${
                    activeTab === index ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent z-20 pointer-events-none rounded-3xl" />
            </div>

            {/* BOTTOM STROKE */}
            <div className="hidden lg:block relative w-48 h-16 opacity-30 grayscale mt-6 flex-shrink-0">
              <Image
                src={Stroke}
                alt="brush decoration bottom"
                fill
                className="object-contain opacity-25"
              />
            </div>
          </div>
        </div>

        {/* --- MOBILE ONLY: BOTTOM INFO CARD --- */}
        <div className="lg:hidden mt-8 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
              {React.createElement(features[activeTab].icon, {
                className: "w-5 h-5",
              })}
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {features[activeTab].title}
            </h3>
          </div>

          <p className="text-slate-600 mb-6 leading-relaxed">
            {features[activeTab].description}
          </p>

          <ul className="space-y-3">
            {features[activeTab].listItems.map((item, i) => (
              <li
                key={i}
                className="flex items-center text-sm text-slate-700 font-medium"
              >
                <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
