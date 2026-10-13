import { defineConfig } from "@playwright/test";
import production from "./playwright.production.config.js";

export default defineConfig({
  ...production,
  testMatch: ["demo.spec.js", "pages.spec.js"],
  projects: [{ name: "pages-chrome", use: { channel: "chrome", viewport: { width: 1280, height: 900 }, baseURL: "http://127.0.0.1:4174/dnd-fichas/" } }],
  webServer: { command: "node scripts/serve-pages.mjs", url: "http://127.0.0.1:4174/dnd-fichas/", reuseExistingServer: false },
});
