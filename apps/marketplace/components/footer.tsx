import Link from 'next/link';
import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const footerLinks = {
  products: [
    { name: 'Email Automation', href: '/products/email-automation' },
    { name: 'Business Process', href: '/products/business-process' },
    { name: 'Content Generation', href: '/products/content-generation' },
    { name: 'Financial Automation', href: '/products/financial' },
    { name: 'Customer Management', href: '/products/customer-management' },
    { name: 'Technical Integration', href: '/products/technical' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Team', href: '/team' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'Documentation', href: '/docs' },
    { name: 'Help Center', href: '/help' },
    { name: 'API Reference', href: '/api' },
    { name: 'Community', href: '/community' },
    { name: 'Status', href: '/status' },
    { name: 'Security', href: '/security' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
    { name: 'CCPA', href: '/ccpa' },
    { name: 'SLA', href: '/sla' },
  ],
};

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/rensto', icon: 'twitter' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/rensto', icon: 'linkedin' },
  { name: 'GitHub', href: 'https://github.com/rensto', icon: 'github' },
  { name: 'YouTube', href: 'https://youtube.com/rensto', icon: 'youtube' },
];

export function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <div className="container-max">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold gradient-text">Rensto</span>
            </Link>
            <p className="text-dark-300 mb-6 max-w-md">
              Transform your business with our proven automation workflows. 
              From email automation to financial processing - we've got you covered.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-dark-300">
                <EnvelopeIcon className="w-5 h-5 text-primary-500" />
                <span>hello@rensto.com</span>
              </div>
              <div className="flex items-center space-x-3 text-dark-300">
                <PhoneIcon className="w-5 h-5 text-primary-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-dark-300">
                <MapPinIcon className="w-5 h-5 text-primary-500" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-dark-300 hover:text-primary-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-dark-300 hover:text-primary-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-dark-300 hover:text-primary-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-dark-300 hover:text-primary-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="py-8 border-t border-dark-700">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
              <p className="text-dark-300">Get the latest automation tips and product updates.</p>
            </div>
            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-80 px-4 py-3 bg-dark-800 border border-dark-700 rounded-l-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="btn-primary rounded-l-none">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-dark-700 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-dark-300 text-sm">
            © 2025 Rensto. All rights reserved.
          </div>
          
          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="text-dark-300 hover:text-primary-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">{social.name}</span>
                <div className="w-8 h-8 bg-dark-800 rounded-lg flex items-center justify-center hover:bg-primary-500/20 transition-colors">
                  <span className="text-sm font-bold">
                    {social.icon === 'twitter' && '𝕏'}
                    {social.icon === 'linkedin' && 'in'}
                    {social.icon === 'github' && '⚡'}
                    {social.icon === 'youtube' && '▶'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

