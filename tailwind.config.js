module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    "./dev_gameengine/**/*.{js,jsx,scss}",
    "./src/**/*.{js,jsx,ts,tsx,scss}",
    "./node_modules/react-advance-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
