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
  			// Rensto Brand Colors
  			rensto: {
  				red: 'var(--rensto-red)',
  				orange: 'var(--rensto-orange)',
  				blue: 'var(--rensto-blue)',
  				cyan: 'var(--rensto-cyan)',
  				neon: 'var(--rensto-neon)',
  				glow: 'var(--rensto-glow)',
  				'bg-primary': 'var(--rensto-bg-primary)',
  				'bg-secondary': 'var(--rensto-bg-secondary)',
  				'bg-card': 'var(--rensto-bg-card)',
  				'bg-surface': 'var(--rensto-bg-surface)',
  				'text-primary': 'var(--rensto-text-primary)',
  				'text-secondary': 'var(--rensto-text-secondary)',
  				'text-muted': 'var(--rensto-text-muted)',
  				'text-accent': 'var(--rensto-text-accent)',
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
  			'rensto-glow-primary': 'var(--rensto-glow-primary)',
  			'rensto-glow-secondary': 'var(--rensto-glow-secondary)',
  			'rensto-glow-accent': 'var(--rensto-glow-accent)',
  			'rensto-glow-neon': 'var(--rensto-glow-neon)',
  		},
  		animation: {
  			'logo-glow': 'glow 2s ease-in-out infinite alternate',
  			'fade-up': 'fadeUp 0.9s ease-out forwards',
  			'rensto-glow': 'rensto-glow 2s ease-in-out infinite alternate',
  			'rensto-pulse': 'rensto-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'rensto-shimmer': 'rensto-shimmer 2s infinite',
  			'rensto-fadeIn': 'rensto-fadeIn 0.5s ease-out',
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
  			'rensto-glow': {
  				'0%': {
  					boxShadow: 'var(--rensto-glow-accent)'
  				},
  				'100%': {
  					boxShadow: 'var(--rensto-glow-neon)'
  				}
  			},
  			'rensto-pulse': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.5'
  				}
  			},
  			'rensto-shimmer': {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			},
  			'rensto-fadeIn': {
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
