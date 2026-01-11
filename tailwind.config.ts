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
        // Backgrounds - more layered
        bg: {
          base: '#050507',
          surface: '#0a0a0c',
          elevated: '#111113',
          subtle: '#161618',
          accent: '#1a1a1f',
        },
        // Borders - sharper
        border: {
          DEFAULT: '#222225',
          subtle: '#1a1a1d',
          strong: '#333338',
          glow: 'rgba(255, 255, 255, 0.08)',
        },
        // Text - high contrast
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a8',
          tertiary: '#606068',
          muted: '#404045',
        },
        // Accent - subtle white/silver glow
        accent: {
          primary: '#3b82f6',
          hover: '#2563eb',
          glow: 'rgba(255, 255, 255, 0.05)',
          'glow-strong': 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.12)',
        },
        // Model colors - slightly more saturated
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
        'page-title': ['32px', { lineHeight: '1.2', fontWeight: '800', letterSpacing: '-0.02em' }],
        'section-header': ['24px', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.02em' }],
        'model-name': ['15px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '0.01em' }],
        'body': ['15px', { lineHeight: '1.65', fontWeight: '400' }],
        'body-small': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'label': ['11px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.1em' }],
        'mono-data': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'mono-small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'wide': '0.01em',
        'wider': '0.05em',
        'widest': '0.1em',
        'ultra-wide': '0.15em',
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
        'xl': '0 12px 32px rgba(0, 0, 0, 0.7)',
        // Glow shadows
        'glow-sm': '0 0 10px rgba(255, 255, 255, 0.05)',
        'glow-md': '0 0 20px rgba(255, 255, 255, 0.08)',
        'glow-lg': '0 0 30px rgba(255, 255, 255, 0.1)',
        // Model glows
        'glow-accent': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-claude': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-gpt': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-gemini': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-llama': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-success': '0 0 24px rgba(34, 197, 94, 0.4)',
        // Card shadows
        'card': '0 0 20px rgba(0, 0, 0, 0.5)',
        'card-hover': 'inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 0 20px rgba(0, 0, 0, 0.5)',
        // Button shadows
        'btn': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'btn-hover': '0 4px 12px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'card-gradient': 'linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)',
        'card-gradient-v': 'linear-gradient(180deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out forwards',
        'fade-in-up': 'fadeInUp 300ms ease-out forwards',
        'winner-reveal': 'winnerReveal 500ms ease-out forwards',
        'streaming-pulse': 'streamingPulse 2s ease-in-out infinite',
        'border-pulse': 'borderPulse 2s ease-in-out infinite',
        'blink': 'blink 1s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 300ms ease-out forwards',
        'slide-in-up': 'slideInUp 300ms ease-out forwards',
        'scale-in': 'scaleIn 200ms ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        winnerReveal: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        streamingPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        borderPulse: {
          '0%, 100%': { boxShadow: '0 0 0 1px var(--model-color), 0 0 20px rgba(var(--model-color-rgb), 0.1)' },
          '50%': { boxShadow: '0 0 0 1px var(--model-color), 0 0 30px rgba(var(--model-color-rgb), 0.2)' },
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
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
