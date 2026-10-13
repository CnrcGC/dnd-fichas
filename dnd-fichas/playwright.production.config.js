import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";
export default defineConfig({
  ...base,
  testDir: "./tests-release",
  testMatch: "demo.spec.js",
  workers: 1,
  // Cada ensaio inclui impressão e round trip em duas sessões; assertions mantêm 5 s.
  timeout: 60000,
  projects: [{ name: "production-chrome", use: { channel: "chrome", viewport: { width: 1280, height: 900 } } }],
  webServer: { ...base.webServer, command: "npm run preview -- --host 127.0.0.1 --port 4173" },
});
