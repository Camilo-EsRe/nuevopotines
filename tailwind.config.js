/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0c0c0c',
          800: '#141414',
          700: '#1c1c1c',
          600: '#242424',
          500: '#2c2c2c',
        },
        gold: {
          50: '#faf7ee',
          100: '#f5ecd6',
          200: '#ecd9ad',
          300: '#e0c07a',
          400: '#d4ae5e',
          500: '#C4A55A',
          600: '#a88a3f',
          700: '#8a6f33',
          800: '#6d562a',
          900: '#544020',
        },
      },
      fontFamily: {
        fredoka: ['Fredoka', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        gold: '0 10px 40px -10px rgba(196, 165, 90, 0.35)',
        'gold-lg': '0 20px 60px -15px rgba(196, 165, 90, 0.5)',
        card: '0 8px 30px -8px rgba(0, 0, 0, 0.6)',
        'inner-gold': 'inset 0 1px 0 0 rgba(196, 165, 90, 0.2)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        checkPop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        drawCheck: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(196, 165, 90, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(196, 165, 90, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        ring: {
          '0%, 100%': { transform: 'rotate(0)' },
          '10%, 30%': { transform: 'rotate(-12deg)' },
          '20%, 40%': { transform: 'rotate(12deg)' },
          '50%': { transform: 'rotate(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        scaleIn: 'scaleIn 0.4s ease-out forwards',
        slideUp: 'slideUp 0.5s ease-out forwards',
        slideInRight: 'slideInRight 0.4s ease-out forwards',
        checkPop: 'checkPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        drawCheck: 'drawCheck 0.5s ease-out 0.3s forwards',
        shimmer: 'shimmer 2.5s linear infinite',
        pulseGold: 'pulseGold 2s ease-out infinite',
        float: 'float 3s ease-in-out infinite',
        ring: 'ring 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
