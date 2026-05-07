/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      /* ── Font Families ── */
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
      },

      /* ── Deep Navy Palette ── */
      colors: {
        navy: {
          DEFAULT: '#060d1e',
          mid: '#0d1f45',
          light: '#16336b',
          card: '#0e1f42',
        },
        royal: '#1a4fd6',
        blue: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          bright: '#60a5fa',
        },
        sky: '#93c5fd',
        ice: '#dbeafe',
        emerald: {
          DEFAULT: '#059669',
          light: '#10b981',
          pale: '#d1fae5',
        },
        amber: {
          DEFAULT: '#d97706',
          light: '#f59e0b',
          pale: '#fef3c7',
        },
        coral: {
          DEFAULT: '#dc2626',
          light: '#ef4444',
          pale: '#fee2e2',
        },
        violet: {
          DEFAULT: '#7c3aed',
          light: '#8b5cf6',
          pale: '#ede9fe',
        },
        surface: '#f8faff',
        'off-white': '#f3f7ff',
        muted: '#94a3b8',
        slate: '#64748b',
        silver: '#cbd5e1',
      },

      /* ── Font Sizes (matching existing design tokens) ── */
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
        xs: ['13px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.6' }],
        base: ['15px', { lineHeight: '1.6' }],
        lg: ['17px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.1' }],
      },

      /* ── Border Radius ── */
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },

      /* ── Shadows (matching existing design tokens) ── */
      boxShadow: {
        xs: '0 1px 2px rgba(6, 13, 30, 0.06)',
        sm: '0 2px 8px rgba(37, 99, 235, 0.08)',
        md: '0 4px 16px rgba(37, 99, 235, 0.10), 0 1px 4px rgba(6, 13, 30, 0.06)',
        lg: '0 8px 32px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(6, 13, 30, 0.06)',
        xl: '0 16px 48px rgba(37, 99, 235, 0.15), 0 4px 16px rgba(6, 13, 30, 0.08)',
        deep: '0 20px 60px rgba(6, 13, 30, 0.6), 0 4px 16px rgba(6, 13, 30, 0.4)',
        card: '0 4px 24px rgba(37, 99, 235, 0.1), 0 1px 4px rgba(6, 13, 30, 0.08)',
        soft: '0 2px 12px rgba(37, 99, 235, 0.12)',
        glow: '0 0 32px rgba(37, 99, 235, 0.25)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.3), 0 0 40px rgba(37, 99, 235, 0.1)',
        'glow-emerald': '0 0 20px rgba(5, 150, 105, 0.3), 0 0 40px rgba(5, 150, 105, 0.1)',
        'glow-amber': '0 0 20px rgba(217, 119, 6, 0.3), 0 0 40px rgba(217, 119, 6, 0.1)',
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.3), 0 0 40px rgba(124, 58, 237, 0.1)',
        'glow-coral': '0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)',
        'lift': '0 8px 25px rgba(6, 13, 30, 0.12), 0 2px 6px rgba(6, 13, 30, 0.06)',
      },

      /* ── Transitions ── */
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },

      /* ── Layout ── */
      width: {
        sidebar: '260px',
        'sidebar-collapsed': '72px',
      },
      height: {
        topbar: '64px',
      },
      spacing: {
        sidebar: '260px',
        'sidebar-collapsed': '72px',
        topbar: '64px',
      },

      /* ── Keyframes ── */
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(100%)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(37, 99, 235, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-out-right': 'slide-out-right 0.2s ease-in forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        shimmer: 'shimmer 2s infinite linear',
        pulse: 'pulse 2s infinite',
        float: 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },

      /* ── Backdrop Blur ── */
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}
