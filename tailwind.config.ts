import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f4f3f0',
          100: '#e8e6df',
          200: '#d1ccbf',
          300: '#b3aa97',
          400: '#93886f',
          500: '#7a6e57',
          600: '#625948',
          700: '#4e473b',
          800: '#433d33',
          900: '#3a352d',
          950: '#1e1b16',
        },
        gold: {
          300: '#fcd877',
          400: '#f5c030',
          500: '#e8a800',
          600: '#c48a00',
          700: '#9d6e00',
        },
        ember: {
          400: '#ff7043',
          500: '#e64a19',
          600: '#bf360c',
        },
        jade: {
          400: '#4caf78',
          500: '#2e7d52',
          600: '#1b5e3b',
        },
        sapphire: {
          400: '#4da6ff',
          500: '#1a7fd4',
          600: '#0d5fa3',
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
export default config
