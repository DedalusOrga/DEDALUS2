import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./app/src/**/*.{ts,tsx,js,jsx,html}"],
  theme: { extend: {} },
  plugins: [typography],
};
