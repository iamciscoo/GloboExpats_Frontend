import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Metadata } from 'next'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-blue-100">Last updated: March 20, 2024</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto bg-white shadow-sm">
          <CardContent className="p-8 prose prose-neutral max-w-none">
            <p className="text-lg text-neutral-600 mb-8">
              Welcome to Globoexpat. These terms of service ("Terms") govern your use of our
              website and services. By accessing or using Globoexpat, you agree to be bound by
              these Terms.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using this service, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to abide by the above, please do not
              use this service.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily access Globoexpat for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title, and
              under this license you may not:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on Globoexpat</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate,
              complete, and current at all times. You are responsible for safeguarding the password
              and for all activities that occur under your account.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              4. Marketplace Terms
            </h2>
            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">4.1 For Buyers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All purchases are subject to product availability</li>
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to refuse any order</li>
              <li>Buyers must comply with all applicable laws regarding their purchases</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">4.2 For Sellers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sellers must provide accurate product descriptions and images</li>
              <li>All products must be legal in both origin and destination countries</li>
              <li>Sellers are responsible for shipping and customs compliance</li>
              <li>Globoexpat charges a commission on successful sales</li>
            </ul>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              5. Prohibited Uses
            </h2>
            <p>You may not use our service:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>
                To violate any international, federal, provincial, or state regulations, rules,
                laws, or local ordinances
              </li>
              <li>
                To infringe upon or violate our intellectual property rights or the intellectual
                property rights of others
              </li>
              <li>
                To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or
                discriminate
              </li>
              <li>To submit false or misleading information</li>
            </ul>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">6. Payment Terms</h2>
            <p>
              All payments are processed through secure third-party payment processors. Globoexpat
              does not store credit card details. Payment methods accepted include major credit
              cards and digital payment platforms.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              7. Shipping and Delivery
            </h2>
            <p>
              Shipping times and costs vary by seller and destination. Sellers are responsible for
              providing accurate shipping information. Globoexpat is not responsible for delays
              caused by customs or shipping carriers.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              8. Returns and Refunds
            </h2>
            <p>
              Each seller sets their own return policy. Buyers should review the seller's return
              policy before making a purchase. Globoexpat provides dispute resolution services for
              unresolved issues.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              9. Intellectual Property
            </h2>
            <p>
              The service and its original content, features, and functionality are and will remain
              the exclusive property of Globoexpat and its licensors. The service is protected by
              copyright, trademark, and other laws.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">10. Privacy</h2>
            <p>
              Your use of Globoexpat is also governed by our Privacy Policy. Please review our
              <Link href="/privacy" className="text-brand-primary hover:underline mx-1">
                Privacy Policy
              </Link>
              which also governs the site and informs users of our data collection practices.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">11. Disclaimer</h2>
            <p>
              The information on Globoexpat is provided on an "as is" basis. To the fullest extent
              permitted by law, Globoexpat:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>
                Excludes all representations and warranties relating to this website and its
                contents
              </li>
              <li>
                Excludes all liability for damages arising out of or in connection with your use of
                this website
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              12. Limitation of Liability
            </h2>
            <p>
              In no event shall Globoexpat, nor its directors, employees, partners, agents,
              suppliers, or affiliates, be liable for any indirect, incidental, special,
              consequential, or punitive damages, including without limitation, loss of profits,
              data, use, goodwill, or other intangible losses.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              13. Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless Globoexpat and its licensee and
              licensors, and their employees, contractors, agents, officers and directors, from and
              against any and all claims, damages, obligations, losses, liabilities, costs or debt,
              and expenses (including but not limited to attorney's fees).
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">14. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the service immediately,
              without prior notice or liability, under our sole discretion, for any reason
              whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">15. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United
              Arab Emirates, without regard to its conflict of law provisions. Our failure to
              enforce any right or provision of these Terms will not be considered a waiver of those
              rights.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              16. Changes to Terms
            </h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any
              time. If a revision is material, we will provide at least 30 days notice prior to any
              new terms taking effect.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              17. Contact Information
            </h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <div className="bg-neutral-50 p-4 rounded-lg mt-4">
              <p className="font-medium">Globoexpat Legal Department</p>
              <p>Email: legal@globoexpat.com</p>
              <p>Phone: +971 4 123 4567</p>
              <p>Address: Dubai Internet City, Building 3, Office 301, Dubai, UAE</p>
            </div>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <p className="text-sm text-neutral-600">
                <strong>Note:</strong> This is a sample Terms of Service for demonstration purposes.
                For a production website, please consult with a legal professional to ensure
                compliance with all applicable laws and regulations in your jurisdictions of
                operation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Terms of Service - Globoexpat',
  description: 'Read the terms and conditions for using the Globoexpat marketplace.',
}
