'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  Mail,
  Shield,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input-enhanced';
import { Label } from '@/components/ui/label-enhanced';
import { gsap } from 'gsap';

// ReactBits-inspired components
const GradientText = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-blue-500 to-orange-600 bg-clip-text text-transparent animate-gradient">
    {children}
  </h1>
);

const ShinyText = ({ children }: { children: React.ReactNode }) => (
  <div className="relative overflow-hidden">
    <span className="relative z-10">{children}</span>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine" />
  </div>
);

const MagnetButton = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(button, {
        x: (x - rect.width / 2) * 0.1,
        y: (y - rect.height / 2) * 0.1,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <button ref={buttonRef} {...props} className={`relative overflow-hidden ${props.className}`}>
      {children}
    </button>
  );
};

const SecurityMarquee = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const securityFeatures = [
    '🔒 Secure Passwordless Login',
    '🛡️ Enterprise-grade encryption',
    '⚡ Magic Link Technology',
    '🔐 24-hour token expiry',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % securityFeatures.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
      <Shield className="w-3 h-3" />
      <span className="animate-fade-in-out">
        {securityFeatures[currentIndex]}
      </span>
    </div>
  );
};

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (email) {
      setEmailValid(validateEmail(email));
    } else {
      setEmailValid(null);
    }
  }, [email]);

  useEffect(() => {
    // Professional GSAP Animations
    const tl = gsap.timeline();

    tl.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )
      .fromTo(
        logoRef.current,
        { scale: 0.8, opacity: 0, rotation: -10 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
        },
        '-=0.4'
      )
      .fromTo(
        formRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.3'
      );

    // Subtle floating animation
    gsap.to(logoRef.current, {
      y: -5,
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });

    return () => {
      tl.kill();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return;

    setIsLoading(true);
    setError('');
    setDevLink(null);

    // Enhanced button animation
    const button = formRef.current?.querySelector('button');
    if (button) {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
    }

    try {
      const response = await fetch('/api/auth/magic-link/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo: redirectPath }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        if (data.devLink) {
          setDevLink(data.devLink);
        }
        // Success animation
        if (formRef.current) {
          gsap.to(formRef.current, {
            scale: 1.02,
            duration: 0.2,
            yoyo: true,
            repeat: 1
          });
        }
      } else {
        setError(data.error || 'Failed to send login link');
        if (formRef.current) {
          gsap.to(formRef.current, {
            x: -10,
            duration: 0.1,
            yoyo: true,
            repeat: 3,
            ease: 'power1.inOut',
          });
        }
        if (data.debug) {
          console.log('Debug info:', data.debug);
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--rensto-bg-primary)' }}
    >
      {/* Dynamic animated background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-blue-500/10 to-orange-500/10 rensto-animate-pulse" />

        {/* Animated network dots (Reduced count for performance) */}
        {[...Array(15)].map((_, i) => {
          const left = (i * 6.66) % 100;
          const top = (i * 5 + 10) % 100;
          const delay = (i * 0.1) % 3;
          const duration = 3 + (i % 3) * 0.5;

          return (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full rensto-animate-pulse"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      <div ref={containerRef} className="w-full max-w-lg relative z-10">
        {/* Logo and Header */}
        <div ref={logoRef} className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-16 h-16 relative">
              <Image
                src="/rensto-logo.webp"
                alt="Rensto - AI-Powered Business Automation"
                width={64}
                height={64}
                className="rounded-xl shadow-2xl"
              />
            </div>
            <GradientText>Rensto</GradientText>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {isSuccess ? 'Check Your Inbox' : 'Welcome Back'}
          </h2>
          <div className="text-slate-600 text-lg">
            <ShinyText>
              {isSuccess
                ? `We've sent a magic link to ${email}`
                : 'Access your business management platform'}
            </ShinyText>
          </div>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border p-10 relative overflow-hidden" style={{ background: 'var(--rensto-bg-card)', borderColor: 'rgba(254, 61, 81, 0.2)' }}>
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/30 rounded-2xl" />

          {isSuccess ? (
            <div className="relative z-10 text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-slate-600 mb-8">
                Click the link in the email to securely sign in. This link expires in 24 hours.
              </p>

              {devLink && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                  <p className="text-xs font-bold text-yellow-800 mb-2 uppercase tracking-wide">Development Link:</p>
                  <a href={devLink} className="text-sm text-blue-600 break-all hover:underline block">{devLink}</a>
                </div>
              )}

              <button
                onClick={() => { setIsSuccess(false); setEmail(''); }}
                className="text-slate-500 hover:text-orange-500 font-medium transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-8 relative z-10"
            >
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="font-semibold text-base"
                  style={{ color: 'var(--rensto-text-primary)' }}
                >
                  Email address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`h-14 border-2 transition-all duration-300 text-base text-slate-900 ${emailValid === true
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                      : emailValid === false
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500'
                      } hover:border-orange-400`}
                    placeholder="name@company.com"
                    required
                    disabled={isLoading}
                  />
                  {emailValid === true && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                  {emailValid === false && email.length > 0 && (
                    <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>

              <MagnetButton
                type="submit"
                disabled={isLoading || !emailValid}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Link...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Mail className="w-5 h-5" />
                    <span>Send Magic Link</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </MagnetButton>
            </form>
          )}

          {/* Security Footer */}
          <div className="mt-8 relative z-10">
            <SecurityMarquee />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
