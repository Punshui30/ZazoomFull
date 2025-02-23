/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#ff00ff',
        'neon-cyan': '#00ffff',
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        'tech-mono': ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-neon': 'pulse-neon 2s infinite',
        'glitch': 'glitch 0.2s infinite',
        'grid-scroll': 'grid-scroll 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-neon': {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(255, 0, 255, 0.2), inset 0 0 10px rgba(0, 255, 255, 0.1)'
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(255, 0, 255, 0.2)'
          },
        },
        glitch: {
          '0%': { transform: 'translate(0)', color: '#ff00ff' },
          '20%': { transform: 'translate(-2px, 2px)', color: '#00ffff' },
          '40%': { transform: 'translate(-2px, -2px)', color: '#ff00ff' },
          '60%': { transform: 'translate(2px, 2px)', color: '#00ffff' },
          '80%': { transform: 'translate(2px, -2px)', color: '#ff00ff' },
          '100%': { transform: 'translate(0)', color: '#00ffff' },
        },
        'grid-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(50px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': `
          linear-gradient(to right, rgba(255, 0, 255, 0.2) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 255, 255, 0.2) 1px, transparent 1px)
        `,
      },
    },
  },
  plugins: [],
};