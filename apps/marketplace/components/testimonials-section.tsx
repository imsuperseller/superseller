'use client';

import { motion } from 'framer-motion';
import { StarIcon, QuoteIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    name: 'Shelly Mizrahi',
    company: 'Insurance Agency',
    role: 'Owner',
    content: 'The Hebrew email automation system has transformed our customer communication. We can now respond to clients in Hebrew with emojis and cultural context, making our service feel more personal and professional.',
    rating: 5,
    avatar: '/testimonials/shelly.jpg',
    product: 'Hebrew Email Automation'
  },
  {
    name: 'Ben Ginati',
    company: 'Tax4Us',
    role: 'Founder',
    content: 'The content automation system has saved us hours every week. WordPress posts, social media content, and client communications are all automated. Our productivity has increased by 300%.',
    rating: 5,
    avatar: '/testimonials/ben.jpg',
    product: 'Tax4Us Content Automation'
  },
  {
    name: 'Sarah Johnson',
    company: 'TechStart Inc.',
    role: 'Operations Manager',
    content: 'The business process automation has streamlined our entire operation. From customer onboarding to project management, everything runs smoothly. The ROI was visible within the first month.',
    rating: 5,
    avatar: '/testimonials/sarah.jpg',
    product: 'Business Process Automation'
  },
  {
    name: 'Michael Chen',
    company: 'Global Services Ltd.',
    role: 'CEO',
    content: 'The multi-currency financial automation has been a game-changer for our international operations. Automated billing, payment tracking, and compliance - everything we needed in one solution.',
    rating: 5,
    avatar: '/testimonials/michael.jpg',
    product: 'Multi-Currency Financial Automation'
  },
  {
    name: 'Emily Rodriguez',
    company: 'Marketing Pro',
    role: 'Marketing Director',
    content: 'The AI-powered email persona system is incredible. We have 6 different AI personas handling different types of inquiries, and our response time has improved by 80%.',
    rating: 5,
    avatar: '/testimonials/emily.jpg',
    product: 'AI-Powered Email Persona System'
  },
  {
    name: 'David Thompson',
    company: 'Enterprise Solutions',
    role: 'CTO',
    content: 'The MCP server integration suite has connected all our systems seamlessly. Airtable, Notion, n8n - everything works together perfectly. The technical support is outstanding.',
    rating: 5,
    avatar: '/testimonials/david.jpg',
    product: 'MCP Server Integration Suite'
  }
];

const companies = [
  { name: 'Shelly Mizrahi Insurance', logo: '/logos/shelly.png' },
  { name: 'Tax4Us', logo: '/logos/tax4us.png' },
  { name: 'TechStart Inc.', logo: '/logos/techstart.png' },
  { name: 'Global Services Ltd.', logo: '/logos/global.png' },
  { name: 'Marketing Pro', logo: '/logos/marketing.png' },
  { name: 'Enterprise Solutions', logo: '/logos/enterprise.png' }
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-dark-900">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">What Our Customers Say</span>
          </h2>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what real customers say about 
            their experience with Rensto automation solutions.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-hover bg-dark-800/50 border-dark-700"
            >
              {/* Quote Icon */}
              <div className="flex justify-center mb-4">
                <div className="p-2 bg-primary-500/20 rounded-full">
                  <QuoteIcon className="w-6 h-6 text-primary-500" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-dark-300 text-center mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Product Badge */}
              <div className="text-center mb-4">
                <span className="inline-block bg-primary-500/20 text-primary-500 text-sm px-3 py-1 rounded-full">
                  {testimonial.product}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-dark-400">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Companies */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-8">
            Trusted by Leading Companies
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center"
              >
                <div className="w-24 h-16 bg-dark-700 rounded-lg flex items-center justify-center">
                  <span className="text-dark-400 text-sm font-medium">
                    {company.name.split(' ')[0]}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-3xl font-bold gradient-text mb-2">4.9/5</div>
            <div className="text-dark-300">Average Rating</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-3xl font-bold gradient-text mb-2">500+</div>
            <div className="text-dark-300">Happy Customers</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-3xl font-bold gradient-text mb-2">95%</div>
            <div className="text-dark-300">Success Rate</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
            <div className="text-dark-300">Support Available</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

