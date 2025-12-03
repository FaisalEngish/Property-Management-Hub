import fetch from "node-fetch";
import fs from "fs";

const linksToCheck = [
  "/", "/dashboard", "/tasks", "/users", "/system-hub", "/properties", "/bookings", "/finances"
];

(async () => {
  console.log("🔍 Checking application links...\n");
  
  for (const link of linksToCheck) {
    try {
      const res = await fetch(`http://localhost:5173${link}`);
      if (!res.ok) console.log(`❌ Broken link: ${link} (${res.status})`);
      else console.log(`✅ OK: ${link}`);
    } catch (e) {
      console.log(`⚠️ Error fetching ${link}: ${e.message}`);
    }
  }
  
  console.log("\n🎯 Link check complete!");
})();