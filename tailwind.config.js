/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          dark: '#5B21B6',
          light: '#A78BFA',
          muted: '#EDE9FE',
        },
        accent: {
          DEFAULT: '#E11D74',
          light: '#FBCFE8',
          muted: '#FDF2F8',
          gradient: {
            start: '#C026D3',
            end: '#7C3AED',
          }
        },
        navy: {
          DEFAULT: '#071A52',
          muted: '#0F213B',
        },
        background: {
          DEFAULT: '#FAFAFA',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#F3F4F6',
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-magenta': '0 0 20px rgba(225, 29, 116, 0.28)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 2s infinite',
        'wave': 'wave 0.5s infinite alternate',
      },
      keyframes: {
        wave: {
          '0%': { transform: 'scaleY(1)' },
          '100%': { transform: 'scaleY(1.5)' },
        }
      }
    },
  },
  plugins: [],
}
