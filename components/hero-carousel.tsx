"use client"

import { Button } from "@/components/ui/button"
import { TRUST_INDICATORS } from "@/lib/constants"
import Link from "next/link"

export default function HeroCarousel() {
  return (
    <section className="mb-8 relative h-[400px] sm:h-[500px] lg:h-[600px] text-white overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute top-1/2 left-1/2 w-full h-full object-cover transform -translate-x-1/2 -translate-y-1/2 z-0"
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero-poster.jpg"
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-cyan-500/40 z-10" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-20 flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white mb-4 sm:mb-6">
          Global Expat Premium Marketplace
        </h1>

        <p className="text-md sm:text-lg lg:text-xl text-neutral-200 mb-6 sm:mb-8 max-w-3xl">
          Connect with verified sellers worldwide. Buy and sell premium items in the global expat community.
        </p>

        <Link href="/browse">
          <Button size="lg" className="bg-brand-secondary hover:bg-amber-500 text-brand-primary font-bold text-lg px-8 py-6 rounded-full transition-transform transform hover:scale-105">
            Start Exploring
          </Button>
        </Link>
      </div>
    </section>
  )
}
