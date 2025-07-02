import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("HostPilotPro: Starting React app...");
const rootElement = document.getElementById("root");
console.log("HostPilotPro: Root element found:", !!rootElement);

if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log("HostPilotPro: App rendered successfully");
} else {
  console.error("HostPilotPro: Root element not found!");
}
