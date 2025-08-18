import { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Rensto collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen">
      <section className="section">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <Link href="/" className="text-accent1 hover:text-accent2 transition-colors duration-200">
              ← Back to Home
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted mb-4">
                Rensto LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
                our website or use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
              <p className="text-muted mb-4">
                We may collect personal information that you voluntarily provide to us, including:
              </p>
              <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                <li>Name and contact information (email, phone number)</li>
                <li>Company information</li>
                <li>Project requirements and specifications</li>
                <li>Communication preferences</li>
                <li>Payment information (processed securely through Stripe)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Automatically Collected Information</h3>
              <p className="text-muted mb-4">
                When you visit our website, we may automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Referring website</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Communicate with you about projects and services</li>
                <li>Process payments and transactions</li>
                <li>Improve our website and services</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
              <p className="text-muted mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described below:
              </p>
              <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website and providing services</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, 
                and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-muted mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted mb-4 space-y-2">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted mb-4">
                We use cookies and similar technologies to enhance your experience on our website. You can control cookie 
                settings through your browser preferences. However, disabling cookies may affect website functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
              <p className="text-muted mb-4">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices 
                of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-muted mb-4">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-muted mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="card">
                <p className="text-muted">
                  <strong>Email:</strong> {env.NEXT_PUBLIC_CONTACT_EMAIL}<br />
                  <strong>Address:</strong> Rensto LLC, Plano, TX<br />
                  <strong>Website:</strong> https://rensto.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
