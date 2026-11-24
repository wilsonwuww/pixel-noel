import { test, expect } from "@playwright/test";
const state = (page) => page.evaluate(() => window.pixelNoel.scene);
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.pixelNoel?.ready);
});
test("complete default scene, responsive layout, no page errors", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await expect(page.locator("#scene")).toBeVisible();
  expect((await state(page)).items.length).toBeGreaterThan(25);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: `docs/screenshots/${info.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("add, recolor, rotate, duplicate, delete and undo ornament", async ({
  page,
}) => {
  const n = (await state(page)).items.length;
  await page.getByTitle("添加圣诞球").click();
  expect((await state(page)).items.length).toBe(n + 1);
  await page.getByLabel("挂饰颜色", { exact: true }).fill("#448899");
  await page.getByRole("button", { name: "复制", exact: true }).click();
  expect((await state(page)).items.length).toBe(n + 2);
  await page.getByRole("button", { name: "删除", exact: true }).click();
  expect((await state(page)).items.length).toBe(n + 1);
  await page.getByLabel("撤销", { exact: true }).evaluate((el) => el.click());
  expect((await state(page)).items.length).toBe(n + 2);
});
test("bare tree clears independent decorations; undo and redo restore exact state", async ({
  page,
}) => {
  const before = await state(page);
  await page.getByRole("button", { name: "从一棵裸树开始" }).click();
  await page.getByRole("button", { name: "确认", exact: true }).click();
  let s = await state(page);
  expect(s.paths).toHaveLength(0);
  expect(s.items.filter((o) => o.kind === "ornament")).toHaveLength(0);
  await page.getByLabel("撤销", { exact: true }).evaluate((el) => el.click());
  s = await state(page);
  expect(s.items).toEqual(before.items);
  expect(s.paths).toEqual(before.paths);
  await page.getByLabel("重做", { exact: true }).evaluate((el) => el.click());
  expect((await state(page)).paths).toHaveLength(0);
});
test("freehand light path and ribbon are independent editable paths", async ({
  page,
}) => {
  const n = (await state(page)).paths.length;
  await page.getByLabel("灯带与丝带", { exact: true }).click();
  await page.getByRole("button", { name: "绘制一条灯带", exact: true }).click();
  await page.waitForTimeout(600);
  await page.locator("#scene").scrollIntoViewIfNeeded();
  const b = await page.locator("#scene").boundingBox();
  await page.mouse.move(b.x + b.width * 0.47, b.y + b.height * 0.45);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.56, b.y + b.height * 0.5, {
    steps: 18,
  });
  await page.mouse.up();
  expect((await state(page)).paths.length).toBe(n + 1);
  const last = (await state(page)).paths.at(-1);
  await page.getByLabel("选择灯带或丝带").selectOption(last.id);
  await page.getByLabel("灯光模式").selectOption("alternate");
  expect((await state(page)).paths.at(-1).mode).toBe("alternate");
  await page.getByRole("button", { name: "删除此段路径" }).click();
  expect((await state(page)).paths.length).toBe(n);
});
test("furniture drag obeys indoor floor and is undoable", async ({ page }) => {
  await page.getByLabel("家具布置", { exact: true }).click();
  await page.locator('[data-furniture="2"]').click();
  const before = (await state(page)).items.at(-1);
  await page.locator("#scene").scrollIntoViewIfNeeded();
  const b = await page.locator("#scene").boundingBox();
  await page.mouse.move(
    b.x + (before.x / 1200) * b.width,
    b.y + ((before.y - 50) / 800) * b.height,
  );
  await page.mouse.down();
  await page.mouse.move(
    b.x + ((before.x + 90) / 1200) * b.width,
    b.y + ((before.y - 20) / 800) * b.height,
    { steps: 10 },
  );
  await page.mouse.up();
  const after = (await state(page)).items.at(-1);
  expect(after.x).toBeGreaterThan(before.x + 50);
  expect(after.y).toBeGreaterThanOrEqual(620);
  await page.getByLabel("撤销", { exact: true }).evaluate((el) => el.click());
  expect((await state(page)).items.at(-1).x).toBe(before.x);
});
test("workshop pixels, undo and export into shared scene", async ({ page }) => {
  await page.getByLabel("像素创作工坊", { exact: true }).click();
  const c = page.locator("#pixel-canvas"),
    b = await c.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.75, b.y + b.height * 0.65, {
    steps: 10,
  });
  await page.mouse.up();
  const n = (await state(page)).items.length;
  await page.getByRole("button", { name: "挂到圣诞树", exact: true }).click();
  expect((await state(page)).items.length).toBe(n + 1);
  expect((await state(page)).items.at(-1).data).toMatch(
    /^data:image\/png;base64,/,
  );
});
test("theme preserves layout; auto save survives reload", async ({ page }) => {
  const before = await state(page);
  await page.locator('[data-theme="winter"]').click();
  await expect
    .poll(async () => await page.locator("#save-status").textContent())
    .toContain("已保存");
  await page.reload();
  await page.waitForFunction(() => window.pixelNoel?.ready);
  const after = await state(page);
  expect(after.theme).toBe("winter");
  expect(after.items.map((o) => [o.x, o.y])).toEqual(
    before.items.map((o) => [o.x, o.y]),
  );
});
test("configuration roundtrip, invalid configuration rejection, PNG screenshot", async ({
  page,
}) => {
  await page.getByLabel("作品管理", { exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出作品配置" }).click();
  const download = await downloadPromise;
  const file = await download.path();
  const before = await state(page);
  await page.locator("#config-file").setInputFiles(file);
  expect((await state(page)).items).toEqual(before.items);
  await page.locator("#config-file").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1}'),
  });
  await expect(page.locator(".toast")).toContainText("不是有效");
  const shot = page.waitForEvent("download");
  await page.getByRole("button", { name: "保存小屋画面" }).click();
  expect((await shot).suggestedFilename()).toBe("pixel-noel.png");
});
test("Cozy mode shares state and exits; environment and companions", async ({
  page,
}) => {
  await page.getByLabel("氛围设置", { exact: true }).click();
  await page.getByRole("button", { name: "为冬夜放一朵烟花" }).click();
  await page.getByLabel("室内伙伴", { exact: true }).click();
  await page.getByLabel("小屋宠物").selectOption("dog");
  expect((await state(page)).env.pet).toBe("dog");
  const before = await state(page);
  await page.locator('[data-mode="cozy"]').click();
  await expect(page.locator("body")).toHaveClass("cozy");
  await expect(page.locator("#panel")).toBeHidden();
  await page.locator("#exit-cozy").click();
  expect((await state(page)).items).toEqual(before.items);
});
test("tree controls preserve decoration and repeated slider gestures undo separately", async ({
  page,
}) => {
  await page.locator('[data-tab="tree"]').click();
  const slider = page.getByLabel("树体高度", { exact: true });
  const before = (await state(page)).tree.height;
  await slider.focus();
  await slider.press("ArrowLeft");
  const next = (await state(page)).tree.height;
  expect(next).toBeLessThan(before);
  await slider.press("ArrowLeft");
  expect((await state(page)).tree.height).toBeLessThan(next);
  await page.getByLabel("撤销", { exact: true }).evaluate((el) => el.click());
  expect((await state(page)).tree.height).toBe(next);
  await page.getByLabel("撤销", { exact: true }).evaluate((el) => el.click());
  expect((await state(page)).tree.height).toBe(before);
});
test("24 furniture definitions load cleanly; wall ornament uses a wall anchor", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.getByLabel("家具布置", { exact: true }).click();
  await expect(page.locator("[data-furniture]")).toHaveCount(22);
  await page.locator('[data-furniture="15"]').click();
  expect((await state(page)).items.at(-1).y).toBeLessThan(550);
  await page.waitForTimeout(200);
  expect(errors).toEqual([]);
});
test("original PNG remains in reusable library after its scene copy is removed", async ({
  page,
}) => {
  const data = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const x = c.getContext("2d");
    x.fillStyle = "#b84838";
    x.fillRect(2, 2, 12, 12);
    return c.toDataURL().split(",")[1];
  });
  await page.locator("#png-file").setInputFiles({
    name: "own-art.png",
    mimeType: "image/png",
    buffer: Buffer.from(data, "base64"),
  });
  await expect.poll(async () => (await state(page)).creations.length).toBe(1);
  await page.getByRole("button", { name: "删除", exact: true }).click();
  expect((await state(page)).creations).toHaveLength(1);
  await page.locator("[data-creation]").click();
  expect((await state(page)).items.at(-1).kind).toBe("custom");
});
test("touch dragging updates ornament position on phone", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "mobile", "Touch-specific mobile check");
  await page.getByTitle("添加圣诞球").click();
  await page.locator("#scene").scrollIntoViewIfNeeded();
  const b = await page.locator("#scene").boundingBox(),
    o = (await state(page)).items.at(-1);
  const cdp = await page.context().newCDPSession(page);
  const x = b.x + (o.x / 1200) * b.width,
    y = b.y + (o.y / 800) * b.height;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 6; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + i * 2, y: y + i }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect((await state(page)).items.at(-1).x).toBeGreaterThan(o.x + 10);
});
test("independent spruce preset loads on demand and keeps decorations", async ({
  page,
}) => {
  const before = await state(page);
  await page.locator('[data-tab="tree"]').click();
  await page.getByLabel("独立树型").selectOption("spruce");
  await expect.poll(async () => (await state(page)).tree.preset).toBe("spruce");
  expect((await state(page)).items).toEqual(before.items);
  await page.getByLabel("撤销", { exact: true }).evaluate((el) => el.click());
  expect((await state(page)).tree.preset).toBe("fir");
});
test("ribbon drawing saves width and palette separately from lights", async ({
  page,
}) => {
  await page.getByLabel("灯带与丝带", { exact: true }).click();
  await page.getByRole("button", { name: "绘制一条丝带", exact: true }).click();
  await page.locator("#scene").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const b = await page.locator("#scene").boundingBox();
  await page.mouse.move(b.x + b.width * 0.48, b.y + b.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.57, b.y + b.height * 0.56, {
    steps: 20,
  });
  await page.mouse.up();
  const p = (await state(page)).paths.at(-1);
  expect(p.type).toBe("ribbon");
  await page.getByLabel("选择灯带或丝带").selectOption(p.id);
  await expect(page.getByLabel("丝带宽度")).toBeVisible();
});
test("pixel workshop fill, eraser, picker, undo, redo and transparent PNG export", async ({
  page,
}) => {
  await page.getByLabel("像素创作工坊", { exact: true }).click();
  await page.getByRole("button", { name: "填色", exact: true }).click();
  const c = page.locator("#pixel-canvas");
  await c.click({ position: { x: 55, y: 55 } });
  const alpha = () =>
    c.evaluate((c) => c.getContext("2d").getImageData(5, 5, 1, 1).data[3]);
  expect(await alpha()).toBe(255);
  await page.getByRole("button", { name: "橡皮", exact: true }).click();
  await c.click({ position: { x: 55, y: 55 } });
  expect(await alpha()).toBe(0);
  await page.locator("#pixel-undo").click();
  expect(await alpha()).toBe(255);
  await page.locator("#pixel-redo").click();
  expect(await alpha()).toBe(0);
  await page.getByRole("button", { name: "取色", exact: true }).click();
  await c.click({ position: { x: 80, y: 80 } });
  await expect(page.locator("#pixel-color")).toHaveValue("#c35743");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 PNG", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("pixel-noel-original.png");
});
