'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, User, Mail, Building, MessageSquare, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';

interface FormData {
  name: string;
  email: string;
  company: string;
  message: string;
  budget: string;
  timeline: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    budget: '',
    timeline: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        budget: '',
        timeline: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="card text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
        <p className="text-muted mb-6">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="btn-secondary"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitStatus === 'error' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-500 text-sm">
              Something went wrong. Please try again or email us directly.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            Full Name *
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors">
              <User size={18} />
            </div>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border transition-all outline-none text-white ${errors.name ? 'border-red-500/50' : 'border-white/5 focus:border-cyan-500/30'
                }`}
              placeholder="Elon Musk"
            />
          </div>
          {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            Email Address *
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border transition-all outline-none text-white ${errors.email ? 'border-red-500/50' : 'border-white/5 focus:border-cyan-500/30'
                }`}
              placeholder="elon@spacex.com"
            />
          </div>
          {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="company" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
          Company Name
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors">
            <Building size={18} />
          </div>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/5 focus:border-cyan-500/30 transition-all outline-none text-white"
            placeholder="SpaceX"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
          Project Intelligence *
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-6 text-slate-600 group-focus-within:text-cyan-400 transition-colors">
            <MessageSquare size={18} />
          </div>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={5}
            className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border transition-all outline-none text-white resize-none ${errors.message ? 'border-red-500/50' : 'border-white/5 focus:border-cyan-500/30'
              }`}
            placeholder="What efficiency leaks are we plugging?"
          />
        </div>
        {errors.message && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label htmlFor="budget" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            Budget Scope
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <DollarSign size={18} />
            </div>
            <select
              id="budget"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#110d28] border border-white/5 focus:border-cyan-500/30 transition-all outline-none text-white appearance-none cursor-pointer"
            >
              <option value="">Select Scope</option>
              <option value="under-1k">Experimental (Under $1k)</option>
              <option value="1k-5k">Standard ($1k - $5k)</option>
              <option value="5k-10k">Pro ($5k - $10k)</option>
              <option value="10k-25k">Enterprise ($10k - $25k)</option>
              <option value="25k-plus">Strategic ($25k+)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="timeline" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            Deployment Timeline
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <Calendar size={18} />
            </div>
            <select
              id="timeline"
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#110d28] border border-white/5 focus:border-cyan-500/30 transition-all outline-none text-white appearance-none cursor-pointer"
            >
              <option value="">Select Speed</option>
              <option value="asap">ASAP (Immediate)</option>
              <option value="1-2-weeks">1-2 Weeks</option>
              <option value="1-month">1 Month</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        size="xl"
        variant="renstoPrimary"
        className="w-full font-bold h-16 rounded-2xl text-lg group"
      >
        {isSubmitting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            <span>Initialize Project Brief</span>
            <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </>
        )}
      </Button>

      <p className="text-sm text-muted text-center">
        By submitting this form, you agree to our{' '}
        <a href="/legal/privacy" className="text-accent1 hover:text-accent2">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
