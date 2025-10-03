'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  ArrowRightIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export function Hero() {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    'AI-Powered Email Automation',
    'Business Process Automation', 
    'Content Generation & Marketing',
    'Financial & Invoicing Automation',
    'Customer Onboarding & Management',
    'Technical Integration Packages'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="relative overflow-hidden section-padding">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient opacity-50" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-20 h-20 bg-primary-500/20 rounded-full blur-xl" />
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-32 h-32 bg-accent-500/20 rounded-full blur-xl" />
      </div>
      <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-24 h-24 bg-highlight-500/20 rounded-full blur-xl" />
      </div>

      <div className="container-max relative z-10">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-dark-800/50 backdrop-blur-sm border border-primary-500/30 rounded-full px-4 py-2 mb-8"
          >
            <SparklesIcon className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-white">
              🚀 18 Proven Automation Products Available
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="gradient-text">Automate Your Business</span>
            <br />
            <span className="text-white">Like Never Before</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-dark-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your business with our proven automation workflows. 
            From email automation to financial processing - we've got you covered.
          </motion.p>

          {/* Rotating Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <div className="inline-flex items-center space-x-3 bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-lg px-6 py-3">
              <CogIcon className="w-5 h-5 text-primary-500 animate-spin" />
              <span className="text-lg font-semibold text-white">
                {features[currentFeature]}
              </span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
          >
            <Link href="/products" className="btn-primary text-lg px-8 py-4 group">
              <span>Explore Products</span>
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button className="btn-outline text-lg px-8 py-4 group">
              <PlayIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              <span>Watch Demo</span>
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">18</div>
              <div className="text-dark-300">Automation Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">6</div>
              <div className="text-dark-300">Product Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">$497</div>
              <div className="text-dark-300">Average Price</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-20 text-dark-900"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}

