import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			text: '#E5E7EB',
  			accent1: '#2F6A92',
  			accent2: '#FF6536',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			foreground: 'hsl(var(--foreground))',
  			// SuperSeller AI Brand Colors
  			superseller: {
  				red: 'var(--superseller-red)',
  				orange: 'var(--superseller-orange)',
  				blue: 'var(--superseller-blue)',
  				cyan: 'var(--superseller-cyan)',
  				neon: 'var(--superseller-neon)',
  				glow: 'var(--superseller-glow)',
  				'bg-primary': 'var(--superseller-bg-primary)',
  				'bg-secondary': 'var(--superseller-bg-secondary)',
  				'bg-card': 'var(--superseller-bg-card)',
  				'bg-surface': 'var(--superseller-bg-surface)',
  				'text-primary': 'var(--superseller-text-primary)',
  				'text-secondary': 'var(--superseller-text-secondary)',
  				'text-muted': 'var(--superseller-text-muted)',
  				'text-accent': 'var(--superseller-text-accent)',
  			},
  		},
  		borderRadius: {
  			DEFAULT: '1rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			glass: '0 10px 30px rgba(0,0,0,0.25)',
  			glow: '0 0 20px rgba(47,106,146,0.3)',
  			'superseller-glow-primary': 'var(--superseller-glow-primary)',
  			'superseller-glow-secondary': 'var(--superseller-glow-secondary)',
  			'superseller-glow-accent': 'var(--superseller-glow-accent)',
  			'superseller-glow-neon': 'var(--superseller-glow-neon)',
  		},
  		animation: {
  			'logo-glow': 'glow 2s ease-in-out infinite alternate',
  			'fade-up': 'fadeUp 0.9s ease-out forwards',
  			'superseller-glow': 'superseller-glow 2s ease-in-out infinite alternate',
  			'superseller-pulse': 'superseller-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'superseller-shimmer': 'superseller-shimmer 2s infinite',
  			'superseller-fadeIn': 'superseller-fadeIn 0.5s ease-out',
  		},
  		keyframes: {
  			glow: {
  				'0%': {
  					filter: 'drop-shadow(0 0 5px rgba(47,106,146,0.3))'
  				},
  				'100%': {
  					filter: 'drop-shadow(0 0 20px rgba(47,106,146,0.6))'
  				}
  			},
  			fadeUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'superseller-glow': {
  				'0%': {
  					boxShadow: 'var(--superseller-glow-accent)'
  				},
  				'100%': {
  					boxShadow: 'var(--superseller-glow-neon)'
  				}
  			},
  			'superseller-pulse': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.5'
  				}
  			},
  			'superseller-shimmer': {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			},
  			'superseller-fadeIn': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		backdropBlur: {
  			glass: 'blur(10px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
