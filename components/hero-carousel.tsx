'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HeroCarousel() {
  return (
    <section className="mb-8 mx-4 sm:mx-6 lg:mx-8">
      <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] text-white overflow-hidden rounded-2xl shadow-xl">
        {/* Background Image */}
        <img
          src="/assets/images/heroes/home-bottom-hero.jpeg"
          alt="Storage boxes for expat items"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          loading="eager"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-800/50 to-transparent z-10" />

        {/* Content */}
        <div className="container mx-auto px-6 sm:px-8 relative z-20 flex flex-col items-start justify-center h-full">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Got Items Taking Up Space?
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-neutral-200 mb-6 sm:mb-8 leading-relaxed">
              Moving, relocating, or just need to declutter? Connect with fellow expats who need exactly what you're ready to let go. Turn your unused items into someone else's perfect find.
            </p>

            <Link href="/browse">
              <Button
                size="lg"
                className="bg-transparent border-2 border-white/80 hover:bg-white/10 hover:border-white text-white font-semibold text-lg px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                Browse Available Items
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
