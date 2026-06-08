/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          magenta: '#FF1F8E',
          purple: '#8B1FCC',
          red: '#FF2200',
          orange: '#FF6B1A',
          amber: '#FFB800',
        },
        primary: '#FF1F8E',
        surface: '#F8F7FF',
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Poppins_400Regular'],
        medium: ['Poppins_500Medium'],
        semibold: ['Poppins_600SemiBold'],
        bold: ['Poppins_700Bold'],
        extrabold: ['Poppins_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
