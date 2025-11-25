/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {}, // <--- Mudamos de '@tailwindcss/postcss' para 'tailwindcss'
    autoprefixer: {},
  },
};

export default config;