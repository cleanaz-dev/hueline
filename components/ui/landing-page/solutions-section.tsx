import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image, { StaticImageData } from 'next/image'
import PhotoAnalysisImage from '@/public/images/photo_analysis.png'
import VisualMockUpImage from '@/public/images/visual_mockup.png'
import SmartEstimateImage from '@/public/images/smart_estimate.png'


interface Solution {
 id: number;
 image: StaticImageData;
 title: string;
 description: string;
}

const solutions: Solution[] = [
 {
   id: 1,
   title: "Photo Analysis Calls",
   description: "Customers send photos of rooms during calls. Your AI analyzes spaces, suggests paint colors, and provides professional estimates instantly.",
   image: VisualMockUpImage
 },
 {
   id: 2,
   title: "Visual Mockups",
   description: "AI creates realistic before/after images showing different paint colors on customer walls. Close more deals with instant visual proof.",
   image: PhotoAnalysisImage
 },
 {
   id: 3,
   title: "Smart Estimates",
   description: "Automated quote generation based on room dimensions and paint requirements. Professional estimates delivered while customers are still on the phone.",
   image: SmartEstimateImage
 }
]

export default function SolutionSection() {
 return (
   <section id="solutions" className="px-4 ">
     <div className="max-w-6xl mx-auto">
       <div className='header-section-div'>
       <h1 className='section-badge'>How It Works</h1>
       <p className='section-header'>Turn every call into a visual paint consultation</p>
       </div>
       <div className="grid grid-cols-1 xl:grid-cols-3 py-8 gap-8 max-w-xl xl:max-w-max mx-auto">
         {solutions.map((solution: Solution) => (
           <Card 
             key={solution.id}
             className="md:max-w-2xl lg:max-w-none mx-auto w-full overflow-hidden rounded-3xl bg-white"
           >
             <div className="relative w-full h-48">
               <Image
                 src={solution.image}
                 alt={solution.title}
                 fill
                 className="object-contain shadow-primary"
                 sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                 unoptimized
               />
             </div>
             <CardHeader>
               <CardTitle className="text-2xl text-primary">
                 {solution.title}
               </CardTitle>
             </CardHeader>
             <CardContent>
               <CardDescription className="text-base  text-muted-foreground">
                 {solution.description}
               </CardDescription>
             </CardContent>
           </Card>
         ))}
       </div>
     </div>
   </section>
 )
}