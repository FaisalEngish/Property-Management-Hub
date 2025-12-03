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

// Button interaction debugging - improved to detect React event handlers
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.querySelectorAll("button").forEach(btn => {
      const hasClickHandler = btn.onclick || 
        btn.getAttribute('onclick') ||
        btn.hasAttribute('data-testid') ||
        btn.closest('form') ||
        btn.type === 'submit' ||
        btn.getAttribute('aria-expanded') !== null; // Dropdown/modal triggers
      
      if (!hasClickHandler && btn.innerText.trim() && !btn.disabled) {
        console.warn(`⚠️ Button may have no action:`, btn.innerText.trim());
      }
    });
  }, 3000); // Wait longer for React to render and attach handlers
});

createRoot(document.getElementById("root")!).render(<App />);
