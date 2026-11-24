import type { Item } from "./model";
const $ = <T extends Element = HTMLElement>(q: string) =>
  document.querySelector<T>(q)!;
type WorkshopServices = {
  icon: (name: string) => string;
  toast: (text: string) => void;
  readPNG: (file: File, grid?: boolean) => Promise<string>;
  addItem: (
    kind: Item["kind"],
    asset: string,
    data?: string,
    surface?: "tree" | "floor",
  ) => void;
  download: (url: string, name: string) => void;
};
export function openWorkshop(services: WorkshopServices) {
  const { icon, toast, readPNG, addItem, download } = services;
  const d = $<HTMLDialogElement>("#dialog");
  d.innerHTML = `<div class="dialog-head"><h2>Make a little magic</h2><button class="icon-button" id="close-workshop" aria-label="关闭画板">${icon("close")}</button></div><p>一格一格，画出只属于你的圣诞。32 × 32 透明像素画板。</p><div class="workshop-content"><canvas id="pixel-canvas" class="pixel-canvas" width="32" height="32" aria-label="原创像素画板"></canvas><div class="workshop-tools"><div class="tools"><button data-tool="pencil" class="active">铅笔</button><button data-tool="eraser">橡皮</button><button data-tool="fill">填色</button><button data-tool="picker">取色</button></div><label class="row">画笔颜色<input type="color" id="pixel-color" value="#c35743" aria-label="画笔颜色"></label><div class="colors" style="flex-wrap:wrap">${["#c35743", "#dfbd75", "#efe1b6", "#547b58", "#406475", "#663c32", "#ffffff"].map((c) => `<button class="color" data-pixel-color="${c}" style="background:${c}" aria-label="画板颜色 ${c}"></button>`).join("")}</div><div class="selection-actions" style="margin-top:18px"><button id="pixel-undo">撤销</button><button id="pixel-redo">重做</button></div><label class="row" style="font-size:10px">导入对齐 32 格<input id="pixel-align" type="checkbox" checked></label><input id="pixel-import-file" type="file" accept="image/png" hidden><button class="wide-button" id="pixel-import">导入 PNG</button></div></div><div class="dialog-actions"><button class="primary" id="pixel-add">挂到圣诞树</button><button id="pixel-furniture">添加为室内装饰</button><button id="pixel-export">导出 PNG</button><button id="pixel-clear">清空画板</button></div>`;
  d.showModal();
  const c = $<HTMLCanvasElement>("#pixel-canvas"),
    x = c.getContext("2d", { willReadFrequently: true })!;
  let tool = "pencil",
    down = false,
    color = "#c35743",
    lastPoint: { x: number; y: number } | null = null;
  const undo: ImageData[] = [],
    redo: ImageData[] = [];
  const snap = () => {
    undo.push(x.getImageData(0, 0, 32, 32));
    if (undo.length > 60) undo.shift();
    redo.length = 0;
  };
  const paint = (e: PointerEvent) => {
    const b = c.getBoundingClientRect(),
      px = Math.max(
        0,
        Math.min(31, Math.floor(((e.clientX - b.left) / b.width) * 32)),
      ),
      py = Math.max(
        0,
        Math.min(31, Math.floor(((e.clientY - b.top) / b.height) * 32)),
      );
    if (tool === "picker") {
      const data = x.getImageData(px, py, 1, 1).data;
      color =
        "#" +
        Array.from(data.slice(0, 3))
          .map((n) => n.toString(16).padStart(2, "0"))
          .join("");
      $<HTMLInputElement>("#pixel-color").value = color;
      return;
    }
    if (tool === "fill") {
      const image = x.getImageData(0, 0, 32, 32),
        target = Array.from(
          image.data.slice((py * 32 + px) * 4, (py * 32 + px) * 4 + 4),
        ),
        replacement = [
          parseInt(color.slice(1, 3), 16),
          parseInt(color.slice(3, 5), 16),
          parseInt(color.slice(5, 7), 16),
          255,
        ];
      const stack = [[px, py]],
        seen = new Set<number>();
      while (stack.length) {
        const [a, b] = stack.pop()!,
          i = b * 32 + a;
        if (a < 0 || a > 31 || b < 0 || b > 31 || seen.has(i)) continue;
        seen.add(i);
        if (!target.every((n, k) => image.data[i * 4 + k] === n)) continue;
        replacement.forEach((n, k) => (image.data[i * 4 + k] = n));
        stack.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
      }
      x.putImageData(image, 0, 0);
      return;
    }
    const p = lastPoint || { x: px, y: py };
    const n = Math.max(Math.abs(px - p.x), Math.abs(py - p.y), 1);
    for (let i = 0; i <= n; i++) {
      const a = Math.round(p.x + ((px - p.x) * i) / n),
        b = Math.round(p.y + ((py - p.y) * i) / n);
      if (tool === "eraser") x.clearRect(a, b, 1, 1);
      else {
        x.fillStyle = color;
        x.fillRect(a, b, 1, 1);
      }
    }
    lastPoint = { x: px, y: py };
  };
  c.onpointerdown = (e) => {
    snap();
    down = true;
    lastPoint = null;
    c.setPointerCapture(e.pointerId);
    paint(e);
  };
  c.onpointermove = (e) => {
    if (down && tool !== "fill") paint(e);
  };
  c.onpointerup = c.onpointercancel = () => {
    down = false;
    lastPoint = null;
  };
  document.querySelectorAll<HTMLElement>("[data-tool]").forEach(
    (b) =>
      (b.onclick = () => {
        tool = b.dataset.tool!;
        document
          .querySelectorAll("[data-tool]")
          .forEach((z) => z.classList.toggle("active", z === b));
      }),
  );
  $("#pixel-color").oninput = (e) =>
    (color = (e.target as HTMLInputElement).value);
  document.querySelectorAll<HTMLElement>("[data-pixel-color]").forEach(
    (b) =>
      (b.onclick = () => {
        color = b.dataset.pixelColor!;
        $<HTMLInputElement>("#pixel-color").value = color;
      }),
  );
  $("#pixel-undo").onclick = () => {
    if (undo.length) {
      redo.push(x.getImageData(0, 0, 32, 32));
      x.putImageData(undo.pop()!, 0, 0);
    }
  };
  $("#pixel-redo").onclick = () => {
    if (redo.length) {
      undo.push(x.getImageData(0, 0, 32, 32));
      x.putImageData(redo.pop()!, 0, 0);
    }
  };
  $("#pixel-clear").onclick = () => {
    snap();
    x.clearRect(0, 0, 32, 32);
  };
  const add = (surface: "tree" | "floor") => {
    if (!x.getImageData(0, 0, 32, 32).data.some((v, i) => i % 4 === 3 && v)) {
      toast("先画一点小小的灵感吧。");
      return;
    }
    addItem("custom", "custom", c.toDataURL(), surface);
    d.close();
  };
  $("#pixel-add").onclick = () => add("tree");
  $("#pixel-furniture").onclick = () => add("floor");
  $("#pixel-export").onclick = () =>
    download(c.toDataURL(), "pixel-noel-original.png");
  $("#close-workshop").onclick = () => d.close();
  $("#pixel-import").onclick = () => $("#pixel-import-file").click();
  $("#pixel-import-file").onchange = async (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f)
      try {
        const data = await readPNG(
            f,
            $<HTMLInputElement>("#pixel-align").checked,
          ),
          i = new Image();
        i.src = data;
        await i.decode();
        snap();
        x.clearRect(0, 0, 32, 32);
        x.imageSmoothingEnabled = false;
        const ratio = Math.min(32 / i.width, 32 / i.height);
        x.drawImage(
          i,
          Math.floor((32 - i.width * ratio) / 2),
          Math.floor((32 - i.height * ratio) / 2),
          Math.round(i.width * ratio),
          Math.round(i.height * ratio),
        );
      } catch (err) {
        toast((err as Error).message);
      }
  };
}
