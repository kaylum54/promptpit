import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        // Backgrounds
        bg: {
          base: '#09090b',
          surface: '#0f0f12',
          elevated: '#18181b',
          subtle: '#1c1c20',
        },
        // Borders
        border: {
          DEFAULT: '#27272a',
          subtle: '#1f1f23',
          strong: '#3f3f46',
        },
        // Text
        text: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          tertiary: '#71717a',
          muted: '#52525b',
        },
        // Accent
        accent: {
          primary: '#3b82f6',
          hover: '#2563eb',
        },
        // Model colors
        model: {
          claude: '#f59e0b',
          gpt: '#10b981',
          gemini: '#8b5cf6',
          llama: '#06b6d4',
        },
        // Semantic
        success: '#22c55e',
        error: '#ef4444',
        warning: '#eab308',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'page-title': ['32px', { lineHeight: '1.2', fontWeight: '800' }],
        'section-header': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'model-name': ['18px', { lineHeight: '1.3', fontWeight: '700' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'mono-data': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'mono-small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      maxWidth: {
        'content': '1200px',
        'input': '720px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.5)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.6)',
        'glow-accent': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-claude': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-gpt': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-gemini': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-llama': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-success': '0 0 24px rgba(34, 197, 94, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out forwards',
        'winner-reveal': 'winnerReveal 500ms ease-out forwards',
        'streaming-pulse': 'streamingPulse 2s ease-in-out infinite',
        'blink': 'blink 1s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 300ms ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        winnerReveal: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        streamingPulse: {
          '0%, 100%': { borderColor: '#27272a' },
          '50%': { borderColor: 'var(--model-color, #3b82f6)' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px var(--glow-color, rgba(59, 130, 246, 0.3))' },
          '50%': { boxShadow: '0 0 40px var(--glow-color, rgba(59, 130, 246, 0.3))' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
