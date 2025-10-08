import React from "react";
import Image, { StaticImageData } from "next/image";
import CreateMoreTimeImage from "@/public/images/create-more-time.png";
import EasilyIntegrateImage from "@/public/images/easily-intergrate.png";
import TwentyFourSevenImage from "@/public/images/24-7.png"
import OwnItImage from "@/public/images/own-it.png"


interface Feature {
 id: number;
 title: string;
 description: string;
 image: StaticImageData;
}

const features: Feature[] = [
 {
   id: 1,
   title: "Handle More Customers",
   description:
     "Your AI takes calls while you're on job sites. Never lose a customer because you were busy",
   image: CreateMoreTimeImage,
 },
 {
   id: 2,
   title: "Easy Setup",
   description:
     "Give us your number, we handle the rest. Your AI is answering calls 24 hours a day.",
   image: EasilyIntegrateImage,
 },
 {
   id: 3,
   title: "You Control Everything",
   description:
     "Set your prices, availability, and what jobs you take. The AI follows your rules exactly.",
   image: OwnItImage,
 },
 {
   id: 4,
   title: "24/7 Instant Access",
   description:
     "Customers send photos, get instant mockups and estimates. Close deals even when you're sleeping.",
   image: TwentyFourSevenImage,
 },
];

export default function WYGSection() {
 return (
   <section id="wyg" className=" px-4">
     <div className="max-w-2xl lg:max-w-4xl mx-auto">
       <div className="header-section-div">
         <div className="section-badge">What You Get</div>
         <h1 className="section-header">Everything you need</h1>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-8">
         {features.map((feature) => (
           <div key={feature.id} className="flex flex-col">
             <div className="flex flex-col items-center bg-card p-8 rounded-lg border">
               <Image
                 src={feature.image}
                 alt={feature.title}
                 className="w-64 h-56 rounded-lg mb-6"
               />
               <div className="text-center">
                 <h3 className="text-2xl font-bold mb-4 ">
                   {feature.title}
                 </h3>
                 <p className="text-muted-foreground">{feature.description}</p>
               </div>
             </div>
           </div>
         ))}
       </div>
     </div>
   </section>
 );
}