import React from 'react'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'
import Image from 'next/image'
import MascotImage from '@/public/images/mascot.png'
import Link from 'next/link'


export default function CTASection() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto text-center flex items-center flex-col space-y-8">
        <h2 className="section-badge ">
          Ready to Transform Your Business
        </h2>
        
        <p className="text-4xl   max-w-2xl mx-auto text-balance">
          Book Your Free Consulation Today!
        </p>

        <Image
          src={MascotImage}
          alt="mascot"
          className='object-cover h-64 w-52'
        />
        <Button 
          size="xl" 
          className=""
          asChild
        >
          <Link href="/booking">
          <Phone className="mr-2 h-5 w-5" />
          Book a Call with Paul
          </Link>
        </Button>
      </div>
    </section>
  )
}