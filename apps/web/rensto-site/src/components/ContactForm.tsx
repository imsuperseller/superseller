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

const translations = {
  en: {
    labels: {
      name: "Full Name *",
      email: "Email Address *",
      company: "Company Name",
      message: "Project Intelligence *",
      budget: "Budget Scope",
      timeline: "Deployment Timeline"
    },
    placeholders: {
      name: "Elon Musk",
      email: "elon@spacex.com",
      company: "SpaceX",
      message: "What efficiency leaks are we plugging?",
      budget: "Select Scope",
      timeline: "Select Speed"
    },
    options: {
      budget: {
        "under-1k": "Experimental (Under $1k)",
        "1k-5k": "Standard ($1k - $5k)",
        "5k-10k": "Pro ($5k - $10k)",
        "10k-25k": "Enterprise ($10k - $25k)",
        "25k-plus": "Strategic ($25k+)"
      },
      timeline: {
        "asap": "ASAP (Immediate)",
        "1-2-weeks": "1-2 Weeks",
        "1-month": "1 Month",
        "flexible": "Flexible"
      }
    },
    errors: {
      name: "Name is required",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      messageRequired: "Message is required",
      messageLength: "Message must be at least 10 characters",
      generic: "Something went wrong. Please try again or email us directly."
    },
    submit: "Initialize Project Brief",
    successTitle: "Message Sent!",
    successText: "Thank you for reaching out. We'll get back to you within 24 hours.",
    sendAnother: "Send Another Message",
    disclaimer: {
      pre: "By submitting this form, you agree to our ",
      link: "Privacy Policy",
      post: "."
    }
  },
  he: {
    labels: {
      name: "שם מלא *",
      email: "כתובת מייל *",
      company: "שם החברה",
      message: "פרטי הפרויקט *",
      budget: "תקציב משוער",
      timeline: "זמן יישום רצוי"
    },
    placeholders: {
      name: "ישראל ישראלי",
      email: "israel@company.com",
      company: "שם העסק שלך",
      message: "אילו אתגרים תפעוליים אנחנו הולכים לפתור?",
      budget: "בחר טווח תקציב",
      timeline: "בחר מהירות יישום"
    },
    options: {
      budget: {
        "under-1k": "ניסיוני (מתחת ל-$1k)",
        "1k-5k": "סטנדרט ($1k - $5k)",
        "5k-10k": "פרו ($5k - $10k)",
        "10k-25k": "אנטרפרייז ($10k - $25k)",
        "25k-plus": "אסטרטגי ($25k+)"
      },
      timeline: {
        "asap": "מיידי (ASAP)",
        "1-2-weeks": "1-2 שבועות",
        "1-month": "חודש",
        "flexible": "גמיש"
      }
    },
    errors: {
      name: "שם מלא הוא שדה חובה",
      emailRequired: "כתובת מייל היא שדה חובה",
      emailInvalid: "נא להזין כתובת מייל תקינה",
      messageRequired: "תוכן ההודעה הוא שדה חובה",
      messageLength: "ההודעה חייבת להכיל לפחות 10 תווים",
      generic: "משהו השתבש. אנא נסו שוב או שלחו לנו מייל ישירות."
    },
    submit: "שלח פנייה",
    successTitle: "ההודעה נשלחה!",
    successText: "תודה שפנית אלינו. נחזור אליך בתוך 24 שעות.",
    sendAnother: "שלח הודעה נוספת",
    disclaimer: {
      pre: "בשליחת טופס זה, אתם מסכימים ל",
      link: "מדיניות הפרטיות",
      post: " שלנו."
    }
  }
};

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactForm({ lang = 'en' }: { lang?: 'en' | 'he' }) {
  const t = translations[lang];
  const isRtl = lang === 'he';
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
      newErrors.name = t.errors.name;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.errors.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!formData.message.trim()) {
      newErrors.message = t.errors.messageRequired;
    } else if (formData.message.length < 10) {
      newErrors.message = t.errors.messageLength;
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
        <h3 className="text-xl font-semibold mb-2">{t.successTitle}</h3>
        <p className="text-muted mb-6">
          {t.successText}
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="btn-secondary"
        >
          {t.sendAnother}
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
              {t.errors.generic}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            {t.labels.name}
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
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-white/[0.03] border transition-all outline-none text-white ${errors.name ? 'border-red-500/50' : 'border-white/5 focus:border-cyan-500/30'
                }`}
              placeholder={t.placeholders.name}
            />
          </div>
          {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            {t.labels.email}
          </label>
          <div className="relative group">
            <div className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors`}>
              <Mail size={18} />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-white/[0.03] border transition-all outline-none text-white ${errors.email ? 'border-red-500/50' : 'border-white/5 focus:border-cyan-500/30'
                }`}
              placeholder={t.placeholders.email}
            />
          </div>
          {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="company" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
          {t.labels.company}
        </label>
        <div className="relative group">
          <div className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors`}>
            <Building size={18} />
          </div>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-white/[0.03] border border-white/5 focus:border-cyan-500/30 transition-all outline-none text-white`}
            placeholder={t.placeholders.company}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
          {t.labels.message}
        </label>
        <div className="relative group">
          <div className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-6 text-slate-600 group-focus-within:text-cyan-400 transition-colors`}>
            <MessageSquare size={18} />
          </div>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={5}
            className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-white/[0.03] border transition-all outline-none text-white resize-none ${errors.message ? 'border-red-500/50' : 'border-white/5 focus:border-cyan-500/30'
              }`}
            placeholder={t.placeholders.message}
          />
        </div>
        {errors.message && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label htmlFor="budget" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            {t.labels.budget}
          </label>
          <div className="relative">
            <div className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-600`}>
              <DollarSign size={18} />
            </div>
            <select
              id="budget"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-[#110d28] border border-white/5 focus:border-cyan-500/30 transition-all outline-none text-white appearance-none cursor-pointer`}
            >
              <option value="">{t.placeholders.budget}</option>
              <option value="under-1k">{t.options.budget["under-1k"]}</option>
              <option value="1k-5k">{t.options.budget["1k-5k"]}</option>
              <option value="5k-10k">{t.options.budget["5k-10k"]}</option>
              <option value="10k-25k">{t.options.budget["10k-25k"]}</option>
              <option value="25k-plus">{t.options.budget["25k-plus"]}</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="timeline" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            {t.labels.timeline}
          </label>
          <div className="relative">
            <div className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-600`}>
              <Calendar size={18} />
            </div>
            <select
              id="timeline"
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-[#110d28] border border-white/5 focus:border-cyan-500/30 transition-all outline-none text-white appearance-none cursor-pointer`}
            >
              <option value="">{t.placeholders.timeline}</option>
              <option value="asap">{t.options.timeline.asap}</option>
              <option value="1-2-weeks">{t.options.timeline["1-2-weeks"]}</option>
              <option value="1-month">{t.options.timeline["1-month"]}</option>
              <option value="flexible">{t.options.timeline.flexible}</option>
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
            <span>{t.submit}</span>
            <Send className={`ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
          </>
        )}
      </Button>

      <p className="text-sm text-muted text-center">
        {t.disclaimer.pre}
        <a href="/legal/privacy" className="text-accent1 hover:text-accent2">
          {t.disclaimer.link}
        </a>
        {t.disclaimer.post}
      </p>
    </form>
  );
}
