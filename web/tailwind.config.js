/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  mode: 'jit',
  theme: {
    extend: {
      colors: {
        textColor: '#000223',
        bgColor: '#F8F9FA85',
        inputBgColor: '#F1F4FA',
        placeholderColor: '#788B9A',
        iconBg: '#e94e1b',
        darkBlue: '#000223',
        darkOrange: '#E94E1B',
        lightOranger: '#FD764E',
        lighterOrange: '#FFE1D8',
        bgGray: '#F7F7F9',
        textGray: '#8A9B9B'
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif']
      }
    }
  }
};