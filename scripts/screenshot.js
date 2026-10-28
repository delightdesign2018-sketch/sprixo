import { chromium } from "playwright";
import fs from "node:fs/promises";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1280", width: 1280, height: 900 },
  { name: "tablet-1024", width: 1024, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-480", width: 480, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-320", width: 320, height: 800 },
];

await fs.mkdir("screenshots", { recursive: true });

const browser = await chromium.launch();

const page = await browser.newPage();

page.on("console", (message) => {
  if (message.type() === "error") {
    console.error(`[Browser Error] ${message.text()}`);
  }
});

page.on("pageerror", (error) => {
  console.error(`[Page Error] ${error.message}`);
});

for (const viewport of viewports) {
  console.log(`Taking screenshot: ${viewport.name} (${viewport.width}x${viewport.height})`);
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `screenshots/${viewport.name}.png`, fullPage: true });
}

await browser.close();
console.log("All screenshots created.");
