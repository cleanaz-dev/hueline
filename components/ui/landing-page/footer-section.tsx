import React from 'react'
import Image from 'next/image'
import Logo from '@/public/images/logo-2--increased-brightness.png'



export default function FooterSection() {
  return (
    <footer className="bg-card">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Logo and Company */}
          <div className="flex items-center gap-2">
            <Image
              src={Logo}
              alt="logo"
              height={100}
              width={100}
              className="object-contain"
            />
           
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
            <a href="#solutions" className="hover:text-primary transition-colors">
              Solutions
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#roi" className="hover:text-primary transition-colors">
             ROI
            </a>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Hue-Line. All rights reserved.
        </div>
      </div>
    </footer>
  )
}