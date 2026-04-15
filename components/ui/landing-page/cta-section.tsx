import React from 'react'
import { Button } from '@/components/ui/button'
import { Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-16 px-4 md:py-24 bg-transparent">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        
        {/* Eyebrow/Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide uppercase mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          Limited Founder Spots Available
        </div>
        
        {/* Main Typography */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl text-balance leading-[1.1]">
          Stop Losing Jobs to <br className="hidden md:block" />
          <span className="text-primary">
            Slow Mockups.
          </span>
        </h2>
        
        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto text-balance leading-relaxed">
          Generate stunning 4K color mockups in seconds, impress clients instantly, and close jobs before your competitors even return the call.
        </p>

        {/* Action Area */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
          <Button 
            size="xl" 
            className="w-full sm:w-auto font-bold text-lg h-14 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20"
            asChild
          >
            <Link href="/booking">
              <Phone className="mr-2 h-5 w-5" />
              Book Your Demo
            </Link>
          </Button>
          
          {/* Secondary Text Action */}
          <div className="text-sm text-slate-500 font-medium">
            Or experience the AI live: <br className="sm:hidden" />
            <a 
              href="tel:4374475892" 
              className="text-primary hover:opacity-80 transition-opacity inline-flex items-center mt-1 sm:mt-0 sm:ml-1 group font-bold"
            >
              Call (437) 447-5892
              <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}