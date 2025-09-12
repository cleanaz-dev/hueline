import React from 'react'
import Image from 'next/image'
import heroImage from '@/public/images/logo1.png'



export default function FooterSection() {
  return (
    <footer className="bg-card">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Logo and Company */}
          <div className="flex items-center gap-2">
            <Image
              src={heroImage}
              alt="logo"
              height={40}
              width={40}
              className="object-contain"
            />
            <span className="font-bold text-xl italic">HueLine</span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
            <a href="#solutions" className="hover:text-accent transition-colors">
              Solutions
            </a>
            <a href="#examples" className="hover:text-accent transition-colors">
              Examples
            </a>
            <a href="#contact" className="hover:text-accent transition-colors">
              Contact
            </a>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HueLine. All rights reserved.
        </div>
      </div>
    </footer>
  )
}