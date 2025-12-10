// zulfaqarhafez/.../postcss.config.mjs
const config = {
  plugins: {
    // This is the correct way to handle Tailwind in a modern Next.js project.
    "@tailwindcss/postcss": {},
    autoprefixer: {},
    // Removed: The conflicting 'tailwindcss: {}' entry
  },
};

export default config;