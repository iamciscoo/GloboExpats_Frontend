'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-[#1E3A8A] text-neutral-200">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-3">
              Globo<span className="text-[#FF9800]">expat</span>
            </h3>
            <p className="text-sm leading-relaxed text-neutral-300">
              The marketplace for the expat community. Buy and sell quality goods with verified
              professionals.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Popular Categories
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              {CATEGORIES.slice(0, 4).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/browse?category=${cat.slug}`}
                    className="text-neutral-300 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-neutral-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-[#FF9800] flex-shrink-0" />
                <span className="text-neutral-300">123 Ocean Road, Dar es Salaam, Tanzania</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-[#FF9800] flex-shrink-0" />
                <span className="text-neutral-300">+255 754 123 456</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-[#FF9800] flex-shrink-0" />
                <span className="text-neutral-300 break-all">info@globoexpat.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
          <div className="flex flex-col gap-4 text-sm">
            {/* Social and Links */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-4 order-2 sm:order-1">
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </div>
              <div className="flex gap-6 text-neutral-300 order-1 sm:order-2">
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
              </div>
            </div>
            {/* Copyright */}
            <p className="text-neutral-400 text-center text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} Globoexpat Tanzania. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
