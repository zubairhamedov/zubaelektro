/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0F1420",
        surface: "#1A2133",
        surfaceHover: "#212A40",
        accent: "#FFC93C",
        accentDim: "#2A2410",
        success: "#34D399",
        danger: "#F87171",
        textPrimary: "#F5F7FA",
        textSecondary: "#8A93A6",
      },
      fontFamily: {
        display: [
          "-apple-system",
          "SF Pro Display",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        body: ["Inter", "-apple-system", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "22px",
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
