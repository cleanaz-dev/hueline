"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Logo from "@/public/images/logo-2--increased-brightness.png";
import { Button } from "../button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet";
import Link from "next/link";
import { Menu, Phone } from "lucide-react";
import { motion, Variants } from "framer-motion";

/* -------------------------------- data --------------------------------- */
const nav = [
  { id: 1, title: "Solutions", hash: "solutions" },
  { id: 2, title: "Features", hash: "features" },
  { id: 3, title: "ROI", hash: "roi" },
];

/* -------------------------------- component ---------------------------- */
export default function NavSection() {
  const [openMenu, setOpenMenu] = useState(false);
  const [pendingHash, setPendingHash] = useState<string | null>(null);

  /* 1.5 s after the sheet disappears, scroll to the stored hash */
  useEffect(() => {
    if (!openMenu && pendingHash) {
      const t = setTimeout(() => {
        const el = document.getElementById(pendingHash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        setPendingHash(null);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [openMenu, pendingHash]);

  /* mobile link handler */
  const handleNav = (hash: string) => {
    setPendingHash(hash);
    setOpenMenu(false);
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="backdrop-blur-lg">
      <nav className="relative z-20 flex items-center text-muted-foreground justify-between px-3 md:px-6 py-2 md:py-2 backdrop-blur-sm flex-shrink-0 bg-white/50">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="#hero">
          <Image
            src={Logo}
            alt="logo"
            height={100}
            width={100}
            className="object-contain"
            priority
          />
          </Link>
          {/* <span className="font-bold text-lg md:text-xl text-primary">
            Hue-Line
          </span> */}
        </div>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.hash}`}
              className="hover:text-primary transition-colors"
            >
              {n.title}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="items-center gap-2 hidden lg:flex">
          
          <Button size="sm" asChild>
            <Link href="/booking">Book a Call</Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
        
          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="top" className="bg-background pb-8">
              <SheetHeader className="text-center">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <motion.div
                className="flex flex-col items-center gap-6 mt-8"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                  },
                }}
              >
                {nav.map((n) => (
                  <motion.div key={n.id} variants={itemVars}>
                    <button
                      onClick={() => handleNav(n.hash)}
                      className="text-lg hover:text-primary duration-300 transition-colors"
                    >
                      {n.title}
                    </button>
                  </motion.div>
                ))}

                <motion.div variants={itemVars}>
                  <SheetClose asChild>
                    <Button asChild className="mt-4">
                      <Link href="/booking">
                        <Phone className="mr-2 size-4" />
                        Book a Call
                      </Link>
                    </Button>
                  </SheetClose>
                </motion.div>
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </section>
  );
}