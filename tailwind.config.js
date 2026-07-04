/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#FFD54A', // Hover Accent
          500: '#F5B301', // Luxury Golden Yellow
          600: '#FFC107', // Active Accent
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        surface: {
          50: '#1A1A1A',
          100: '#111111',
          200: '#0B0B0B',
          900: '#000000',
        },
        gold: {
          DEFAULT: '#F5B301',
          light: '#FFD54A',
          dark: '#FFC107',
          border: 'rgba(255, 215, 0, 0.12)',
        }
      },
      borderRadius: {
        '2xl': '1rem', // 16px
        '3xl': '1.25rem', // 20px
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(255, 215, 0, 0.15)',
        'gold-soft': '0 2px 8px 0 rgba(255, 215, 0, 0.08)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        }
      }
    },
  },
  plugins: [],
}
