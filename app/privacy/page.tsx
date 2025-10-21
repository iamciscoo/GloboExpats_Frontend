import { Card, CardContent } from '@/components/ui/card'
import type { Metadata } from 'next'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-blue-100">Last updated: March 20, 2024</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto bg-white shadow-sm">
          <CardContent className="p-8 prose prose-neutral max-w-none">
            <p className="text-lg text-neutral-600 mb-8">
              At Globoexpats, we take your privacy seriously. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our marketplace.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              1. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">
              1.1 Personal Information
            </h3>
            <p>We collect information you provide directly to us, such as:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Name and contact information (email, phone number, address)</li>
              <li>Account credentials (username and password)</li>
              <li>Payment information (processed by secure third-party providers)</li>
              <li>Profile information (bio, photo, preferences)</li>
              <li>Communications between buyers and sellers</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">
              1.2 Automatically Collected Information
            </h3>
            <p>When you use Globoexpats, we automatically collect:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Location information (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              2. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send transaction notifications</li>
              <li>Send administrative information and updates</li>
              <li>Respond to comments, questions, and customer service requests</li>
              <li>Send marketing and promotional communications (with your consent)</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              3. Information Sharing and Disclosure
            </h2>
            <p>We share your information in the following circumstances:</p>

            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">
              3.1 With Other Users
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Buyers and sellers can see each other's public profiles</li>
              <li>Transaction parties receive necessary contact information</li>
              <li>Reviews and ratings are publicly visible</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">
              3.2 With Service Providers
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payment processors for secure transactions</li>
              <li>Shipping and logistics partners</li>
              <li>Analytics and hosting services</li>
              <li>Customer support tools</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">
              3.3 Legal Requirements
            </h3>
            <p>
              We may disclose information if required by law, court order, or government request, or
              if we believe disclosure is necessary to protect rights, property, or safety.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. These include:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              5. Your Rights and Choices
            </h2>

            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">
              5.1 Access and Update
            </h3>
            <p>
              You can access and update your personal information through your account settings or
              by contacting us.
            </p>

            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">5.2 Delete Account</h3>
            <p>
              You can request deletion of your account and personal information, subject to certain
              legal requirements and legitimate business purposes.
            </p>

            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">
              5.3 Marketing Communications
            </h3>
            <p>
              You can opt out of marketing emails by clicking "unsubscribe" or updating your
              communication preferences in account settings.
            </p>

            <h3 className="text-xl font-semibold text-neutral-800 mt-6 mb-3">5.4 Cookies</h3>
            <p>
              Most browsers allow you to control cookies through settings. Note that disabling
              cookies may limit your use of certain features.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              6. International Data Transfers
            </h2>
            <p>
              As a global marketplace, we may transfer your information to countries other than
              where you reside. We ensure appropriate safeguards are in place for such transfers in
              compliance with applicable data protection laws.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              7. Children's Privacy
            </h2>
            <p>
              Globoexpats is not intended for users under 18 years of age. We do not knowingly
              collect personal information from children under 18. If we learn we have collected
              such information, we will delete it promptly.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">8. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide our services and comply
              with legal obligations. When no longer needed, we securely delete or anonymize your
              data.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              9. Third-Party Links
            </h2>
            <p>
              Our platform may contain links to third-party websites. We are not responsible for the
              privacy practices of these external sites. We encourage you to read their privacy
              policies.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">11. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices,
              please contact us:
            </p>
            <div className="bg-neutral-50 p-4 rounded-lg mt-4">
              <p className="font-medium">Globoexpats Privacy Team</p>
              <p>Email: privacy@globoexpats.com</p>
              <p>Phone: +971 4 123 4567</p>
              <p>Address: Dubai Internet City, Building 3, Office 301, Dubai, UAE</p>
            </div>

            <h2 className="text-2xl font-semibold text-neutral-800 mt-8 mb-4">
              12. Data Protection Officer
            </h2>
            <p>
              We have appointed a Data Protection Officer (DPO) to oversee our data protection
              strategy and ensure compliance with data protection laws. You can contact our DPO at:
            </p>
            <p className="mt-2">Email: dpo@globalexpat.com</p>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <p className="text-sm text-neutral-600">
                <strong>Note:</strong> This is a sample Privacy Policy for demonstration purposes.
                For a production website, please consult with a legal professional to ensure
                compliance with GDPR, CCPA, and other applicable privacy laws in your jurisdictions
                of operation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Privacy Policy - Globoexpats',
  description:
    'Learn how Globoexpats protects your privacy. Read our privacy policy to understand how we collect, use, and safeguard your personal information on our Tanzania expat marketplace.',
  keywords: ['globoexpats privacy', 'data protection tanzania', 'marketplace privacy policy'],
}
