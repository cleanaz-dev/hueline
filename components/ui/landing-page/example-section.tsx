"use client"
import React from 'react'
import Image, { StaticImageData }from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AudioPlayer from './audio-player'
import ConsultantAgentImage from '@/public/images/consultant-agent.png'
import ColorMatchingAgentImage from '@/public/images/color-matching-agent.png'
import BookingAgentImage from '@/public/images/booking-agent.png'



interface Example {
id: number;
image: StaticImageData;
title: string;
description: string;
badge: string;
audioUrl: string;
}

const examples: Example[] = [
{
  id: 1,
  title: "Paint Consultation Call",
  description: "Customer calls asking about painting their living room. AI analyzes photos they send, suggests color schemes, and provides an instant estimate.",
  badge: "Inbound",
  image: ConsultantAgentImage,
  audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
},
{
  id: 2,
  title: "Visual Color Matching",
  description: "AI shows customers exactly how different paint colors look on their actual walls using their photos. Closes deals on the spot.",
  badge: "Photo Analysis",
  image: ColorMatchingAgentImage,
  audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
},
{
  id: 3,
  title: "Follow-Up & Booking",
  description: "AI calls back interested customers, sends visual mockups via text, and books appointments directly into your calendar.",
  badge: "Outbound",
  image: BookingAgentImage,
  audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
}
]

export default function ExamplesSection() {
return (
  <section id="examples" className="px-4">
   <div className="max-w-xl md:max-w-4xl mx-auto">
      <div className='header-section-div'>
        <h1 className='section-badge'>Real Examples</h1>
        <p className='section-header'>Hear how HueLine handles actual painting consultations</p>
      </div>

      <div className="space-y-8 py-8">
        {examples.map((example) => (
          <Card key={example.id} className="overflow-hidden p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image - Left on desktop, Top on mobile */}
              <div className="flex justify-center md:justify-start">
                <div className="relative w-72 h-48 md:w-80 md:h-60 flex-shrink-0">
                  <Image
                    src={example.image}
                    alt={example.title}
                    fill
                    className="object-cover rounded-lg bg-sky-200"
                    sizes="(max-width: 768px) 256px, 320px"
                    unoptimized
                  />
                </div>
              </div>

              {/* Content - Right on desktop, Bottom on mobile */}
              <div className="flex flex-col justify-center flex-1 text-center md:text-left">
                <div className="space-y-4">
                  <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                    {example.badge}
                  </Badge>
                  
                  <h3 className="text-2xl md:text-3xl font-bold">
                    {example.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                    {example.description}
                  </p>

                  {/* Audio Playback */}
                  {/* <AudioPlayer 
                    url={example.audioUrl} 
                    title={``}
                  /> */}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </section>
)
}