import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        brand: {
          primary: '#1e40af', // blue-800
          secondary: '#f59e0b', // amber-500
          accent: '#06b6d4', // cyan-500
        },
        status: {
          success: '#10b981', // emerald-500
          error: '#ef4444', // red-500
          warning: '#f97316', // orange-500
        },
        neutral: {
          950: '#0f172a', // slate-900 - Deep space
          900: '#1e293b', // slate-800 - Dark charcoal
          800: '#334155', // slate-700 - Medium charcoal
          700: '#475569', // slate-600 - Light charcoal
          600: '#64748b', // slate-500 - Cool gray
          500: '#94a3b8', // slate-400 - Medium gray
          400: '#cbd5e1', // slate-300 - Light gray
          300: '#e2e8f0', // slate-200 - Very light gray
          200: '#f1f5f9', // slate-100 - Off white
          100: '#f8fafc', // slate-50 - Near white
          50: '#ffffff', // Pure white
        },
        surface: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          elevated: '#ffffff',
          overlay: 'rgba(15, 23, 42, 0.8)',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        ghost: {
          DEFAULT: 'hsl(var(--ghost))',
          foreground: 'hsl(var(--ghost-foreground))',
        },
        'ghost-hover': {
          DEFAULT: 'hsl(var(--ghost-hover))',
          foreground: 'hsl(var(--ghost-hover-foreground))',
        },
        link: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.1)',
        premium:
          '0 20px 25px -5px rgba(30, 58, 138, 0.1), 0 10px 10px -5px rgba(245, 158, 11, 0.04)',
        futuristic: '0 8px 32px rgba(30, 64, 175, 0.12), 0 4px 16px rgba(6, 182, 212, 0.08)',
        'card-modern': '0 4px 24px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
