import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 1512, height: 1000 },
  deviceScaleFactor: 1,
});
page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await page.goto("http://127.0.0.1:5173");
await page.waitForFunction(() => window.pixelNoel?.ready);
await page.screenshot({ path: "docs/screenshots/desktop.png", fullPage: true });
console.log(
  await page.evaluate(() => ({
    ready: window.pixelNoel.ready,
    items: window.pixelNoel.scene.items.length,
    resources: performance
      .getEntriesByType("resource")
      .map((x) => ({ name: x.name, bytes: x.transferSize })),
  })),
);
await browser.close();
