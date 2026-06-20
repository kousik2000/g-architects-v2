/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#111111",
        accent: "#FF6B00",
        background: "#F6F4F1",
        bodyText: "#1A1A1A",
        mutedText: "#7A7A7A",
        surface: "#FFFFFF",
        borderLine: "#E5E5E5",
      },
      fontFamily: {
        headings: ["Syne", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        architectural: "18px",
      },
      boxShadow: {
        architectural: "0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
        architecturalHover: "0 30px 60px -15px rgba(0, 0, 0, 0.1), 0 1px 5px rgba(0, 0, 0, 0.04)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.04)",
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        drift: "drift 8s ease-in-out infinite alternate",
        fadeIn: "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        drift: {
          "0%": { transform: "translateY(0px) rotate(0deg)" },
          "100%": { transform: "translateY(-15px) rotate(1deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}
