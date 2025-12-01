// scripts/copy-client.js
import { rmSync, mkdirSync, cpSync } from "fs";
import path from "path";

const src = path.resolve(process.cwd(), "client", "dist");
const dest = path.resolve(process.cwd(), "server", "public");

// remove old public folder
rmSync(dest, { recursive: true, force: true });

// recreate public folder
mkdirSync(dest, { recursive: true });

// copy dist → public (recursive, overwrite)
cpSync(src, dest, { recursive: true });

console.log("Copied client/dist → server/public");
