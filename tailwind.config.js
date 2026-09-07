module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx,scss}",
    "./node_modules/react-advance-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
