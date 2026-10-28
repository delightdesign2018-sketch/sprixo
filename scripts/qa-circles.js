import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [1440, 1700, 1920, 2560]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const box = await page.locator('.stat-circle').first().boundingBox();
  console.log(w, JSON.stringify(box));
  await page.screenshot({ path: `qa-circle-${w}.png` });
  await page.close();
}
await browser.close();
