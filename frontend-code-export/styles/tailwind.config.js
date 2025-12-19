/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',  // Main brand color
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff9f43',  // Main secondary color (orange)
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        whatsapp: '#25d366',
        text: {
          primary: '#111827',    // gray-900 - WCAG AAA compliant
          secondary: '#4b5563',  // gray-600 - WCAG AA compliant
          tertiary: '#6b7280',   // gray-500
          white: '#ffffff',
        },
        bg: {
          light: '#f9fafb',      // gray-50
          white: '#ffffff',
          primary: '#eff6ff',    // primary-50
          success: '#f0fdf4',    // success-50
          warning: '#fffbeb',    // warning-50
          error: '#fef2f2',      // error-50
        },
        border: {
          light: '#e5e7eb',      // gray-200
          medium: '#d1d5db',     // gray-300
          dark: '#9ca3af',       // gray-400
        },
        // Dark mode colors
        background: {
          light: '#ffffff',
          dark: '#0f172a',       // slate-900
        },
        surface: {
          light: '#f8fafc',      // slate-50
          dark: '#1e293b',       // slate-800
        },
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'cairo': ['Cairo', 'sans-serif'],
        'noto-kufi': ['Noto Kufi Arabic', 'sans-serif'],
        'sans': ['Cairo', 'Noto Kufi Arabic', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      fontSize: {
        'responsive-xs': 'clamp(0.75rem, 2vw, 0.875rem)',
        'responsive-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'responsive-base': 'clamp(1rem, 3vw, 1.125rem)',
        'responsive-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'responsive-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'responsive-2xl': 'clamp(1.5rem, 5vw, 2rem)',
        'responsive-3xl': 'clamp(1.875rem, 6vw, 2.5rem)',
        'responsive-4xl': 'clamp(2.25rem, 7vw, 3rem)',
      },
      lineHeight: {
        'arabic': '1.8', // Better line height for Arabic text
        'relaxed-arabic': '2', // Extra relaxed for Arabic
      },
      screens: {
        'xs': '475px',   // Large mobile
        'sm': '640px',   // Mobile landscape
        'md': '768px',   // Tablet
        'lg': '1024px',  // Desktop
        'xl': '1280px',  // Large desktop
        '2xl': '1536px', // Extra large
        // Custom breakpoints for specific needs
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
      },
      spacing: {
        'xs': '0.25rem',   /* 4px */
        'sm': '0.5rem',    /* 8px */
        'md': '1rem',      /* 16px */
        'lg': '1.5rem',    /* 24px */
        'xl': '2rem',      /* 32px */
        '2xl': '3rem',     /* 48px */
        '3xl': '4rem',     /* 64px */
        '4xl': '6rem',     /* 96px */
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      minHeight: {
        'screen-small': '100svh', // Small viewport height
        'screen-large': '100lvh', // Large viewport height
        'screen-dynamic': '100dvh', // Dynamic viewport height
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      borderRadius: {
        'sm': '0.5rem',     /* 8px - inputs, small cards */
        'md': '0.75rem',    /* 12px - buttons, cards */
        'lg': '1rem',       /* 16px - large cards */
        'xl': '1.5rem',     /* 24px - hero sections */
        'full': '9999px',   /* Full rounded */
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'custom-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'custom-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'custom-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'custom-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-in-out',
        'slideInRight': 'slideInRight 0.6s ease-out',
        'slideInLeft': 'slideInLeft 0.6s ease-out',
        'scaleIn': 'scaleIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}