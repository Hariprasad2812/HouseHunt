/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1b1a16',
        coal: '#26251f',
        paper: '#f7f4ee',
        sand: '#efeae0',
        linen: '#e7e1d4',
        clay: {
          DEFAULT: '#b0562f',
          deep: '#933f1f',
          soft: '#e8d5c9',
          tint: '#f4e6dc',
        },
        moss: '#5c6644',
        stone: {
          DEFAULT: '#6e6a5f',
          light: '#a39e91',
          faint: '#c6c0b3',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        wide2: '0.18em',
        wide3: '0.3em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(27,26,22,0.04), 0 8px 30px -12px rgba(27,26,22,0.18)',
        lift: '0 2px 4px rgba(27,26,22,0.05), 0 18px 50px -20px rgba(27,26,22,0.3)',
        pop: '0 24px 70px -30px rgba(27,26,22,0.45)',
      },
      maxWidth: {
        shell: '1280px',
      },
    },
  },
  plugins: [],
};
