'use client';

import { motion } from 'framer-motion';
import { 
  RocketLaunchIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const benefits = [
  '14-day free trial',
  'No credit card required',
  'Setup in under 1 hour',
  '24/7 customer support',
  '30-day money-back guarantee'
];

export function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-highlight-500/20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-10 left-10 animate-float">
        <div className="w-32 h-32 bg-primary-500/20 rounded-full blur-xl" />
      </div>
      <div className="absolute bottom-10 right-10 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-40 h-40 bg-accent-500/20 rounded-full blur-xl" />
      </div>
      <div className="absolute top-1/2 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-24 h-24 bg-highlight-500/20 rounded-full blur-xl" />
      </div>

      <div className="container-max relative z-10">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
          >
            <SparklesIcon className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              🚀 Ready to Transform Your Business?
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="text-white">Start Your Automation</span>
            <br />
            <span className="gradient-text">Journey Today</span>
          </motion.h2>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Join thousands of businesses already using Rensto automation 
            to streamline their operations and boost productivity.
          </motion.p>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            {benefits.map((benefit, index) => (
              <div key={benefit} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <CheckIcon className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
          >
            <button className="bg-white text-dark-900 hover:bg-white/90 font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent text-lg group">
              <span>Start Free Trial</span>
              <RocketLaunchIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform inline" />
            </button>
            
            <button className="border-2 border-white text-white hover:bg-white hover:text-dark-900 font-bold py-4 px-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent text-lg group">
              <span>View All Products</span>
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform inline" />
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">18</div>
              <div className="text-white/80">Proven Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

