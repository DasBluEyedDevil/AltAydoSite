/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--mg-primary))',
        secondary: 'rgb(var(--mg-secondary))',
        accent: 'rgb(var(--mg-accent))',
        warning: 'rgb(var(--mg-warning))',
        danger: 'rgb(var(--mg-danger))',
        success: 'rgb(var(--mg-success))',
        'mg-dark': 'rgb(var(--mg-dark))',
        'mg-bg': 'rgb(var(--mg-background))',
        'mg-text': 'rgb(var(--mg-text))',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        quantify: ['Quantify', 'sans-serif'],
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'float-slow 12s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'holo-shine': 'holo-shine 8s ease-in-out infinite',
        'holo-scan': 'holo-scan 5s linear infinite',
        'radar-rotate': 'radar-rotate 5s linear infinite',
        'data-stream': 'data-stream 10s linear infinite',
        'text-flicker': 'text-flicker 8s linear infinite',
        'spin-slow': 'spin 15s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': {
            opacity: 1,
            transform: 'scale(1)',
          },
          '50%': {
            opacity: 0.3,
            transform: 'scale(0.5)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '50%': { transform: 'translateY(-15px) rotate(-1deg)' },
        },
        'scan-line': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'holo-shine': {
          '0%, 30%': { left: '-150%' },
          '40%, 100%': { left: '150%' },
        },
        'holo-scan': {
          'from': { transform: 'translateY(-100%)' },
          'to': { transform: 'translateY(100%)' },
        },
        'radar-rotate': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'data-stream': {
          '0%': { opacity: 0, left: '0%' },
          '5%': { opacity: 1 },
          '95%': { opacity: 1 },
          '100%': { opacity: 0, left: '100%' },
        },
        'text-flicker': {
          '0%, 100%': { opacity: 1 },
          '98%': { opacity: 1 },
          '99%': { opacity: 0.8 },
        },
      },
      backgroundImage: {
        'space-gradient': 'radial-gradient(circle at center, #0a1a2e 0%, #050a15 100%)',
        'holo-grid': 'linear-gradient(rgba(var(--mg-grid), 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--mg-grid), 0.1) 1px, transparent 1px)',
        'hexagon-pattern': 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MiIgaGVpZ2h0PSI5MCI+PHBhdGggZD0iTTI2IDNMMSAyOXYzMmwyNSAyNiAyNS0yNlYyOUwyNiAzeiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3ZGZmIiBzdHJva2Utd2lkdGg9Ii41IiBvcGFjaXR5PSIuMSIvPjwvc3ZnPg==")',
      },
      boxShadow: {
        'mg': '0 0 20px 0 rgba(var(--mg-primary), 0.15), inset 0 0 15px 0 rgba(var(--mg-primary), 0.05)',
        'mg-button': '0 0 10px 0 rgba(var(--mg-primary), 0.3)',
        'mg-text': '0 0 5px 0 rgba(var(--mg-primary), 0.5)',
      },
      borderWidth: {
        '1': '1px',
      },
      backdropBlur: {
        'mg': '8px',
      },
      transitionDuration: {
        '2000': '2000ms',
      },
    },
  },
  plugins: [],
} 