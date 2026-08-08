/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surfaceHover: "var(--surfaceHover)",
        accent: "#FFC93C",
        accentDim: "#2A2410",
        success: "#34D399",
        danger: "#F87171",
        textPrimary: "var(--textPrimary)",
        textSecondary: "var(--textSecondary)",
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
