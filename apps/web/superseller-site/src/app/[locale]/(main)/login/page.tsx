'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Shield,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input-enhanced';
import { Label } from '@/components/ui/label-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { NoiseTexture } from '@/components/ui/premium';
import { gsap } from 'gsap';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

// ReactBits-inspired components
const GradientText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <h1 className={`text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 tracking-tighter ${className}`}>
    {children}
  </h1>
);

const ShinyText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <span className="relative z-10">{children}</span>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine pointer-events-none" />
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
        x: (x - rect.width / 2) * 0.15,
        y: (y - rect.height / 2) * 0.15,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
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
    <button ref={buttonRef} {...props} className={`relative overflow-hidden transition-shadow ${props.className}`}>
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
    <div className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
      <Shield className="w-3 h-3 text-cyan-500" />
      <span className="transition-all duration-500">
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
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }
    )
      .fromTo(
        logoRef.current,
        { scale: 0.8, opacity: 0, filter: 'blur(10px)' },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'back.out(1.7)',
        },
        '-=0.6'
      );

    // Subtle floating animation
    gsap.to(logoRef.current, {
      y: -8,
      duration: 2.5,
      ease: 'sine.inOut',
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
        scale: 0.98,
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
          gsap.timeline()
            .to(formRef.current, { scale: 0.95, opacity: 0, duration: 0.3, ease: 'power2.in' })
            .to(formRef.current, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out' });
        }
      } else {
        setError(data.error || 'Failed to send login link');
        if (formRef.current) {
          gsap.to(formRef.current, {
            x: -10,
            duration: 0.1,
            yoyo: true,
            repeat: 5,
            ease: 'rough({ template: none.out, strength: 1, points: 20, taper: none, randomize: true, clamp: false })',
          });
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
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'var(--superseller-bg-primary)' }}
    >
      <AnimatedGridBackground className="opacity-30" />
      <NoiseTexture opacity={0.03} />

      <div ref={containerRef} className="w-full max-w-xl relative z-10">
        {/* Logo and Header */}
        <div ref={logoRef} className="text-center mb-10">
          <div className="flex flex-col items-center justify-center space-y-4 mb-6">
            <div className="w-20 h-20 relative group">
              <div className="absolute inset-0 bg-superseller-red/20 blur-2xl rounded-full group-hover:bg-superseller-red/40 transition-all duration-500" />
              <Image
                src="/superseller-logo.webp"
                alt="SuperSeller AI"
                width={80}
                height={80}
                className="relative z-10 drop-shadow-[0_0_15px_rgba(244,121,32,0.5)]"
              />
            </div>
            <div className="pt-4">
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-black mb-4">
                Authentication Engine
              </Badge>
              <GradientText>Access SuperSeller AI</GradientText>
            </div>
          </div>

          <div className="text-slate-400 text-lg font-medium">
            <ShinyText>
              {isSuccess
                ? `System access sent to your terminal`
                : 'Login to your autonomous business dashboard'}
            </ShinyText>
          </div>
        </div>

        {/* Login Form Card */}
        <div
          className="rounded-[3rem] border p-8 md:p-12 relative overflow-hidden shadow-2xl backdrop-blur-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(244, 121, 32, 0.1)'
          }}
        >
          {/* Subtle Glows */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-superseller-red/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />

          {isSuccess ? (
            <div className="relative z-10 text-center py-6">
              <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <Mail className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Transmission Successful</h3>
              <p className="text-slate-400 mb-10 leading-relaxed font-medium">
                We've pulsed a magic link to <span className="text-white font-bold">{email}</span>.<br />
                Check your inbox to gain access.
              </p>

              {devLink && (
                <div className="mb-10 p-5 bg-white/5 border border-white/10 rounded-2xl text-left">
                  <p className="text-[10px] font-black text-cyan-400 mb-3 uppercase tracking-[0.2em]">Dev Override Path:</p>
                  <a href={devLink} className="text-xs text-cyan-400 break-all hover:text-cyan-300 transition-colors block font-mono">{devLink}</a>
                </div>
              )}

              <button
                onClick={() => { setIsSuccess(false); setEmail(''); }}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-superseller-red transition-all"
              >
                ← Back to sign in
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-10 relative z-10"
            >
              {error && (
                <div className="bg-superseller-red/10 border border-superseller-red/20 rounded-2xl p-5 flex items-center gap-4">
                  <XCircle className="h-6 w-6 text-superseller-red flex-shrink-0" />
                  <p className="text-sm font-semibold text-superseller-red">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <Label
                  htmlFor="email"
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1"
                >
                  Terminal Identifier (Email)
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`h-16 bg-white/[0.03] border-white/5 rounded-2xl px-6 text-lg transition-all duration-300 ${emailValid === true
                      ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                      : emailValid === false
                        ? 'border-superseller-red/50 focus:border-superseller-red focus:ring-superseller-red/20'
                        : 'focus:border-cyan-500 focus:ring-cyan-500/20'
                      } group-hover:bg-white/[0.06]`}
                    placeholder="agent@company.com"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
                    {emailValid === true && (
                      <CheckCircle className="h-6 w-6 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    )}
                    {emailValid === false && email.length > 0 && (
                      <AlertCircle className="h-6 w-6 text-superseller-red drop-shadow-[0_0_10px_rgba(244,121,32,0.5)]" />
                    )}
                    {isLoading && (
                      <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
                    )}
                  </div>
                </div>
              </div>

              <MagnetButton
                type="submit"
                disabled={isLoading || !emailValid}
                className={`
                  w-full h-16 text-xs font-black uppercase tracking-[0.3em] rounded-2xl transition-all duration-500 shadow-2xl
                  ${isLoading || !emailValid
                    ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-superseller-red to-superseller-orange text-white hover:scale-[1.02] active:scale-[0.98] shadow-superseller-red/20'
                  }
                `}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Mail className="w-4 h-4" />
                    <span>Initialize Access</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </MagnetButton>
            </form>
          )}

          {/* Security Footer */}
          <div className="mt-12 relative z-10 pt-8 border-t border-white/5">
            <SecurityMarquee />
          </div>
        </div>

        {/* Subtle Bottom Link */}
        {!isSuccess && (
          <div className="mt-8 text-center">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-slate-400 transition-colors">
              Return to Operational Control
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-superseller-red animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
