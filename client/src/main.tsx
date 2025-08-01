import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error tracking for debugging
window.addEventListener("error", (event) => {
  console.error("🚨 JS Error:", event.message, "at", event.filename, ":", event.lineno);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("🚨 Unhandled Promise Rejection:", event.reason);
});

createRoot(document.getElementById("root")!).render(<App />);
