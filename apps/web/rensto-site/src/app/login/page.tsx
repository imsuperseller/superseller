'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// import { signIn } from 'next-auth/react';
// import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  XCircle,
  Lock,
  Shield,
} from 'lucide-react';
import { Input } from '@/components/ui/input-enhanced';
import { Label } from '@/components/ui/label';
import { gsap } from 'gsap';
import { BRAND } from '@/lib/design-system';

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
    <button ref={buttonRef} {...props} className="relative overflow-hidden">
      {children}
    </button>
  );
};

const SecurityMarquee = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const securityFeatures = [
    '🔒 Enterprise-grade security',
    '🛡️ 2FA enabled',
    '⚡ Powered by NextAuth.js',
    '🔐 End-to-end encryption',
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  const router = useRouter();
  // const { data: session, status } = useSession();
  const session = null;
  const status = 'unauthenticated';
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Redirect based on user role
      if (session.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

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
    setIsLoading(true);
    setError('');

    // Enhanced button animation
    const button = formRef.current?.querySelector('button');
    if (button) {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });

      // Spark effect
      const spark = document.createElement('div');
      spark.className =
        'absolute w-2 h-2 bg-white rounded-full pointer-events-none';
      spark.style.left = '50%';
      spark.style.top = '50%';
      button.appendChild(spark);

      gsap.fromTo(
        spark,
        { scale: 0, opacity: 1 },
        {
          scale: 2,
          opacity: 0,
          duration: 0.3,
          onComplete: () => spark.remove(),
        }
      );
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        if (formRef.current) {
          gsap.to(formRef.current, {
            x: -10,
            duration: 0.1,
            yoyo: true,
            repeat: 3,
            ease: 'power1.inOut',
          });
        }
      } else {
        // Success animation
        if (formRef.current) {
          gsap.to(formRef.current, {
            scale: 1.02,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            onComplete: () => router.push('/control'),
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
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: BRAND.colors.background.light }}
    >
      {/* Dynamic animated background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-blue-500/10 to-orange-500/10 rensto-animate-pulse" />

        {/* Animated network dots */}
        {[...Array(30)].map((_, i) => {
          // Use deterministic values based on index to prevent hydration mismatch
          const left = (i * 3.33) % 100;
          const top = (i * 2.5 + 10) % 100;
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

        {/* Geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-orange-500/20 rounded-full rensto-animate-glow-slow"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-blue-500/20 rotate-45 rensto-animate-pulse"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 border border-orange-500/20 rounded-full animate-bounce"></div>
      </div>

      <div ref={containerRef} className="w-full max-w-lg relative z-10">
        {/* Logo and Header */}
        <div ref={logoRef} className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-16 h-16 relative">
              <Image
                src="/rensto-logo.png"
                alt="Rensto"
                width={64}
                height={64}
                className="rounded-xl shadow-2xl"
              />
            </div>
            <GradientText>Rensto</GradientText>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Welcome Back
          </h2>
          <div className="text-slate-600 text-lg">
            <ShinyText>Access your business management platform</ShinyText>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-2xl p-10 relative overflow-hidden">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/30 rounded-2xl" />

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-8 relative z-10"
          >
            {error && (
              <div className="style={{ backgroundColor: 'var(--rensto-bg-primary)' }} border border-red-200 rounded-xl p-4 animate-shake">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-5 w-5 style={{ color: 'var(--rensto-red)' }} flex-shrink-0" />
                  <p className="text-sm style={{ color: 'var(--rensto-red)' }}">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-slate-700 font-semibold text-base"
              >
                Email address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`h-14 border-2 transition-all duration-300 text-base text-slate-900 ${
                    emailValid === true
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                      : emailValid === false
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500'
                  } hover:border-orange-400`}
                  placeholder="Enter your email"
                  required
                />
                {emailValid === true && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
                {emailValid === false && (
                  <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 style={{ color: 'var(--rensto-red)' }}" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="password"
                className="text-slate-700 font-semibold text-base"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-14 pr-12 border-2 border-slate-300 focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 text-base text-slate-900 hover:border-orange-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <MagnetButton
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full rensto-animate-glow"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Lock className="w-5 h-5" />
                  <span>Sign in</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </MagnetButton>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-slate-600 hover:text-orange-500 transition-colors underline"
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-10 p-6 bg-gradient-to-r from-slate-50/80 to-slate-100/80 rounded-xl border border-slate-200/50 relative z-10">
            <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Demo Credentials
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between items-center">
                <span>Email:</span>
                <span className="font-mono text-slate-800 bg-white px-3 py-2 rounded-lg border">
                  admin@rensto.com
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Password:</span>
                <span className="font-mono text-slate-800 bg-white px-3 py-2 rounded-lg border">
                  admin123
                </span>
              </div>
            </div>
          </div>

          {/* Security Footer */}
          <div className="mt-8 relative z-10">
            <SecurityMarquee />
          </div>
        </div>
      </div>
    </div>
  );
}
