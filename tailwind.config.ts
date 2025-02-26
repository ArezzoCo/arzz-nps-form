import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}",
    "./extensions/**/**/*.{js, liquid}",
    "./extensions/dynamic-form/assets/dynamic-form.css"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;