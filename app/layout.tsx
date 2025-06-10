import type React from "react"
import type { Metadata } from "next"
import { Inter, Lexend } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Breadcrumb from "@/components/breadcrumb"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const lexend = Lexend({ 
  subsets: ["latin"],
  variable: '--font-lexend',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: "GlobalExpat - Premium Marketplace for Expats",
  description: "Connect with verified sellers worldwide. Buy and sell premium items in the global expat community.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="font-sans">
        <Header />
        <Breadcrumb />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
