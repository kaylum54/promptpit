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
        // Pure black & white system - Brutalist Arena
        arena: {
          black: '#000000',
          void: '#050505',
          pit: '#0a0a0a',
          ring: '#111111',
          cage: '#1a1a1a',
          steel: '#222222',
          iron: '#333333',
          chrome: '#666666',
          silver: '#999999',
          light: '#cccccc',
          bone: '#e5e5e5',
          white: '#ffffff',
        },
        // Semantic (minimal - mostly B&W)
        winner: '#ffffff',
        loser: '#333333',
        draw: '#666666',
        live: '#ffffff',
        // Keep model colors for differentiation only
        model: {
          claude: '#ffffff',
          gpt: '#cccccc',
          gemini: '#999999',
          llama: '#666666',
        },
      },
      fontFamily: {
        // Brutalist typography
        display: ['"Bebas Neue"', '"Arial Black"', 'Impact', 'sans-serif'],
        body: ['"IBM Plex Mono"', '"JetBrains Mono"', 'Consolas', 'monospace'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Brutalist scale - dramatic headlines, technical body
        'massive': ['120px', { lineHeight: '0.85', fontWeight: '400', letterSpacing: '-0.02em' }],
        'hero': ['72px', { lineHeight: '0.9', fontWeight: '400', letterSpacing: '0.05em' }],
        'title': ['48px', { lineHeight: '1', fontWeight: '400', letterSpacing: '0.08em' }],
        'section': ['32px', { lineHeight: '1.1', fontWeight: '400', letterSpacing: '0.1em' }],
        'heading': ['24px', { lineHeight: '1.2', fontWeight: '400', letterSpacing: '0.12em' }],
        'subhead': ['18px', { lineHeight: '1.3', fontWeight: '400', letterSpacing: '0.15em' }],
        'body': ['14px', { lineHeight: '1.7', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'micro': ['10px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.2em' }],
        'mono-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'mono-md': ['14px', { lineHeight: '1.7', fontWeight: '400' }],
        'mono-sm': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      letterSpacing: {
        'tightest': '-0.04em',
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'normal': '0',
        'wide': '0.05em',
        'wider': '0.1em',
        'widest': '0.15em',
        'ultra': '0.2em',
        'extreme': '0.3em',
      },
      borderRadius: {
        'none': '0',
        'brutal': '2px',
        'sm': '4px',
        'md': '0',
        'lg': '0',
        'xl': '0',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        'content': '1400px',
        'narrow': '900px',
        'input': '720px',
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'none': 'none',
        'brutal': '4px 4px 0 0 #ffffff',
        'brutal-sm': '2px 2px 0 0 #ffffff',
        'brutal-lg': '8px 8px 0 0 #ffffff',
        'brutal-black': '4px 4px 0 0 #000000',
        'brutal-inset': 'inset 4px 4px 0 0 rgba(255,255,255,0.1)',
        'glow-white': '0 0 20px rgba(255,255,255,0.3)',
        'glow-white-lg': '0 0 40px rgba(255,255,255,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 400ms ease-out forwards',
        'fade-in-up': 'fadeInUp 400ms ease-out forwards',
        'slide-up': 'slideUp 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-left': 'slideLeft 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'winner': 'winner 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'typewriter': 'typewriter 0.1s steps(1) forwards',
        'scan': 'scan 2s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'shake': 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        winner: {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(10px)' },
          '50%': { transform: 'scale(1.02) translateY(-5px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        typewriter: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'brutal': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
