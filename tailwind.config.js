/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        'pixel': ['monospace'],
      },
      colors: {
        'pixel': {
          'bg': '#F5F5DC',
          'primary': '#98FB98',
          'danger': '#FF6B6B',
          'info': '#4ECDC4',
          'warning': '#FFE66D',
          'dark': '#2C3E50',
        }
      },
      animation: {
        'pixel-bounce': 'pixelBounce 0.6s ease-in-out infinite alternate',
        'pixel-pulse': 'pixelPulse 2s ease-in-out infinite',
      },
      keyframes: {
        pixelBounce: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        pixelPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
