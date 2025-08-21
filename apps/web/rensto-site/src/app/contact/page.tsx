import { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { ContactForm } from '@/components/ContactForm';
import { Mail, MapPin, Clock, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Rensto to discuss your automation needs. We respond within 24 hours.',
};

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: env.NEXT_PUBLIC_CONTACT_EMAIL,
    link: `mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`,
    description: 'For general inquiries and support'
  },
  {
    icon: MapPin,
    title: 'Location',
    value: 'Plano, TX',
    link: 'https://maps.google.com/?q=Plano,TX',
    description: 'Serving clients nationwide'
  },
  {
    icon: Clock,
    title: 'Response Time',
    value: '24 hours',
    link: null,
    description: 'We typically respond within 24 hours'
  },
  {
    icon: Phone,
    title: 'Schedule Call',
    value: 'Book Online',
    link: env.NEXT_PUBLIC_TYPEFORM_CONTACT_URL || '/contact',
    description: 'Schedule a consultation call'
  }
];

const faqs = [
  {
    question: 'How quickly can you start a project?',
    answer: 'We can typically start within 1-2 weeks of project approval. Our WIP limits ensure we have capacity for new projects.'
  },
  {
    question: 'Do you work with international clients?',
    answer: 'Yes, we work with clients worldwide. All communication and project management is done remotely with regular video calls.'
  },
  {
    question: 'What if I need changes after deployment?',
    answer: 'We include 30 days of post-deployment support. For ongoing changes, we offer care plans starting at $750/month.'
  },
  {
    question: 'Can you integrate with my existing systems?',
    answer: 'Absolutely! n8n supports 400+ integrations. We can connect to your CRM, email, databases, APIs, and more.'
  },
  {
    question: 'Do you provide training for my team?',
    answer: 'Yes, we include comprehensive training in our process. We train both end users and administrators on your automations.'
  },
  {
    question: 'What if I\'m not satisfied with the results?',
    answer: 'We offer a money-back guarantee. If you\'re not satisfied with our work, we\'ll refund your investment.'
  }
];

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="section bg-gradient-to-br from-background via-background to-accent1/20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Let&apos;s Build Something Amazing
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto mb-8">
            Ready to automate your business processes? Get in touch and let&apos;s discuss how we can help you save time and scale efficiently.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="card">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{info.title}</h3>
                        {info.link ? (
                          <Link 
                            href={info.link}
                            className="text-accent1 hover:text-accent2 transition-colors duration-200"
                          >
                            {info.value}
                          </Link>
                        ) : (
                          <p className="text-text">{info.value}</p>
                        )}
                        <p className="text-sm text-muted mt-1">{info.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8 card">
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {env.NEXT_PUBLIC_LINKEDIN_URL && (
                    <Link 
                      href={env.NEXT_PUBLIC_LINKEDIN_URL}
                      className="text-muted hover:text-accent1 transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </Link>
                  )}
                  {env.NEXT_PUBLIC_X_URL && (
                    <Link 
                      href={env.NEXT_PUBLIC_X_URL}
                      className="text-muted hover:text-accent1 transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      X (Twitter)
                    </Link>
                  )}
                  {env.NEXT_PUBLIC_YOUTUBE_URL && (
                    <Link 
                      href={env.NEXT_PUBLIC_YOUTUBE_URL}
                      className="text-muted hover:text-accent1 transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      YouTube
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-card/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Common questions about our process and services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                <p className="text-muted leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-accent1/20 to-accent2/20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
            Choose from our automation services or schedule a consultation to discuss your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/offers" className="btn-primary text-lg px-8 py-4">
              View Our Offers
            </Link>
            <Link href="/process" className="btn-secondary text-lg px-8 py-4">
              Learn Our Process
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
