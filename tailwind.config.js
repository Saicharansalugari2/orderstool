/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#52a8ec',
        background: '#000000',
        'background-paper': '#1a1a1a',
        'text-primary': '#ffffff',
        'text-secondary': 'rgba(255, 255, 255, 0.7)',
        'status-pending': '#FF9800',
        'status-approved': '#4CAF50',
        'status-shipped': '#2196F3',
        'status-cancelled': '#F44336',
      },
      animation: {
        'pulse-slow': 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
};
