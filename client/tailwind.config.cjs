module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background, #ffffff)",
        foreground: "var(--foreground, #0f172a)",
        border: "var(--border, rgba(0,0,0,0.08))",
        muted: "var(--muted, #6b7280)",
        primary: "var(--primary, #0ea5e9)",
      },
    },
  },
  plugins: [],
};
