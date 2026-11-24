import { furnitureAssets } from "./assets";
export type Item = {
  id: string;
  kind: "ornament" | "furniture" | "gift" | "custom";
  asset: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
  note?: string;
  data?: string;
  surface?: "tree" | "floor";
};
export type Path = {
  id: string;
  type: "lights" | "ribbon";
  points: number[][];
  color: string;
  width: number;
  spacing: number;
  brightness: number;
  speed: number;
  mode: string;
};
export type Scene = {
  version: 1;
  theme: string;
  creations: {
    id: string;
    name: string;
    data: string;
    surface: "tree" | "floor";
  }[];
  tree: {
    preset: string;
    width: number;
    height: number;
    color: string;
    snow: number;
    density: number;
    pot: string;
    topper: string;
  };
  items: Item[];
  paths: Path[];
  env: {
    snow: number;
    fireworks: number;
    fireworkColor: string;
    light: number;
    sound: boolean;
    pet: string;
    character: boolean;
    hair: string;
    outfit: string;
  };
};
export const uid = () => crypto.randomUUID();
export const themes = [
  {
    id: "classic",
    name: "Classic Christmas",
    sub: "经典红金",
    colors: ["#b94b40", "#e8c582", "#42705a"],
  },
  {
    id: "nordic",
    name: "Nordic Christmas",
    sub: "北欧暖白",
    colors: ["#e7d7b5", "#b79566", "#6c8066"],
  },
  {
    id: "winter",
    name: "Winter Wonderland",
    sub: "冬日仙境",
    colors: ["#b3dcf0", "#e9edf1", "#7595bc"],
  },
  {
    id: "vintage",
    name: "Vintage Christmas",
    sub: "复古彩色",
    colors: ["#bc6280", "#d69e4f", "#65a7a0"],
  },
];
export const ornamentNames = [
  "圣诞球",
  "蝴蝶结",
  "铃铛",
  "雪花",
  "姜饼人",
  "木马",
  "星星",
  "微缩木屋",
  "拐杖糖",
  "小灯笼",
  "松果",
  "爱心",
];
export const furnitureNames = [
  "红丝绒沙发",
  "可可茶几",
  "阅读扶手椅",
  "橡木书架",
  "圣诞地毯",
  "黄铜落地灯",
  "复古唱片机",
  "冬青盆栽",
  "红金礼物",
  "奶油礼物",
  "针织抱枕",
  "烛台",
];
export function treeInside(x: number, y: number, s: Scene) {
  const top = 650 - s.tree.height;
  const t = (y - top) / s.tree.height;
  return (
    t >= 0 && t <= 0.93 && Math.abs(x - 630) < s.tree.width * (0.08 + 0.43 * t)
  );
}
export function fitOrnament(o: Item, s: Scene) {
  const top = 650 - s.tree.height;
  o.y = Math.max(top + 45, Math.min(620, o.y));
  const t = (o.y - top) / s.tree.height;
  const w = s.tree.width * (0.05 + 0.4 * t);
  o.x = Math.max(630 - w, Math.min(630 + w, o.x));
}
export function makeDefault(): Scene {
  const s: Scene = {
    version: 1,
    theme: "classic",
    creations: [],
    tree: {
      preset: "fir",
      width: 450,
      height: 575,
      color: "#28553e",
      snow: 0,
      density: 1,
      pot: "basket",
      topper: "star",
    },
    items: [],
    paths: [],
    env: {
      snow: 45,
      fireworks: 25,
      fireworkColor: "#e8c582",
      light: 85,
      sound: false,
      pet: "cat",
      character: false,
      hair: "#573b2c",
      outfit: "#a7463d",
    },
  };
  let n = 0;
  for (let row = 0; row < 7; row++) {
    const y = 170 + row * 64;
    const w = 40 + row * 24;
    for (let j = 0; j < 4 + (row % 2); j++) {
      const x = 630 - w + (2 * w * j) / (3 + (row % 2));
      s.items.push({
        id: uid(),
        kind: "ornament",
        asset: String([0, 1, 0, 2, 0, 3, 9, 0, 7, 0, 10, 6][n % 12]),
        x,
        y: y + Math.sin(j * 5 + row) * 17,
        scale: 1.3 + (n % 3) * 0.25,
        rotation: 0,
        color: n++ % 3 ? "#b94739" : "#e9bf66",
      });
    }
  }
  for (let r = 0; r < 4; r++) {
    const pts = [];
    for (let j = 0; j <= 30; j++) {
      const x = 535 - r * 22 + (j * (190 + r * 44)) / 30;
      pts.push([x, 270 + r * 83 + Math.sin((j / 30) * Math.PI) * 36]);
    }
    s.paths.push({
      id: uid(),
      type: "lights",
      points: pts,
      color: "#ffe2a1",
      width: 2,
      spacing: 20,
      brightness: 1,
      speed: 1,
      mode: "breath",
    });
  }
  const defs: [number, number, number, number][] = [
    [4, 635, 780, 1.35],
    [0, 205, 706, 1],
    [1, 310, 765, 1],
    [2, 1100, 761, 0.9],
    [3, 842, 640, 0.62],
    [5, 105, 659, 0.72],
    [6, 85, 765, 0.55],
    [7, 401, 666, 0.5],
    [8, 504, 704, 0.65],
    [9, 721, 710, 0.62],
    [8, 761, 738, 0.48],
    [11, 340, 666, 0.28],
  ];
  defs.forEach(([asset, x, y, scale]) =>
    s.items.push({
      id: uid(),
      kind: asset === 8 || asset === 9 ? "gift" : "furniture",
      asset: String(asset),
      x,
      y,
      scale,
      rotation: 0,
      color: "#ffffff",
      note: asset === 8 ? "愿每一个冬夜都有温暖相伴。" : "",
    }),
  );
  return s;
}
export function validate(value: unknown): Scene {
  const v = value as Scene;
  if (
    !v ||
    v.version !== 1 ||
    !v.tree ||
    !Array.isArray(v.items) ||
    !Array.isArray(v.paths) ||
    !v.env
  )
    throw Error("这不是有效的 Pixel Noël 作品");
  if (v.items.length > 500 || v.paths.length > 100)
    throw Error("作品中的对象过多");
  if (!v.tree.preset) v.tree.preset = "fir";
  if (!["fir", "spruce"].includes(v.tree.preset)) throw Error("未知树型");
  const finite = (x: unknown) => typeof x === "number" && Number.isFinite(x);
  const color = (x: unknown) =>
    typeof x === "string" && /^#[\da-f]{6}$/i.test(x);
  if (
    ![
      v.tree.width,
      v.tree.height,
      v.tree.snow,
      v.tree.density,
      v.env.snow,
      v.env.fireworks,
      v.env.light,
    ].every(finite) ||
    !color(v.tree.color) ||
    !color(v.env.fireworkColor) ||
    !color(v.env.hair) ||
    !color(v.env.outfit) ||
    !["basket", "barrel", "ceramic"].includes(v.tree.pot) ||
    !["star", "bow", "angel", "none"].includes(v.tree.topper) ||
    !["cat", "dog", "none"].includes(v.env.pet)
  )
    throw Error("作品参数不完整");
  for (const o of v.items) {
    if (
      !o ||
      !["ornament", "furniture", "gift", "custom"].includes(o.kind) ||
      typeof o.id !== "string" ||
      !/^[a-zA-Z0-9_-]{1,80}$/.test(o.id) ||
      !["x", "y", "scale", "rotation"].every((k) =>
        finite(o[k as keyof Item]),
      ) ||
      o.scale < 0.1 ||
      o.scale > 4 ||
      o.x < 0 ||
      o.x > 1200 ||
      o.y < 0 ||
      o.y > 800 ||
      !color(o.color) ||
      typeof o.asset !== "string"
    )
      throw Error("作品对象无效");
    if (
      ["furniture", "gift"].includes(o.kind) &&
      (!/^\d+$/.test(o.asset) || !furnitureAssets[Number(o.asset)])
    )
      throw Error("作品使用了未安装的家具素材");
    if (
      o.kind === "ornament" &&
      (!/^\d+$/.test(o.asset) || Number(o.asset) > 11)
    )
      throw Error("未知挂饰");
    if (o.kind === "custom" && !o.data) throw Error("原创素材缺少图像");
    if (
      o.data &&
      (!/^data:image\/png;base64,[a-zA-Z0-9+/=]+$/.test(o.data) ||
        o.data.length > 1500000)
    )
      throw Error("导入图片不符合规范");
    if (o.note && (typeof o.note !== "string" || o.note.length > 60))
      throw Error("留言无效");
  }
  for (const p of v.paths) {
    if (
      !p ||
      typeof p.id !== "string" ||
      !/^[a-zA-Z0-9_-]{1,80}$/.test(p.id) ||
      !["lights", "ribbon"].includes(p.type) ||
      !Array.isArray(p.points) ||
      p.points.length > 3000 ||
      !p.points.every(
        (q) => Array.isArray(q) && q.length === 2 && q.every(finite),
      ) ||
      !color(p.color) ||
      ![p.width, p.spacing, p.brightness, p.speed].every(finite) ||
      p.spacing < 5 ||
      p.spacing > 100 ||
      p.width < 1 ||
      p.width > 20 ||
      !["steady", "breath", "alternate"].includes(p.mode)
    )
      throw Error("灯带数据无效");
  }
  if (!v.creations) v.creations = [];
  if (
    !Array.isArray(v.creations) ||
    v.creations.length > 64 ||
    !v.creations.every(
      (c) =>
        c &&
        typeof c.id === "string" &&
        /^[a-zA-Z0-9_-]{1,80}$/.test(c.id) &&
        typeof c.name === "string" &&
        c.name.length < 40 &&
        ["tree", "floor"].includes(c.surface) &&
        typeof c.data === "string" &&
        c.data.length < 1500000 &&
        /^data:image\/png;base64,[a-zA-Z0-9+/=]+$/.test(c.data),
    )
  )
    throw Error("原创素材库无效");
  v.tree.width = Math.max(280, Math.min(480, v.tree.width));
  v.tree.height = Math.max(460, Math.min(620, v.tree.height));
  v.env.sound = false;
  return v;
}
export class History {
  past: string[] = [];
  future: string[] = [];
  push(s: Scene) {
    this.past.push(JSON.stringify(s));
    if (this.past.length > 80) this.past.shift();
    this.future = [];
  }
  undo(s: Scene) {
    if (!this.past.length) return s;
    this.future.push(JSON.stringify(s));
    return JSON.parse(this.past.pop()!);
  }
  redo(s: Scene) {
    if (!this.future.length) return s;
    this.past.push(JSON.stringify(s));
    return JSON.parse(this.future.pop()!);
  }
}
export async function saveScene(s: Scene) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const t = db.transaction("works", "readwrite");
    t.objectStore("works").put(s, "current");
    t.oncomplete = () => {
      db.close();
      resolve();
    };
    t.onerror = () => {
      db.close();
      reject(t.error);
    };
  });
}
function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open("pixel-noel", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("works");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function loadScene() {
  const db = await openDB();
  return new Promise<Scene | null>((resolve, reject) => {
    const t = db.transaction("works");
    const r = t.objectStore("works").get("current");
    r.onsuccess = () => {
      db.close();
      try {
        resolve(r.result ? validate(r.result) : null);
      } catch (e) {
        reject(e);
      }
    };
    r.onerror = () => {
      db.close();
      reject(r.error);
    };
  });
}
