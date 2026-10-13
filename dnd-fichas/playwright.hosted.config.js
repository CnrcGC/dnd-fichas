import { defineConfig } from "@playwright/test";
import production from "./playwright.production.config.js";

// Valida a origem HTTPS real, sem iniciar servidor local ou tocar fichas do usuário.
export default defineConfig({
  ...production,
  projects: [{
    name: "hosted-chrome",
    use: {
      channel: "chrome",
      viewport: { width: 1280, height: 900 },
      baseURL: "https://cnrcgc.github.io/dnd-fichas/",
    },
  }],
  webServer: undefined,
});
