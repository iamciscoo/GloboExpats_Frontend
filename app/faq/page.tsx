import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description:
    'Find answers to common questions about buying and selling on Globoexpats marketplace in Tanzania. Learn about payments, shipping, seller verification, and more.',
  keywords: [
    'globoexpats faq',
    'marketplace questions tanzania',
    'expat marketplace help',
    'how to sell on globoexpats',
    'buying guide tanzania',
  ],
}

const FAQS = [
  {
    question: 'What is Globoexpats?',
    answer:
      'Globoexpats is a marketplace designed for expatriates to buy and sell quality items within the community with added trust signals and verification.',
  },
  {
    question: 'How do I create an account?',
    answer:
      'Click on the Register button at the top-right, fill in your details, and verify your email address to get started.',
  },
  {
    question: 'Is there a fee to list items?',
    answer: 'Listing items is free. A small commission is charged only when your item sells.',
  },
  {
    question: 'How are payments processed?',
    answer:
      'Payments are processed securely using trusted payment providers. Funds are released to the seller after the buyer confirms receipt.',
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
