import { chromium, devices } from "playwright";
import { writeFileSync, statSync, readdirSync } from "node:fs";
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
  headless: true,
});
const results = [];
for (const mobile of [false, true]) {
  const page = await browser.newPage(
    mobile ? devices["iPhone 13"] : { viewport: { width: 1512, height: 1000 } },
  );
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.DEMO_URL || "http://127.0.0.1:4173");
  await page.waitForFunction(() => window.pixelNoel?.ready);
  const result = await page.evaluate(async () => {
    const frames = [];
    let prev = performance.now();
    for (let i = 0; i < 180; i++)
      await new Promise((resolve) =>
        requestAnimationFrame((t) => {
          frames.push(t - prev);
          prev = t;
          resolve();
        }),
      );
    frames.shift();
    const ordered = [...frames].sort((a, b) => a - b);
    const resources = performance
      .getEntriesByType("resource")
      .filter((r) => r.name.startsWith(location.origin));
    return {
      userAgent: navigator.userAgent,
      canvas: [1200, 800],
      viewport: [innerWidth, innerHeight],
      assetReadyMs: Math.round(window.pixelNoel.readyAt),
      meanFps:
        Math.round(
          (1000 / (frames.reduce((a, b) => a + b, 0) / frames.length)) * 10,
        ) / 10,
      p95FrameMs:
        Math.round(ordered[Math.floor(ordered.length * 0.95)] * 10) / 10,
      rendererFps: window.pixelNoel.fps,
      resourceBytes: resources.reduce((a, b) => a + b.transferSize, 0),
      resources: resources.map((r) => ({
        url: r.name,
        transferBytes: r.transferSize,
      })),
      items: window.pixelNoel.scene.items.length,
    };
  });
  results.push({
    profile: mobile
      ? "mobile viewport emulation (same host CPU/GPU)"
      : "desktop",
    ...result,
    errors,
  });
  await page.close();
}
const files = [];
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = dir + "/" + e.name;
    if (e.isDirectory()) walk(p);
    else files.push({ path: p, bytes: statSync(p).size });
  }
}
walk("dist");
writeFileSync(
  "docs/performance.json",
  JSON.stringify(
    {
      recordedAt: new Date().toISOString(),
      note: "Headless Chrome on development Mac; mobile profile is viewport emulation, not physical handset hardware. FPS sampled over 179 RAF intervals. assetReadyMs measures decoded default assets and local scene restoration before animation starts.",
      buildFiles: files,
      totalBuildBytes: files.reduce((a, b) => a + b.bytes, 0),
      results,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    results.map(({ resources, userAgent, ...r }) => r),
    null,
    2,
  ),
);
await browser.close();
