/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Paleta semantica: violet liturgic retinut + auriu cald pentru accente.
      colors: {
        canvas: '#E8E5EE', // fundalul zonei de previzualizare
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F7FB',
          sunken: '#F2F0F7',
        },
        line: {
          DEFAULT: '#E4E1EC',
          strong: '#CFC9DD',
        },
        ink: {
          DEFAULT: '#221E2E', // 15.2:1 pe alb
          muted: '#5F5873', //  6.4:1 pe alb
          subtle: '#837C97', //  4.0:1 - doar pentru text mare/decorativ
        },
        brand: {
          DEFAULT: '#5B3FA8', // 7.4:1 pe alb
          hover: '#4A3190',
          soft: '#EFEAFA',
        },
        gold: {
          DEFAULT: '#8A5407', // 5.6:1 pe alb
          soft: '#FBF3E4',
        },
        danger: {
          DEFAULT: '#B91C1C',
          soft: '#FEF2F2',
        },
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
    },
  },
  plugins: [],
};
