/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: {
    enabled: false,
    content: [
      './src/**/*.{html,ts}',
      './app/**/*.{html,ts}',
      './node_modules/flowbite/**/*.js',
    ],
    darkMode: 'class',
    theme: {
      extend: {
        lineHeight: {
          hero: '3.75rem',
        },
        fontFamily: {
          logo: ['"Logo-Font"'],
        },
      },
    },
  },
  plugins: [require('flowbite/plugin')],
};
