'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function HeroCarousel() {
  return (
    <section className="mb-4 sm:mb-6 mx-4 sm:mx-6 lg:mx-0 lg:pr-8">
      <div className="relative h-[400px] sm:h-[450px] lg:h-[500px] text-white overflow-hidden rounded-2xl shadow-xl">
        {/* Background Image */}
        <Image
          src="/assets/images/heroes/home-bottom-hero.jpeg"
          alt="Storage boxes for expat items"
          fill
          className="object-cover z-0"
          loading="eager"
          priority
        />

        {/* Stronger Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-800/70 to-slate-900/50 z-10" />

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-8 relative z-20 flex flex-col items-start justify-center h-full">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-5 leading-tight drop-shadow-lg">
              Got Items Taking Up Space?
            </h1>

            <p className="text-sm sm:text-lg lg:text-xl text-white/95 mb-4 sm:mb-6 leading-relaxed drop-shadow-md">
              Moving, relocating, or just need to declutter? Connect with fellow expats who need
              exactly what you&apos;re ready to let go. Turn your unused items into someone
              else&apos;s perfect find.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
              <Link href="/sell" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-brand-secondary hover:bg-brand-secondary/90 text-neutral-900 font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 h-12 sm:h-auto rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg w-full"
                >
                  Create Listing
                </Button>
              </Link>

              <Link href="/browse" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-white/20 border-2 border-white hover:bg-white/30 hover:border-white text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 h-12 sm:h-auto rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-sm w-full"
                >
                  Browse Available Items
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
