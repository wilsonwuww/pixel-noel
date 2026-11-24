import { loadManifest, furnitureAssets } from "./assets";
import { furnitureNames } from "./model";
import type { Item, Scene, Path } from "./model";
export const images: Record<string, HTMLImageElement> = {};
export async function ensureImage(n: string) {
  if (images[n]) return;
  const i = new Image();
  i.src = `${import.meta.env.BASE_URL}assets/${n === "tree" ? "trees" : n === "furniture2" ? "furniture" : n}/${n}.webp`;
  await i.decode();
  images[n] = i;
}
export async function ensureFurnitureArt(ids?: string[]) {
  await Promise.all(
    [
      ...new Set(
        furnitureAssets
          .filter((a) => !ids || ids.includes(a.id))
          .map((a) => a.image),
      ),
    ].map(ensureImage),
  );
}
export async function loadArt() {
  const assets = await loadManifest();
  furnitureNames.splice(0, furnitureNames.length, ...assets.map((a) => a.name));
  await Promise.all(
    ["room", "tree", "furniture", "ornaments", "pets"].map(ensureImage),
  );
}

export function pixelOrnament(
  c: CanvasRenderingContext2D,
  kind: number,
  color: string,
) {
  if (images.ornaments) {
    const sprite = ornamentSprite(kind, color);
    c.drawImage(sprite, 0, 0, 24, 28);
    return;
  }
  const r = (x: number, y: number, w: number, h: number, col: string) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  r(11, 0, 2, 4, "#cba65f");
  r(10, 3, 4, 2, "#f3cf7e");
  const cream = "#f6e5ba",
    dark = "#653a2e",
    gold = "#e4b357";
  switch (kind) {
    case 0:
      r(7, 6, 10, 2, dark);
      r(4, 9, 16, 11, dark);
      r(7, 7, 10, 16, color);
      r(5, 10, 14, 10, color);
      r(7, 9, 3, 5, cream);
      r(15, 13, 3, 7, "#773e38");
      r(8, 21, 9, 2, gold);
      break;
    case 1:
      r(2, 6, 8, 11, color);
      r(14, 6, 8, 11, color);
      r(5, 8, 4, 5, cream);
      r(15, 8, 4, 5, gold);
      r(10, 10, 4, 7, gold);
      r(7, 17, 4, 8, color);
      r(14, 17, 4, 8, color);
      break;
    case 2:
      r(8, 6, 8, 3, gold);
      r(6, 9, 12, 11, color);
      r(4, 19, 16, 3, gold);
      r(11, 22, 3, 3, dark);
      r(7, 10, 2, 8, cream);
      break;
    case 3:
      c.fillStyle = color;
      for (let i = 0; i < 6; i++) {
        c.save();
        c.translate(12, 14);
        c.rotate((i * Math.PI) / 3);
        r(-1, -11, 2, 11, color);
        r(-4, -8, 8, 2, color);
        c.restore();
      }
      r(10, 12, 4, 4, cream);
      break;
    case 4:
      r(8, 5, 8, 8, color);
      r(3, 13, 18, 5, color);
      r(8, 12, 8, 9, color);
      r(5, 20, 5, 6, color);
      r(14, 20, 5, 6, color);
      r(10, 8, 1, 2, cream);
      r(14, 8, 1, 2, cream);
      r(11, 16, 2, 2, cream);
      r(11, 20, 2, 2, cream);
      break;
    case 5:
      r(4, 11, 15, 8, color);
      r(17, 5, 5, 11, color);
      r(2, 8, 7, 6, color);
      r(6, 18, 3, 5, dark);
      r(15, 18, 3, 5, dark);
      r(2, 24, 20, 2, gold);
      r(19, 7, 1, 2, dark);
      break;
    case 6:
      star(c, 12, 15, 11, color);
      break;
    case 7:
      r(4, 13, 16, 12, color);
      for (let j = 0; j < 8; j++) r(3 + j, 12 - j, 18 - j * 2, 2, dark);
      r(8, 15, 7, 6, gold);
      r(11, 15, 1, 6, cream);
      r(8, 18, 7, 1, cream);
      break;
    case 8:
      for (let j = 0; j < 5; j++) r(13, 8 + j * 4, 4, 4, j % 2 ? color : cream);
      r(7, 4, 10, 4, cream);
      r(5, 6, 4, 8, color);
      r(9, 4, 4, 4, color);
      break;
    case 9:
      r(6, 7, 12, 2, dark);
      r(5, 22, 14, 2, dark);
      r(7, 9, 10, 13, color);
      r(9, 11, 6, 9, gold);
      r(11, 13, 2, 6, cream);
      r(6, 8, 2, 14, dark);
      r(16, 8, 2, 14, dark);
      break;
    case 10:
      for (let i = 0; i < 5; i++) {
        r(7 - (i % 2) * 2, 6 + i * 3, 10 + (i % 2) * 4, 3, color);
        r(9 + (i % 2) * 2, 6 + i * 3, 3, 2, gold);
      }
      r(9, 21, 6, 3, dark);
      break;
    default:
      r(3, 8, 8, 9, color);
      r(13, 8, 8, 9, color);
      r(6, 14, 12, 6, color);
      r(9, 19, 6, 4, color);
      r(6, 9, 3, 3, cream);
  }
}
export function star(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  col: string,
) {
  c.fillStyle = col;
  c.beginPath();
  for (let j = 0; j < 10; j++) {
    const a = -Math.PI / 2 + (j * Math.PI) / 5,
      d = j % 2 ? r * 0.43 : r;
    c.lineTo(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d));
  }
  c.closePath();
  c.fill();
  c.fillStyle = "#fff0b9";
  c.fillRect(x - 2, y - r * 0.6, 3, r * 0.6);
}
export function ornamentThumb(kind: number, color = "#c35b47") {
  const c = document.createElement("canvas");
  c.width = 48;
  c.height = 56;
  const x = c.getContext("2d")!;
  x.scale(2, 2);
  pixelOrnament(x, kind, color);
  return c.toDataURL();
}
const ornamentCache = new Map<string, HTMLCanvasElement>();
function ornamentSprite(kind: number, color: string) {
  const key = kind + color;
  if (ornamentCache.has(key)) return ornamentCache.get(key)!;
  const c = document.createElement("canvas");
  c.width = 112;
  c.height = 128;
  const ctx = c.getContext("2d")!,
    i = images.ornaments,
    w = i.width / 4,
    h = i.height / 3;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    i,
    (kind % 4) * w,
    Math.floor(kind / 4) * h,
    w,
    h,
    0,
    0,
    112,
    128,
  );
  if (
    ![
      "#be4b3e",
      "#b94739",
      "#e9bf66",
      "#b94b40",
      "#e8c582",
      "#42705a",
    ].includes(color)
  ) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = 0.48;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 112, 128);
  }
  ornamentCache.set(key, c);
  return c;
}
export function furnitureThumb(kind: number) {
  if (!images[furnitureAssets[kind].image]) return "";
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const x = c.getContext("2d")!;
  const [sx, sy, w, h] = furnitureAssets[kind].frame;
  const r = Math.min(116 / w, 116 / h);
  x.drawImage(
    images[furnitureAssets[kind].image],
    sx,
    sy,
    w,
    h,
    (128 - w * r) / 2,
    (128 - h * r) / 2,
    w * r,
    h * r,
  );
  return c.toDataURL();
}
const custom = new Map<string, HTMLImageElement>();
export class Renderer {
  c: CanvasRenderingContext2D;
  time = 0;
  fps = 0;
  frames = 0;
  last = 0;
  zoom = 1;
  targetZoom = 1;
  selected: string | null = null;
  drawing: Path | null = null;
  fireworks: { x: number; y: number; age: number; color: string }[] = [];
  lastAuto = 0;
  private treeCache = "";
  private treeCanvas = document.createElement("canvas");
  constructor(
    public canvas: HTMLCanvasElement,
    public getScene: () => Scene,
  ) {
    this.c = canvas.getContext("2d")!;
    canvas.width = 1200;
    canvas.height = 800;
  }
  point(e: PointerEvent) {
    const b = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - b.left) * 1200) / b.width,
      y = ((e.clientY - b.top) * 800) / b.height;
    return { x: (x - 630) / this.zoom + 630, y: (y - 390) / this.zoom + 390 };
  }
  firework() {
    const s = this.getScene();
    this.fireworks.push({
      x: 90 + Math.random() * 235,
      y: 90 + Math.random() * 170,
      age: 0,
      color: s.env.fireworkColor,
    });
  }
  start() {
    const tick = (t: number) => {
      if (!document.hidden) {
        const dt = Math.min(50, t - this.time || 16);
        this.time = t;
        this.zoom += (this.targetZoom - this.zoom) * 0.12;
        this.draw(dt);
        this.frames++;
        if (t - this.last > 1000) {
          this.fps = Math.round((this.frames * 1000) / (t - this.last));
          this.frames = 0;
          this.last = t;
        }
      } else this.time = t;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  transform(c: CanvasRenderingContext2D) {
    c.translate(630, 390);
    c.scale(this.zoom, this.zoom);
    c.translate(-630, -390);
  }
  renderTree(s: Scene) {
    const key = JSON.stringify(s.tree);
    if (this.treeCache !== key) {
      this.treeCache = key;
      const c = this.treeCanvas;
      c.width = 600;
      c.height = 680;
      const x = c.getContext("2d")!;
      x.imageSmoothingEnabled = false;
      const hue = parseInt(s.tree.color.slice(1, 3), 16);
      x.filter = `hue-rotate(${(hue - 40) * 1.5}deg) saturate(${0.6 + s.tree.density * 0.5})`;
      x.drawImage(
        images[s.tree.preset === "spruce" ? "spruce" : "tree"],
        300 - s.tree.width / 2,
        660 - s.tree.height,
        s.tree.width,
        s.tree.height,
      );
      x.filter = "none";
      if (s.tree.snow > 0) {
        x.globalCompositeOperation = "source-atop";
        for (let j = 0; j < s.tree.snow * 3; j++) {
          const q = Math.sin(j * 31.8) * 0.5 + 0.5,
            r = Math.sin(j * 72.1) * 0.5 + 0.5;
          x.fillStyle = j % 2 ? "#e4e4cd" : "#baccc7";
          x.fillRect(q * 500, 100 + r * 470, 5 + (j % 5), 2);
        }
        x.globalCompositeOperation = "source-over";
      }
    }
    this.c.drawImage(this.treeCanvas, 330, -10);
  }
  itemBounds(o: Item) {
    if (o.kind === "ornament") return { w: 29 * o.scale, h: 34 * o.scale };
    if (o.kind === "custom") return { w: 65 * o.scale, h: 65 * o.scale };
    const size = this.size(o);
    return { w: size.w * o.scale, h: size.h * o.scale };
  }
  size(o: Item) {
    const asset = furnitureAssets[Number(o.asset)];
    return asset ? { w: asset.size[0], h: asset.size[1] } : { w: 150, h: 150 };
  }
  drawItem(o: Item) {
    const c = this.c,
      b = this.itemBounds(o);
    c.save();
    c.translate(o.x, o.y);
    if (o.kind === "ornament") {
      c.rotate((o.rotation * Math.PI) / 180);
      c.scale(o.scale, o.scale);
      c.translate(-12, -14);
      pixelOrnament(c, Number(o.asset), o.color);
    } else if (o.kind === "custom") {
      let i = custom.get(o.data!);
      if (!i) {
        i = new Image();
        i.src = o.data!;
        custom.set(o.data!, i);
      }
      if (i.complete) c.drawImage(i, -b.w / 2, -b.h, b.w, b.h);
    } else {
      const asset = furnitureAssets[Number(o.asset)],
        i = images[asset.image],
        [sx, sy, sw, sh] = asset.frame;
      c.globalAlpha = 0.15;
      c.fillStyle = "#160f0c";
      c.beginPath();
      c.ellipse(0, -8, b.w * 0.36, 8, 0, 0, 7);
      c.fill();
      c.globalAlpha = 1;
      if (o.color !== "#ffffff")
        c.filter = `sepia(.25) hue-rotate(${parseInt(o.color.slice(1, 3), 16) * 2}deg)`;
      if (i) c.drawImage(i, sx, sy, sw, sh, -b.w / 2, -b.h, b.w, b.h);
    }
    c.restore();
    if (this.selected === o.id) {
      c.save();
      c.strokeStyle = "#f6dca0";
      c.lineWidth = 1.5;
      c.setLineDash([5, 5]);
      c.strokeRect(
        o.x - b.w / 2 - 6,
        o.y - (o.kind === "ornament" ? b.h / 2 : b.h) - 6,
        b.w + 12,
        b.h + 12,
      );
      c.restore();
    }
  }
  path(p: Path) {
    const c = this.c,
      s = this.getScene();
    c.save();
    const top = 650 - s.tree.height;
    c.beginPath();
    c.moveTo(630, top + 15);
    for (let j = 1; j <= 12; j++)
      c.lineTo(
        630 + s.tree.width * (0.07 + (0.43 * j) / 12),
        top + ((s.tree.height * j) / 12) * 0.93,
      );
    for (let j = 12; j >= 1; j--)
      c.lineTo(
        630 - s.tree.width * (0.07 + (0.43 * j) / 12),
        top + ((s.tree.height * j) / 12) * 0.93,
      );
    c.closePath();
    c.clip();
    c.strokeStyle = p.type === "ribbon" ? p.color : "#3d4e30";
    c.lineWidth = p.type === "ribbon" ? p.width : 1.4;
    c.beginPath();
    p.points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
    if (p.type === "ribbon") {
      c.strokeStyle = "#f0ce89";
      c.lineWidth = 1;
      c.stroke();
    } else {
      let d = 0,
        index = 0;
      for (let i = 1; i < p.points.length; i++) {
        const [x, y] = p.points[i],
          [px, py] = p.points[i - 1];
        const len = Math.hypot(x - px, y - py);
        d += len;
        if (d >= p.spacing) {
          d = 0;
          const pulse =
            p.mode === "steady"
              ? 1
              : p.mode === "alternate"
                ? 0.35 +
                  0.65 *
                    (Math.sin(this.time * 0.002 * p.speed + index++ * Math.PI) >
                    0
                      ? 1
                      : 0)
                : 0.7 + 0.3 * Math.sin(this.time * 0.0018 * p.speed + i);
          c.globalAlpha = pulse * p.brightness;
          c.fillStyle = p.color;
          c.globalAlpha *= 0.16;
          c.fillRect(x - 6, y - 6, 12, 12);
          c.globalAlpha = pulse * p.brightness;
          c.fillRect(x - 3, y - 3, 6, 6);
          c.fillStyle = "#fff2cf";
          c.fillRect(x - 1, y - 1, 3, 3);
        }
      }
    }
    c.restore();
  }
  draw(dt: number) {
    const c = this.c,
      s = this.getScene();
    c.save();
    c.clearRect(0, 0, 1200, 800);
    this.transform(c);
    c.imageSmoothingEnabled = false;
    c.drawImage(images.room, 0, 0, 1200, 800); // immutable architecture and landscape
    // Snow and fireworks are clipped to the window, never the room.
    c.save();
    c.beginPath();
    for (let col = 0; col < 4; col++)
      for (let row = 0; row < 4; row++) {
        const xs = [43, 123, 209, 287],
          ys = [146, 234, 333, 429],
          ws = [65, 67, 64, 63],
          hs = [78, 88, 85, 156];
        c.rect(xs[col], ys[row], ws[col], hs[row]);
      }
    c.clip();
    for (let j = 0; j < s.env.snow * 2; j++) {
      const x =
          ((j * 71.31 + Math.sin(this.time * 0.0004 + j) * 13) % 350) + 34,
        y = ((j * 37.29 + this.time * (0.008 + (j % 4) * 0.006)) % 470) + 100;
      c.fillStyle = j % 3 ? "#c1d7eb" : "#f2e8df";
      c.globalAlpha = 0.35 + (j % 4) * 0.12;
      c.fillRect(Math.round(x), Math.round(y), j % 3 === 0 ? 3 : 2, 2);
    }
    c.globalAlpha = 1;
    this.fireworks.forEach((f) => {
      f.age += dt;
      const t = f.age / 1600;
      for (let j = 0; j < 26; j++) {
        const a = (j * Math.PI * 2) / 26,
          r = 65 * t;
        const x = f.x + Math.cos(a) * r,
          y = f.y + Math.sin(a) * r + t * t * 22;
        c.globalAlpha = Math.max(0, 1 - t);
        c.fillStyle = f.color;
        c.fillRect(x, y, 3, 3);
      }
    });
    c.restore();
    this.fireworks = this.fireworks.filter((f) => f.age < 1600);
    if (
      s.env.fireworks > 0 &&
      this.time - this.lastAuto > 60000 / (s.env.fireworks / 5)
    ) {
      this.lastAuto = this.time;
      this.firework();
    }
    this.drawFire();
    const ground = s.items.filter(
      (o) => o.kind !== "ornament" && o.surface !== "tree",
    );
    ground
      .filter((o) => o.asset === "4" && o.kind === "furniture")
      .forEach((o) => this.drawItem(o));
    const entities = [
      ...ground
        .filter((o) => !(o.asset === "4" && o.kind === "furniture"))
        .map((o) => ({ y: o.y, draw: () => this.drawItem(o) })),
      {
        y: 650,
        draw: () => {
          this.renderTree(s);
          if (s.tree.pot !== "basket") {
            c.fillStyle = s.tree.pot === "ceramic" ? "#d9c7a5" : "#6d4931";
            c.fillRect(595, 612, 70, 37);
            c.fillStyle = "#b09065";
            c.fillRect(590, 610, 80, 6);
            for (let i = 0; i < 7; i++) {
              c.fillStyle = "#977049";
              c.fillRect(598 + i * 10, 618, 2, 28);
            }
          }
          s.paths.forEach((p) => this.path(p));
          if (this.drawing) this.path(this.drawing);
          s.items
            .filter((o) => o.kind === "ornament" || o.surface === "tree")
            .forEach((o) => this.drawItem(o));
          const ty = 650 - s.tree.height + 15;
          if (s.tree.topper === "star") {
            c.save();
            c.translate(603, ty - 33);
            c.scale(2.25, 2.25);
            pixelOrnament(c, 6, "#e9bf66");
            c.restore();
          } else if (s.tree.topper === "bow") {
            c.save();
            c.translate(606, ty - 14);
            c.scale(2, 2);
            pixelOrnament(c, 1, "#c05444");
            c.restore();
          } else if (s.tree.topper === "angel") {
            c.fillStyle = "#f2dfb5";
            c.beginPath();
            c.moveTo(630, ty - 12);
            c.lineTo(611, ty + 18);
            c.lineTo(649, ty + 18);
            c.fill();
            c.fillRect(624, ty - 22, 12, 12);
          }
        },
      },
    ];
    entities.sort((a, b) => a.y - b.y).forEach((o) => o.draw());
    // Original tiny character and pet, kept in the indoor foreground.
    if (s.env.pet !== "none" && images.pets) {
      const cycle = (this.time % 32000) / 1000,
        walk = cycle > 23,
        pose = walk
          ? 1 + (Math.floor(this.time / 230) % 2)
          : cycle > 12
            ? 3
            : 0;
      const img = images.pets,
        fw = img.width / 4,
        fh = img.height / 2,
        px = 820 + (walk ? Math.sin(this.time * 0.0006) * 45 : 0);
      c.drawImage(
        img,
        pose * fw,
        (s.env.pet === "cat" ? 0 : 1) * fh,
        fw,
        fh,
        px - 35,
        685,
        70,
        70,
      );
    }
    if (s.env.character) {
      c.save();
      c.translate(428 + Math.sin(this.time * 0.0004) * 12, 715);
      c.scale(2, 2);
      c.fillStyle = s.env.outfit;
      c.fillRect(-8, -22, 16, 18);
      c.fillStyle = "#dfb18a";
      c.fillRect(-6, -35, 12, 13);
      c.fillStyle = s.env.hair;
      c.fillRect(-7, -38, 14, 7);
      c.fillRect(-8, -34, 3, 12);
      c.fillStyle = "#352e2a";
      c.fillRect(-6, -4, 5, 6);
      c.fillRect(2, -4, 5, 6);
      c.fillRect(-3, -29, 1, 1);
      c.fillRect(3, -29, 1, 1);
      c.restore();
    }
    // Pixel flames in fixed stone hearth; no full-frame blur passes.
    c.fillStyle = `rgba(18,19,29,${(100 - s.env.light) / 170})`;
    c.fillRect(0, 0, 1200, 800);
    c.restore();
  }
  private fireFrames: HTMLCanvasElement[] = [];
  drawFire() {
    if (!this.fireFrames.length) {
      for (let f = 0; f < 8; f++) {
        const img = document.createElement("canvas");
        img.width = 64;
        img.height = 48;
        const ctx = img.getContext("2d")!;
        for (let x = 3; x < 61; x++) {
          const envelope = Math.sin(((x - 3) / 58) * Math.PI);
          const height = Math.round(
            envelope *
              (19 +
                9 * Math.sin(x * 0.51 + f * 0.8) +
                5 * Math.sin(x * 1.31 - f)),
          );
          for (let y = 0; y < height; y++) {
            const heat = y / height;
            ctx.fillStyle =
              heat > 0.8
                ? "#ac492b"
                : heat > 0.5
                  ? "#e58436"
                  : heat > 0.23
                    ? "#ffc466"
                    : "#ffe8a0";
            ctx.fillRect(x, 44 - y, 1, 1);
          }
        }
        ctx.fillStyle = "#583321";
        ctx.fillRect(6, 44, 51, 3);
        ctx.fillStyle = "#aa6236";
        ctx.fillRect(12, 43, 17, 2);
        ctx.fillRect(35, 44, 17, 2);
        this.fireFrames.push(img);
      }
    }
    const frame = this.fireFrames[Math.floor(this.time / 105) % 8];
    this.c.drawImage(frame, 930, 500, 145, 105);
  }

  screenshot() {
    const selected = this.selected,
      zoom = this.zoom;
    this.selected = null;
    this.zoom = 1;
    this.draw(0);
    const data = this.canvas.toDataURL("image/png");
    this.selected = selected;
    this.zoom = zoom;
    return data;
  }
}
