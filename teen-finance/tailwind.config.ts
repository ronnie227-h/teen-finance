import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // <-- 重要！
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
