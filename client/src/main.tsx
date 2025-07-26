import { createRoot } from "react-dom/client";
import TestApp from "./TestApp";

// Remove CSS import that might be causing issues
// import "./index.css";

console.log("🚀 Starting HostPilotPro React application...");

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<TestApp />);
  console.log("✅ React app mounted successfully");
} else {
  console.error("❌ Root element not found");
}
