import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        muted: 'var(--color-muted)'
      },
      borderRadius: {
        xl: 'var(--radius-base)'
      },
      fontFamily: {
        sans: ['var(--font-sans)']
      }
    }
  },
  plugins: []
};

export default config;
