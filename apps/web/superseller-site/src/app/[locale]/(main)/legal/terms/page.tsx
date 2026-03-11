import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { env } from '@/lib/env';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service | SuperSeller AI Business Agreement',
  description: 'The terms and conditions for using our services.',
  alternates: {
    canonical: '/legal/terms',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--superseller-bg-primary)' }}>
      {/* tiktok-developers-site-verification=JFoB1Ovq3YvAzsEwVx2CDwQLWyvSXgZq */}
      <Header />
      <main className="flex-grow">
        <section className="section">
          <div className="container max-w-4xl">
            <div className="mb-8">
              <Link href="/" className="text-accent1 hover:text-accent2 transition-colors duration-200">
                ← Back to Home
              </Link>
            </div>

            <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
            <p className="text-muted mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
                <p className="text-muted mb-4">
                  By accessing and using the services provided by SuperSeller AI LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;),
                  you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms,
                  you may not access our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Services Description</h2>
                <p className="text-muted mb-4">
                  SuperSeller AI provides AI-powered business automation services through a credit-based subscription model. Our AI crew includes specialized agents that handle:
                </p>
                <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                  <li>AI video production for real estate and business marketing (Forge, Spoke)</li>
                  <li>Social media content creation and automated publishing (Buzz)</li>
                  <li>AI-powered call answering and lead qualification (FrontDesk)</li>
                  <li>Lead generation and prospecting (Scout)</li>
                  <li>Facebook Marketplace automation (Market)</li>
                  <li>Business analytics and intelligence (Cortex)</li>
                  <li>Ongoing support and account management</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Project Terms</h2>

                <h3 className="text-xl font-semibold mb-3">Scope and Deliverables</h3>
                <p className="text-muted mb-4">
                  Project scope, deliverables, timelines, and pricing will be defined in a separate project agreement
                  or statement of work. All projects are subject to our WIP limits and quality standards.
                </p>

                <h3 className="text-xl font-semibold mb-3">Payment Terms</h3>
                <p className="text-muted mb-4">
                  Subscriptions are billed monthly. Payment details:
                </p>
                <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                  <li>Subscription plans (Starter, Pro, Team) are billed monthly in advance</li>
                  <li>Credits are allocated at the start of each billing cycle and do not roll over</li>
                  <li>All payments are processed securely through PayPal</li>
                  <li>Failed payments may result in service suspension after a 3-day grace period</li>
                  <li>You may cancel your subscription at any time; service continues through the end of the billing period</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Intellectual Property</h3>
                <p className="text-muted mb-4">
                  Content generated through our AI agents (videos, social media posts, marketing copy) is owned by you upon creation.
                  We retain rights to our proprietary AI models, agent configurations, templates, and platform technology.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Client Responsibilities</h2>
                <p className="text-muted mb-4">
                  As a client, you agree to:
                </p>
                <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                  <li>Provide accurate and complete project requirements</li>
                  <li>Respond to requests for information in a timely manner</li>
                  <li>Provide necessary access to systems and data</li>
                  <li>Test and validate deliverables</li>
                  <li>Maintain appropriate security measures</li>
                  <li>Comply with applicable laws and regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Our Responsibilities</h2>
                <p className="text-muted mb-4">
                  We commit to:
                </p>
                <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                  <li>Deliver services according to agreed scope and timeline</li>
                  <li>Maintain professional standards and quality</li>
                  <li>Protect your confidential information</li>
                  <li>Provide clear communication and updates</li>
                  <li>Address issues and provide support as agreed</li>
                  <li>Comply with applicable laws and regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                <p className="text-muted mb-4">
                  To the maximum extent permitted by law, SuperSeller AI shall not be liable for any indirect, incidental,
                  special, consequential, or punitive damages, including but not limited to loss of profits, data,
                  or business opportunities.
                </p>
                <p className="text-muted mb-4">
                  Our total liability for any claim arising from these Terms or our services shall not exceed the
                  amount paid by you for the specific service giving rise to the claim.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Warranty and Guarantee</h2>
                <p className="text-muted mb-4">
                  We warrant that our services will be performed in a professional manner consistent with industry standards.
                  If you are not satisfied with our delivery, we offer a SuperSeller AI Success Guarantee. We will work to rectify any issues or ensure your complete satisfaction if the system does not meet the agreed specifications.
                </p>
                <p className="text-muted mb-4">
                  This warranty does not cover issues arising from:
                </p>
                <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                  <li>Changes to your systems or requirements after project completion</li>
                  <li>Third-party system failures or changes</li>
                  <li>Client misuse or unauthorized modifications</li>
                  <li>Force majeure events</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Confidentiality</h2>
                <p className="text-muted mb-4">
                  We understand the sensitive nature of your business information and commit to maintaining strict
                  confidentiality. We will not disclose your confidential information to third parties without your
                  written consent, except as required by law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
                <p className="text-muted mb-4">
                  Either party may terminate a project agreement with written notice. Upon termination:
                </p>
                <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                  <li>We will deliver all completed work</li>
                  <li>You will pay for services rendered up to termination date</li>
                  <li>Both parties will return or destroy confidential information</li>
                  <li>Ongoing obligations (confidentiality, etc.) survive termination</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Force Majeure</h2>
                <p className="text-muted mb-4">
                  Neither party shall be liable for delays or failures in performance due to circumstances beyond
                  their reasonable control, including but not limited to natural disasters, government actions,
                  or technical failures.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                <p className="text-muted mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of the State of Texas,
                  without regard to its conflict of law provisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
                <p className="text-muted mb-4">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately
                  upon posting on our website. Your continued use of our services constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
                <p className="text-muted mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="card">
                  <p className="text-muted">
                    <strong>Email:</strong> {env.NEXT_PUBLIC_CONTACT_EMAIL}<br />
                    <strong>Address:</strong> SuperSeller AI LLC, 444 Alaska Avenue, Torrance, CA 90503<br />
                    <strong>Website:</strong> https://superseller.agency
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
