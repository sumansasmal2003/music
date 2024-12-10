import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
      ],
  theme: {
    extend: {
      colors: {
        primary: "#1DB954", // Spotify-like green
        secondary: "#121212", // Dark background
        accent: "#282828", // Card and section background
      },
    },
  },
  plugins: [],
} satisfies Config;
