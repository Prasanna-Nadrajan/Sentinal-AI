/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        'bg-deep': '#03050a',
        'bg-surface': '#0a0f1e',
        'bg-card': '#111827',
        'bg-card-hover': '#1a2332',
        'border': '#1e293b',
        'border-glow': '#334155',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
        'accent-cyan': '#22d3ee',
        'accent-blue': '#3b82f6',
        'accent-purple': '#a855f7',
        'accent-emerald': '#10b981',
        'accent-rose': '#f43f5e',
        'accent-amber': '#f59e0b',
        'accent-sky': '#38bdf8',
      },
    },
  },
  plugins: [],
}
