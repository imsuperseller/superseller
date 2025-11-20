import Link from 'next/link';
import Image from 'next/image';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Facebook,
  Instagram,
  Mail, 
  Phone,
  MapPin,
  Zap,
  Workflow,
  Settings,
  BarChart3
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navigation = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    business: [
      { name: 'Customer App', href: '/app', icon: Workflow },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/legal/privacy' },
      { name: 'Terms of Service', href: '/legal/terms' },
    ],
    social: [
      {
        name: 'Facebook',
        href: 'https://facebook.com/myrensto',
        icon: Facebook,
      },
      {
        name: 'Instagram',
        href: 'https://instagram.com/myrensto',
        icon: Instagram,
      },
      {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/company/rensto-llc',
        icon: Linkedin,
      },
      {
        name: 'Twitter',
        href: 'https://twitter.com/rensto',
        icon: Twitter,
      },
      {
        name: 'GitHub',
        href: 'https://github.com/rensto',
        icon: Github,
      },
    ],
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/rensto-logo.png"
                  alt="Rensto Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(254, 61, 81, 0.5)) drop-shadow(0 0 12px rgba(30, 174, 247, 0.3))'
                  }}
                  priority
                />
              </div>
              <span className="text-xl font-bold">Rensto</span>
            </div>
            <p className="text-slate-300 mb-4 max-w-md">
              Transform your business with AI-powered automation agents. Build, deploy, and manage intelligent workflows that scale your operations.
            </p>
            <div className="flex space-x-4">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-slate-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Apps */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase mb-4">
              Business Apps
            </h3>
            <ul className="space-y-3">
              {navigation.business.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center text-slate-300 hover:text-white transition-colors"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300">hello@rensto.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300">San Francisco, CA</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              {navigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <p className="text-slate-400 text-sm">
              © {currentYear} Rensto. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
