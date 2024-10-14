// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Tailwindを適用するファイルパスを指定
  ],
  theme: {
    extend: {},
  },
    plugins: [
      function ({ addComponents }) {
      const responsiveTextSizes = {
        '.app-title': {
            fontSize: '1.25rem', // Default size
            lineHeight: '1.75rem',
            fontWeight: '700', // bold
          '@screen md': {
            fontSize: '1.5rem', // Medium screens
            lineHeight: '2rem',
            fontWeight: '700', // bold
          },
          '@screen lg': {
            fontSize: '2.25rem', // Large screens
            lineHeight: '2.5rem',
            fontWeight: '700', // bold
          },
        },
        '.screen-title': {
          fontSize: '1.125rem', // Default size
          lineHeight: '1.75rem',
          fontWeight: '700', // bold
          '@screen md': {
            fontSize: '1.25rem', // Medium screens
            lineHeight: '1.75rem',
            fontWeight: '700', // bold
          },
          '@screen lg': {
            fontSize: '1.5rem', // Large screens
            lineHeight: '2rem',
            fontWeight: '700', // bold
          },
        },
      };

      addComponents(responsiveTextSizes);
    },
  ],
}
