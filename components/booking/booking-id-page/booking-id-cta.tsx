import { Button } from '@/components/ui/button'
import { ChevronRight, PaintBucket, Palette, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import MascotImage from "@/public/images/mascot-new.png";



export default function BookindgIdCTA() {
  return (
     <section>
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-2xl shadow-sm border border-primary/10  py-8 px-4 text-center">
              <h2 className="text-2xl font-bold mb-4 text-balance">
                Want This AI Agent for Your Painting Business?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Generate instant design mockups, paint color recommendations,
                and professional reports that close more jobs. Let AI handle
                consultations while you focus on painting.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8 md:text-sm">
                <div className="bg-background/60 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center justify-center mb-2">
                    <PaintBucket className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium">AI Design Mockups</p>
                  <p className="text-muted-foreground text-sm md:text-xs">
                    Show clients exactly how their space will look
                  </p>
                </div>
                <div className="bg-background/60 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center justify-center mb-2">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium">Smart Color Alternatives</p>
                  <p className="text-muted-foreground text-sm md:text-xs">
                    Perfect paint colors for every project
                  </p>
                </div>
                <div className="bg-background/60 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center justify-center mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium">24/7 Lead Capture</p>
                  <p className="text-muted-foreground text-sm md:text-xs">
                    Never miss a potential customer again
                  </p>
                </div>
              </div>
              <Image
                src={MascotImage}
                alt="hueline-mascot"
                className="object-contain size-32 mx-auto mb-6"
                priority
              />
              <Button
                size="lg"
                className="group inline-flex items-center justify-center bg-primary hover:bg-secondary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/booking">
                  Get Hue-Line AI for Your Business
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                🚀 Limited time: Early adopter pricing available
              </p>
            </div>
          </section>
  )
}
