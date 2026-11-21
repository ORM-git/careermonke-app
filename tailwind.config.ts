import type { Config } from "tailwindcss";
export default {
  content: { relative: true, files: ["./src/**/*.{ts,tsx}"] },
  theme: {
    extend: {
      colors: { accent: { DEFAULT: "#2563EB", hover: "#1D4ED8", tint: "#EFF6FF" }, ink: "#0A0A0A", line: "#E5E7EB" },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
