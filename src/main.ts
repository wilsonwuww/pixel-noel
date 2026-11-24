import { openWorkshop as showWorkshop } from "./workshop";
import "./style.css";
import {
  makeDefault,
  History,
  uid,
  loadScene,
  saveScene,
  validate,
  themes,
  ornamentNames,
  furnitureNames,
  fitOrnament,
  treeInside,
  type Scene,
  type Item,
  type Path,
} from "./model";
import { furnitureAssets } from "./assets";
import {
  Renderer,
  loadArt,
  ensureFurnitureArt,
  ensureImage,
  ornamentThumb,
  furnitureThumb,
} from "./art";
const icons: Record<string, string> = {
  tree: '<path d="m12 2 4 6h-2l5 6h-3l5 6H3l5-6H5l5-6H8z"/><path d="M12 20v3"/>',
  room: '<path d="m3 10 9-7 9 7v11H3z"/><path d="M9 21v-8h6v8"/>',
  moon: '<path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z"/>',
  snow: '<path d="M12 2v20M3 7l18 10M3 17 21 7M9 4l3 3 3-3M9 20l3-3 3 3"/>',
  star: '<path d="m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z"/>',
  brush:
    '<path d="m14 4 6 6M8 16 20 4l2 2L10 18M8 16c-6-2-1 7-6 6 5 2 9-1 8-4"/>',
  chair: '<path d="M6 13V5h12v8M3 12v7h18v-7M6 19v3M18 19v3M3 13h18"/>',
  gift: '<path d="M3 9h18v5H3zM5 14v8h14v-8M12 9v13"/><path d="M12 9C3 9 4 1 8 3c3 0 4 6 4 6Zm0 0c9 0 8-8 4-6-3 0-4 6-4 6Z"/>',
  sliders:
    '<path d="M4 6h16M4 12h16M4 18h16"/><path d="M8 3v6M16 9v6M9 15v6"/>',
  undo: '<path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14"/>',
  redo: '<path d="m16 4 5 5-5 5M21 9H10a7 7 0 0 0 0 14"/>',
  camera: '<path d="M3 7h4l2-3h6l2 3h4v14H3z"/><circle cx="12" cy="14" r="4"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
  music:
    '<path d="M9 18V5l11-3v13M9 8l11-3"/><ellipse cx="6" cy="19" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 17h.01"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 17v4h16v-4"/>',
  trash: '<path d="M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="1"/><path d="M16 8V3H3v13h5"/>',
  close: '<path d="m5 5 14 14M5 19 19 5"/>',
  pet: '<ellipse cx="12" cy="16" rx="6" ry="5"/><circle cx="4" cy="9" r="2"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="20" cy="9" r="2"/>',
  lights:
    '<path d="M2 5c5 10 15 10 20 0M6 10v4M12 13v4M18 10v4"/><circle cx="6" cy="16" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="18" cy="16" r="2"/>',
};
const icon = (name: string) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.star}</svg>`;
const $ = <T extends Element = HTMLElement>(q: string) =>
  document.querySelector<T>(q)!;
let scene = makeDefault(),
  mode = "room",
  section = "ornaments",
  tab = "library",
  activeColor = "#be4b3e",
  drawTool: "lights" | "ribbon" | null = null,
  ready = false;
let readyAt = 0;
const history = new History();
let saveTimer: ReturnType<typeof setTimeout>,
  toastTimer: ReturnType<typeof setTimeout>;
$("#app").innerHTML =
  `<header><div class="brand"><svg class="brand-mark" viewBox="0 0 40 48"><path d="m20 3 5 9h-3l9 11h-5l10 13H4l10-13H9l9-11h-3z" stroke="currentColor"/><path d="M20 36v8M9 40h22" stroke="currentColor"/></svg><div><h1>Pixel Noël<span style="color:#d5b77c">.</span></h1><p>Craft your own little Christmas</p></div></div><nav class="modes" aria-label="工作模式"><button data-mode="room" class="active">${icon("room")}Room Studio</button><button data-mode="tree">${icon("tree")}Tree Studio</button><button data-mode="cozy">${icon("moon")}Cozy Mode</button></nav><div class="head-actions"><span class="save-status" id="save-status">${icon("check")}本地自动保存</span><button class="icon-button" id="undo" title="撤销 (⌘Z)" aria-label="撤销">${icon("undo")}</button><button class="icon-button" id="redo" title="重做 (⌘⇧Z)" aria-label="重做">${icon("redo")}</button><button class="gold-button" id="snapshot">${icon("camera")}<span>保存画面</span></button></div></header><main class="workspace"><nav class="rail" aria-label="创作工具"><button data-section="ornaments" class="active" title="圣诞挂饰" aria-label="圣诞挂饰">${icon("tree")}</button><button data-section="furniture" title="家具布置" aria-label="家具布置">${icon("chair")}</button><button data-section="lights" title="灯带与丝带" aria-label="灯带与丝带">${icon("lights")}</button><button data-section="gifts" title="礼物与祝福" aria-label="礼物与祝福">${icon("gift")}</button><button id="open-workshop" title="像素创作工坊" aria-label="像素创作工坊">${icon("brush")}</button><button data-section="environment" title="氛围设置" aria-label="氛围设置">${icon("snow")}</button><button data-section="characters" title="室内伙伴" aria-label="室内伙伴">${icon("pet")}</button><button data-section="project" class="bottom" title="作品管理" aria-label="作品管理">${icon("sliders")}</button><button id="help" title="操作指南" aria-label="操作指南">${icon("help")}</button></nav><section class="stage-area"><div class="scene-heading"><div><span class="eyebrow">A LITTLE WONDER, MADE BY YOU</span><h2 id="scene-title">冬夜，圣诞正好。</h2></div><p>${icon("snow")}雪落窗外 · 温暖在此</p></div><div class="stage-frame"><canvas id="scene" aria-label="圣诞小屋创作画布，可拖动独立挂饰与家具" tabindex="0"></canvas><div class="scene-badge">${icon("star")}YOUR CHRISTMAS, YOUR WAY</div><div class="scene-controls"><button class="icon-button" id="zoom-out" title="缩小" aria-label="缩小">${icon("minus")}</button><span id="zoom-label">100%</span><button class="icon-button" id="zoom-in" title="放大" aria-label="放大">${icon("plus")}</button><button class="icon-button" id="zoom-reset" title="完整房间" aria-label="完整房间">${icon("expand")}</button></div><div class="loading" id="loading">${icon("tree")}Preparing a little Christmas<small>正在点亮你的小屋…</small></div></div><p class="stage-hint" id="stage-hint">点击圣诞树，开始装饰<span>·</span>拖动家具，布置你的冬日角落</p><div class="themes-title"><h3>给圣诞一点灵感</h3><span>CURATED PALETTES</span></div><div class="themes">${themes.map((t) => `<button class="theme ${t.id === scene.theme ? "active" : ""}" data-theme="${t.id}"><div class="swatches">${t.colors.map((c) => `<i style="background:${c}"></i>`).join("")}</div><strong>${t.name}</strong><small>${t.sub}</small></button>`).join("")}</div></section><aside class="panel" id="panel" aria-label="编辑面板"></aside></main><footer class="footer"><div><span class="small-brand">Made for slow, snowy evenings.</span><span>✧</span>一点像素，一屋温暖。</div><div class="detail">本地创作 · 无需账号<span> / </span><a href="https://github.com/wilsonwuww/pixel-noel" target="_blank" rel="noopener">Open source</a><span> / </span>v0.1.0</div></footer><button class="exit-cozy" id="exit-cozy">${icon("close")} 退出沉浸 · Esc</button><dialog id="dialog"></dialog><input type="file" id="config-file" accept="application/json,.json" hidden><input type="file" id="png-file" accept="image/png" hidden>`;
const renderer = new Renderer($("#scene"), () => scene);
function toast(text: string) {
  document.querySelector(".toast")?.remove();
  const d = document.createElement("div");
  d.className = "toast";
  d.role = "status";
  d.textContent = text;
  document.body.append(d);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => d.remove(), 3500);
}
function commit() {
  history.push(scene);
}
function changed(panel = false) {
  clearTimeout(saveTimer);
  $("#save-status").innerHTML = "正在保存…";
  saveTimer = setTimeout(() => {
    saveScene(scene)
      .then(
        () => ($("#save-status").innerHTML = `${icon("check")}已保存到此设备`),
      )
      .catch(() => {
        $("#save-status").textContent = "保存失败，请导出作品";
        toast("本地存储不可用，请导出作品备份。");
      });
  }, 350);
  syncHistory();
  if (panel) renderPanel();
}
function syncHistory() {
  $<HTMLButtonElement>("#undo").disabled = !history.past.length;
  $<HTMLButtonElement>("#redo").disabled = !history.future.length;
}
function selected() {
  return scene.items.find((o) => o.id === renderer.selected);
}
function setMode(m: string) {
  mode = m;
  document.body.classList.toggle("cozy", m === "cozy");
  document
    .querySelectorAll("[data-mode]")
    .forEach((b) =>
      b.classList.toggle("active", (b as HTMLElement).dataset.mode === m),
    );
  renderer.selected = null;
  drawTool = null;
  if (m === "tree") {
    renderer.targetZoom = 1.35;
    section = "ornaments";
    $("#scene-title").textContent = "让每一根松针，都有故事。";
    $("#stage-hint").innerHTML =
      "从右侧选择挂饰<span>·</span>拖动摆放，自由装点你的圣诞树";
  } else if (m === "room") {
    renderer.targetZoom = 1;
    $("#scene-title").textContent = "冬夜，圣诞正好。";
    $("#stage-hint").innerHTML =
      "点击圣诞树，开始装饰<span>·</span>拖动家具，布置你的冬日角落";
  }
  updateZoom();
  renderPanel();
}
function updateZoom() {
  $("#zoom-label").textContent = Math.round(renderer.targetZoom * 100) + "%";
}
function escapeHtml(t: string) {
  const d = document.createElement("span");
  d.textContent = t;
  return d.innerHTML.replace(/"/g, "&quot;");
}
const range = (
  label: string,
  key: string,
  value: number,
  min: number,
  max: number,
  step = 1,
) =>
  `<label class="row">${label}<input type="range" data-field="${key}" value="${value}" min="${min}" max="${max}" step="${step}" aria-label="${label}"></label>`;
const colorField = (label: string, key: string, value: string) =>
  `<label class="row">${label}<input type="color" data-field="${key}" value="${value}" aria-label="${label}"></label>`;
const select = (
  label: string,
  key: string,
  value: string,
  options: string[][],
) =>
  `<label class="row">${label}<select data-field="${key}" aria-label="${label}">${options.map(([v, n]) => `<option value="${v}" ${value === v ? "selected" : ""}>${n}</option>`).join("")}</select></label>`;
const btn = (id: string, label: string, i: string, classes = "") =>
  `<button class="wide-button ${classes}" id="${id}">${icon(i)}${label}</button>`;
function renderPanel() {
  document
    .querySelectorAll("[data-section]")
    .forEach((b) =>
      b.classList.toggle(
        "active",
        (b as HTMLElement).dataset.section === section,
      ),
    );
  $("#scene").classList.toggle("drawing", !!drawTool);
  const title = (
    {
      ornaments: "The tree atelier",
      furniture: "A room of your own",
      lights: "A little golden glow",
      gifts: "Wrapped with love",
      environment: "The winter mood",
      characters: "Little companions",
      project: "Your Christmas story",
    } as Record<string, string>
  )[section];
  let html = `<div class="panel-top"><h2>${title}</h2>${icon(section === "ornaments" ? "star" : "sliders")}</div><p class="intro">${({ ornaments: "挑选心爱的装饰，把冬夜变成你的作品。", furniture: "挪动一件家具，留出一个温暖的角落。", lights: "亲手画一道光，让圣诞树慢慢亮起来。", gifts: "把一句温柔的话，藏进礼物里。", environment: "雪、灯火与远处的烟花，刚刚好。", characters: "让小屋多一点安静的陪伴。", project: "属于你的圣诞，保存在你的设备。" } as Record<string, string>)[section]}</p>`;
  if (section === "ornaments") {
    html += `<div class="tabs"><button data-tab="library" class="${tab === "library" ? "active" : ""}">挂饰库</button><button data-tab="tree" class="${tab === "tree" ? "active" : ""}">树体</button><button data-tab="topper" class="${tab === "topper" ? "active" : ""}">树顶</button></div>`;
    if (tab === "library")
      html += `<div class="section-label">THE LITTLE DETAILS<span>12 件原创挂饰</span></div><div class="asset-grid">${ornamentNames.map((n, i) => `<button class="asset" data-ornament="${i}" title="添加${n}"><img src="${ornamentThumb(i, activeColor)}" alt=""><span>${n}</span></button>`).join("")}</div><div class="section-label">YOUR PALETTE</div><div class="colors">${["#be4b3e", "#e7c782", "#e7e3d0", "#54816c", "#8eacc0"].map((c) => `<button class="color ${c === activeColor ? "active" : ""}" data-color="${c}" style="background:${c}" aria-label="选择颜色 ${c}"></button>`).join("")}<input type="color" id="active-color" value="${activeColor}" aria-label="自定义挂饰颜色"></div><div class="tip">点选装饰即可挂上树，拖动可自由摆放。选中后可缩放、转动和换色。</div>${btn("workshop", "画一件自己的挂饰", "brush")}${btn("import-png", "导入透明 PNG", "upload")}${btn("clear-tree", "从一棵裸树开始", "tree", "danger")}`;
    if (tab === "tree")
      html +=
        select("独立树型", "tree.preset", scene.tree.preset, [
          ["fir", "诺德曼冷杉"],
          ["spruce", "蓝银云杉"],
        ]) +
        range("树体高度", "tree.height", scene.tree.height, 460, 620) +
        range("树冠宽度", "tree.width", scene.tree.width, 280, 480) +
        colorField("松针色调", "tree.color", scene.tree.color) +
        range("松针浓郁度", "tree.density", scene.tree.density, 0.4, 1.6, 0.1) +
        range("枝头积雪", "tree.snow", scene.tree.snow, 0, 80) +
        select("树盆", "tree.pot", scene.tree.pot, [
          ["basket", "手编藤篮"],
          ["barrel", "原木桶"],
          ["ceramic", "奶油陶盆"],
        ]) +
        `<p class="tip">树体调整会保留挂饰，并将超出树冠的挂饰移回枝头。浓郁度调整松针色彩，树形使用统一的独立素材。</p>`;
    if (tab === "topper")
      html += select("树顶装饰", "tree.topper", scene.tree.topper, [
        ["star", "暖金星星"],
        ["bow", "红丝绒蝴蝶结"],
        ["angel", "象牙白天使"],
        ["none", "无装饰"],
      ]);
  }
  if (section === "furniture" || section === "gifts") {
    const ids = furnitureAssets
      .map((_, i) => i)
      .filter((i) =>
        section === "gifts"
          ? furnitureAssets[i].category === "gift"
          : furnitureAssets[i].category === "furniture",
      );
    html += `<div class="section-label">${section === "gifts" ? "A GIFT FROM THE HEART" : "NORDIC LIVING"}<span>独立摆放</span></div><div class="asset-grid">${ids.map((i) => `<button class="asset" data-furniture="${i}"><img src="${furnitureThumb(i)}" alt=""><span>${furnitureNames[i]}</span></button>`).join("")}</div><div class="tip">点击添加，拖动布置。家具以地面为锚点，前后的家具会按位置自然遮挡。</div>${btn("import-png", "导入自制家具 PNG", "upload")}`;
  }
  if (section === "lights") {
    html += `<div class="section-label">DRAW ON THE TREE</div>${btn("draw-lights", drawTool === "lights" ? "正在绘制 · 拖动画布连线" : "绘制一条灯带", "lights", drawTool === "lights" ? "primary" : "")}${btn("draw-ribbon", drawTool === "ribbon" ? "正在绘制 · 拖动画布连线" : "绘制一条丝带", "brush", drawTool === "ribbon" ? "primary" : "")}${btn("stop-draw", "结束绘制", "check")}<p class="tip">在树冠上按住并拖动，松手完成一段路径。每段灯带都可以单独设置或删除。</p>`;
    html += `<div class="section-label">PATHS<span>${scene.paths.length} 段</span></div><select id="path-select" aria-label="选择灯带或丝带" style="width:100%;padding:8px;background:#22382a;border:1px solid #ffffff20;border-radius:4px">${scene.paths.map((p, i) => `<option value="${p.id}">${p.type === "lights" ? "灯带" : "丝带"} ${i + 1}</option>`).join("")}</select><div id="path-fields"></div>`;
  }
  if (section === "environment") {
    html +=
      range("雪花密度", "env.snow", scene.env.snow, 0, 100) +
      range("烟花频率", "env.fireworks", scene.env.fireworks, 0, 100) +
      colorField("烟花颜色", "env.fireworkColor", scene.env.fireworkColor) +
      range("室内灯光", "env.light", scene.env.light, 20, 100) +
      btn("firework", "为冬夜放一朵烟花", "star") +
      btn("sound", scene.env.sound ? "关闭小屋音乐" : "开启小屋音乐", "music") +
      `<p class="tip">原创合成钟琴与壁炉轻响，只有你点下按钮才会播放。照片与作品均不会上传。</p>`;
  }
  if (section === "characters") {
    html +=
      select("小屋宠物", "env.pet", scene.env.pet, [
        ["cat", "姜黄色小猫"],
        ["dog", "可可色小狗"],
        ["none", "暂不需要"],
      ]) +
      `<label class="row">个人像素角色<input type="checkbox" data-field="env.character" ${scene.env.character ? "checked" : ""}></label>` +
      colorField("头发颜色", "env.hair", scene.env.hair) +
      colorField("针织衫颜色", "env.outfit", scene.env.outfit) +
      `<p class="tip">伙伴只在室内活动。照片转角色暂留待后续版本，以保持初次加载轻巧。</p>`;
  }
  if (section === "project") {
    html +=
      btn("export", "导出作品配置 · JSON", "download", "primary") +
      btn("import", "导入作品配置", "upload") +
      btn("snapshot-panel", "保存小屋画面 · PNG", "camera") +
      btn("cozy-panel", "进入 Cozy Mode", "moon") +
      btn("reset", "恢复精心布置的默认小屋", "undo", "danger") +
      `<p class="tip">作品自动保存在此浏览器。导出的 JSON 含场景参数与自制素材，可跨设备恢复。清除浏览器数据会移除本地存档。</p>`;
  }
  if (scene.creations.length)
    html += `<div class="section-label">MY LITTLE CREATIONS<span>${scene.creations.length} 件作品</span></div><div class="asset-grid">${scene.creations.map((c) => `<button class="asset" data-creation="${c.id}"><img src="${c.data}" alt=""><span>${escapeHtml(c.name)}</span></button>`).join("")}</div>`;
  html += '<div class="panel-divider"></div><div id="selection"></div>';
  $("#panel").innerHTML = html;
  renderSelection();
  if (section === "lights") renderPath();
  bindPanel();
}
function renderSelection() {
  const o = selected();
  const d = $("#selection");
  if (!d) return;
  if (!o) {
    d.innerHTML =
      '<div class="section-label">A PERSONAL TOUCH</div><div class="selection-empty">选中一件挂饰或家具<br>让它成为你喜欢的样子。</div>';
    return;
  }
  const orn = o.kind === "ornament";
  d.innerHTML = `<div class="selection-title">${orn ? ornamentNames[+o.asset] : o.kind === "custom" ? "原创像素作品" : furnitureNames[+o.asset]}</div>${range("尺寸", "item.scale", o.scale, 0.3, 2, 0.05)}${orn ? range("旋转", "item.rotation", o.rotation, -180, 180) : ""}${colorField(orn ? "挂饰颜色" : o.kind === "gift" ? "包装色调" : "材质色调", "item.color", o.color)}${o.kind === "gift" ? `<label class="row">祝福留言<input id="gift-note" type="text" maxlength="60" value="${escapeHtml(o.note || "")}" aria-label="祝福留言"></label>` : ""}<div class="selection-actions"><button id="duplicate">${icon("copy")} 复制</button><button id="delete">${icon("trash")} 删除</button></div>`;
  bindFields(d);
  $("#duplicate")?.addEventListener("click", () => {
    commit();
    const n = { ...o, id: uid(), x: o.x + 18, y: o.y + 10 };
    if (orn) fitOrnament(n, scene);
    scene.items.push(n);
    renderer.selected = n.id;
    changed(true);
  });
  $("#delete")?.addEventListener("click", removeSelected);
  $("#gift-note")?.addEventListener("change", (e) => {
    commit();
    o.note = (e.target as HTMLInputElement).value;
    changed();
    toast("祝福已藏进礼物，双击礼物即可读到。");
  });
}
function bindFields(root: Element) {
  root
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-field]")
    .forEach((el) => {
      if (el.dataset.bound) return;
      el.dataset.bound = "true";
      el.addEventListener("pointerdown", () => commit());
      el.addEventListener("keydown", (e) => {
        if (
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(
            (e as KeyboardEvent).key,
          )
        )
          commit();
      });
      el.addEventListener("input", async () => {
        if (el.dataset.field === "tree.preset" && el.value === "spruce") {
          try {
            await ensureImage("spruce");
          } catch {
            toast("树型加载失败，请稍后重试。");
            el.value = scene.tree.preset;
            return;
          }
        }
        if (el instanceof HTMLSelectElement) commit();
        const [group, key] = el.dataset.field!.split(".");
        const target =
          group === "item" ? selected() : scene[group as "tree" | "env"];
        if (!target) return;
        const value =
          el instanceof HTMLInputElement && el.type === "checkbox"
            ? el.checked
            : el instanceof HTMLInputElement && el.type === "range"
              ? Number(el.value)
              : el.value;
        (target as unknown as Record<string, unknown>)[key] = value;
        if (group === "tree")
          scene.items
            .filter((o) => o.kind === "ornament")
            .forEach((o) => {
              if (!treeInside(o.x, o.y, scene)) fitOrnament(o, scene);
            });
        changed();
      });
    });
}
function renderPath() {
  const selectEl = $<HTMLSelectElement>("#path-select");
  const p = scene.paths.find((p) => p.id === selectEl?.value);
  const target = $("#path-fields");
  if (!target) return;
  if (!p) {
    target.innerHTML = "";
    return;
  }
  target.innerHTML =
    colorField("颜色", "path.color", p.color) +
    (p.type === "lights"
      ? range("灯珠间距", "path.spacing", p.spacing, 5, 50) +
        range("亮度", "path.brightness", p.brightness, 0.2, 1, 0.05) +
        range("闪烁速度", "path.speed", p.speed, 0.1, 3, 0.1) +
        select("灯光模式", "path.mode", p.mode, [
          ["steady", "常亮"],
          ["breath", "轻柔呼吸"],
          ["alternate", "交替闪烁"],
        ])
      : range("丝带宽度", "path.width", p.width, 2, 14)) +
    btn("delete-path", "删除此段路径", "trash", "danger");
  target
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-field]")
    .forEach((el) => {
      el.addEventListener("pointerdown", commit);
      el.addEventListener("keydown", (e) => {
        if (
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
            (e as KeyboardEvent).key,
          )
        )
          commit();
      });
      el.addEventListener("input", () => {
        if (el instanceof HTMLSelectElement) commit();
        (p as unknown as Record<string, unknown>)[
          el.dataset.field!.split(".")[1]
        ] =
          el instanceof HTMLInputElement && el.type === "range"
            ? Number(el.value)
            : el.value;
        changed();
      });
    });
  $("#delete-path").onclick = () => {
    commit();
    scene.paths = scene.paths.filter((x) => x.id !== p.id);
    changed(true);
  };
}
function bindPanel() {
  document.querySelectorAll<HTMLElement>("[data-creation]").forEach(
    (b) =>
      (b.onclick = () => {
        const c = scene.creations.find((c) => c.id === b.dataset.creation)!;
        addItem("custom", "custom", c.data, c.surface);
      }),
  );
  bindFields($("#panel"));
  document.querySelectorAll<HTMLElement>("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        tab = b.dataset.tab!;
        renderPanel();
      }),
  );
  document
    .querySelectorAll<HTMLElement>("[data-ornament]")
    .forEach(
      (b) => (b.onclick = () => addItem("ornament", b.dataset.ornament!)),
    );
  document
    .querySelectorAll<HTMLElement>("[data-furniture]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          addItem(
            ["8", "9"].includes(b.dataset.furniture!) ? "gift" : "furniture",
            b.dataset.furniture!,
          )),
    );
  document.querySelectorAll<HTMLElement>("[data-color]").forEach(
    (b) =>
      (b.onclick = () => {
        activeColor = b.dataset.color!;
        const o = selected();
        if (o) {
          commit();
          o.color = activeColor;
          changed();
        }
        renderPanel();
      }),
  );
  $("#active-color")?.addEventListener("change", (e) => {
    activeColor = (e.target as HTMLInputElement).value;
    renderPanel();
  });
  const acts: Record<string, () => void> = {
    workshop: openWorkshop,
    "import-png": () => $("#png-file").click(),
    "clear-tree": () =>
      confirmAction(
        "从裸树开始？",
        "将移除所有挂饰、灯带、丝带和树顶装饰。家具与礼物将保留，此操作可以撤销。",
        () => {
          commit();
          scene.items = scene.items.filter(
            (o) => o.kind !== "ornament" && o.surface !== "tree",
          );
          scene.paths = [];
          scene.tree.topper = "none";
          changed(true);
          toast("一棵裸树，等你创造。");
        },
      ),
    "draw-lights": () => {
      drawTool = "lights";
      renderer.targetZoom = 1.35;
      updateZoom();
      renderPanel();
    },
    "draw-ribbon": () => {
      drawTool = "ribbon";
      renderer.targetZoom = 1.35;
      updateZoom();
      renderPanel();
    },
    "stop-draw": () => {
      drawTool = null;
      renderPanel();
    },
    firework: () => {
      renderer.firework();
      toast("愿所有小小心愿，都有回响。");
    },
    export: exportConfig,
    import: () => $("#config-file").click(),
    "snapshot-panel": snapshot,
    "cozy-panel": () => setMode("cozy"),
    reset: () =>
      confirmAction(
        "恢复默认小屋？",
        "当前布置将被替换。此操作可以撤销，也可先导出作品备份。",
        () => {
          commit();
          scene = makeDefault();
          renderer.selected = null;
          changed(true);
          updateThemes();
        },
      ),
    sound: toggleSound,
  };
  Object.entries(acts).forEach(([id, f]) => {
    const b = document.getElementById(id);
    if (b) b.onclick = f;
  });
  $("#path-select")?.addEventListener("change", renderPath);
}
function addItem(
  kind: Item["kind"],
  asset: string,
  data?: string,
  surface?: "tree" | "floor",
) {
  if (!ready) return;
  if (scene.items.length >= 500) {
    toast("已达到 500 件素材上限。");
    return;
  }
  commit();
  if (
    kind === "custom" &&
    data &&
    !scene.creations.some((c) => c.data === data) &&
    scene.creations.length < 64
  )
    scene.creations.push({
      id: uid(),
      name: `原创 ${scene.creations.length + 1}`,
      data,
      surface: surface || "tree",
    });
  const o: Item = {
    id: uid(),
    kind,
    asset,
    x: kind === "ornament" || surface === "tree" ? 630 : 650,
    y: kind === "ornament" || surface === "tree" ? 350 : 730,
    scale: kind === "ornament" ? 1 : kind === "furniture" ? 0.75 : 0.65,
    rotation: 0,
    color: kind === "ornament" ? activeColor : "#ffffff",
    data,
    surface,
  };
  if (kind === "furniture") {
    const def = furnitureAssets[Number(asset)];
    if (def.surface === "wall") {
      o.x = 1000;
      o.y = 295;
    }
    if (def.surface === "ceiling") {
      o.x = 780;
      o.y = 200;
    }
    if (def.surface === "table") {
      o.x = 310;
      o.y = 650;
    }
  }
  scene.items.push(o);
  renderer.selected = o.id;
  changed(true);
  toast("已添加，可直接拖动摆放。");
}
function removeSelected() {
  if (!selected()) return;
  commit();
  scene.items = scene.items.filter((o) => o.id !== renderer.selected);
  renderer.selected = null;
  changed(true);
}
function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}
function snapshot() {
  download(renderer.screenshot(), "pixel-noel.png");
  toast("小屋画面已保存。");
}
function exportConfig() {
  const u = URL.createObjectURL(
    new Blob([JSON.stringify(scene, null, 2)], { type: "application/json" }),
  );
  download(u, "pixel-noel.json");
  setTimeout(() => URL.revokeObjectURL(u), 2000);
}
function updateThemes() {
  document
    .querySelectorAll<HTMLElement>("[data-theme]")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.theme === scene.theme),
    );
}
function confirmAction(title: string, text: string, action: () => void) {
  const d = $<HTMLDialogElement>("#dialog");
  d.innerHTML = `<h2>${title}</h2><p>${text}</p><div class="dialog-actions"><button id="cancel">再想想</button><button class="primary" id="confirm">确认</button></div>`;
  d.showModal();
  $("#cancel").onclick = () => d.close();
  $("#confirm").onclick = () => {
    d.close();
    action();
  };
}
// One pointer model for mouse, pen and touch.
let drag: {
  id: string;
  x: number;
  y: number;
  ox: number;
  oy: number;
  moved: boolean;
  scale: number;
} | null = null;
const canvas = $<HTMLCanvasElement>("#scene");
canvas.addEventListener("pointerdown", (e) => {
  if (!ready || mode === "cozy") return;
  const p = renderer.point(e);
  canvas.setPointerCapture(e.pointerId);
  if (drawTool) {
    if (!treeInside(p.x, p.y, scene)) {
      toast("请从树冠上开始绘制。");
      return;
    }
    renderer.drawing = {
      id: uid(),
      type: drawTool,
      points: [[p.x, p.y]],
      color: drawTool === "lights" ? "#ffe2a1" : activeColor,
      width: drawTool === "lights" ? 2 : 7,
      spacing: 18,
      brightness: 1,
      speed: 1,
      mode: "breath",
    };
    return;
  }
  const sorted = [...scene.items].sort((a, b) => {
    const za =
        a.kind === "furniture" && a.asset === "4"
          ? -1
          : a.kind === "ornament" || a.surface === "tree"
            ? 651
            : a.y,
      zb =
        b.kind === "furniture" && b.asset === "4"
          ? -1
          : b.kind === "ornament" || b.surface === "tree"
            ? 651
            : b.y;
    return zb - za || scene.items.indexOf(b) - scene.items.indexOf(a);
  });
  const hit = sorted.find((o) => {
    const b = renderer.itemBounds(o);
    return (
      Math.abs(p.x - o.x) < b.w / 2 + 5 &&
      (o.kind === "ornament"
        ? Math.abs(p.y - o.y) < b.h / 2 + 5
        : p.y < o.y + 5 && p.y > o.y - b.h - 5)
    );
  });
  if (hit) {
    renderer.selected = hit.id;
    drag = {
      id: hit.id,
      x: p.x,
      y: p.y,
      ox: hit.x,
      oy: hit.y,
      moved: false,
      scale: hit.scale,
    };
    renderSelection();
  } else {
    renderer.selected = null;
    renderSelection();
    if (treeInside(p.x, p.y, scene) && mode !== "tree") setMode("tree");
  }
});
canvas.addEventListener("pointermove", (e) => {
  const p = renderer.point(e);
  if (renderer.drawing) {
    const points = renderer.drawing.points,
      prev = points.at(-1)!;
    if (Math.hypot(p.x - prev[0], p.y - prev[1]) > 3 && points.length < 3000)
      points.push([p.x, p.y]);
    return;
  }
  if (!drag) return;
  const o = selected();
  if (!o) return;
  if (!drag.moved) {
    if (Math.hypot(p.x - drag.x, p.y - drag.y) < 3) return;
    commit();
    drag.moved = true;
  }
  o.x = drag.ox + p.x - drag.x;
  o.y = drag.oy + p.y - drag.y;
  if (o.kind === "ornament" || o.surface === "tree") fitOrnament(o, scene);
  else {
    o.x = Math.max(65, Math.min(1135, o.x));
    const surface =
      o.kind === "furniture"
        ? furnitureAssets[Number(o.asset)].surface
        : "floor";
    const bounds =
      surface === "wall"
        ? [200, 550]
        : surface === "ceiling"
          ? [90, 230]
          : surface === "table"
            ? [540, 720]
            : [650, 780];
    o.y = Math.max(bounds[0], Math.min(bounds[1], o.y));
    o.scale = Math.max(
      0.3,
      Math.min(2, drag.scale * (1 + (o.y - drag.oy) / 700)),
    );
  }
});
function pointerEnd() {
  if (renderer.drawing) {
    if (renderer.drawing.points.length > 2) {
      if (scene.paths.length < 100) {
        commit();
        scene.paths.push(renderer.drawing);
        changed();
        toast("路径已保存，可在右侧调整。");
      } else toast("已达到 100 段路径上限。");
    }
    renderer.drawing = null;
    renderPanel();
  }
  if (drag?.moved) changed();
  drag = null;
}
canvas.addEventListener("pointerup", pointerEnd);
canvas.addEventListener("pointercancel", pointerEnd);
canvas.addEventListener("dblclick", () => {
  const o = selected();
  if (o?.kind === "gift")
    toast(o.note || "这份礼物还没有留言，选中它写一句祝福吧。");
});
document
  .querySelectorAll<HTMLElement>("[data-mode]")
  .forEach((b) => (b.onclick = () => setMode(b.dataset.mode!)));
document.querySelectorAll<HTMLElement>("[data-section]").forEach(
  (b) =>
    (b.onclick = async () => {
      section = b.dataset.section!;
      drawTool = null;
      if (section === "furniture") await ensureFurnitureArt();
      renderPanel();
    }),
);
document.querySelectorAll<HTMLElement>("[data-theme]").forEach(
  (b) =>
    (b.onclick = () => {
      commit();
      scene.theme = b.dataset.theme!;
      const t = themes.find((t) => t.id === scene.theme)!;
      scene.items
        .filter((o) => o.kind === "ornament")
        .forEach((o, i) => (o.color = t.colors[i % 3]));
      scene.paths.forEach(
        (p) =>
          (p.color =
            p.type === "lights"
              ? t.id === "winter"
                ? "#d9eeff"
                : "#ffe2a1"
              : t.colors[0]),
      );
      scene.tree.snow = t.id === "winter" ? 35 : 0;
      activeColor = t.colors[0];
      updateThemes();
      changed(true);
      toast(`已应用 ${t.name} 配色，保留你的布置。`);
    }),
);
$("#undo").onclick = () => {
  scene = history.undo(scene);
  renderer.selected = null;
  changed(true);
  updateThemes();
};
$("#redo").onclick = () => {
  scene = history.redo(scene);
  renderer.selected = null;
  changed(true);
  updateThemes();
};
$("#snapshot").onclick = snapshot;
$("#exit-cozy").onclick = () => setMode("room");
$("#zoom-in").onclick = () => {
  renderer.targetZoom = Math.min(1.7, renderer.targetZoom + 0.1);
  updateZoom();
};
$("#zoom-out").onclick = () => {
  renderer.targetZoom = Math.max(1, renderer.targetZoom - 0.1);
  updateZoom();
};
$("#zoom-reset").onclick = () => {
  renderer.targetZoom = 1;
  updateZoom();
};
document.addEventListener("keydown", (e) => {
  const input = e.target as HTMLElement;
  if (
    ["INPUT", "TEXTAREA", "SELECT"].includes(input.tagName) ||
    $<HTMLDialogElement>("#dialog").open
  )
    return;
  if (e.key === "Escape") {
    if (mode === "cozy") setMode("room");
    drawTool = null;
    renderer.selected = null;
    renderPanel();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    e.preventDefault();
    $(e.shiftKey ? "#redo" : "#undo").click();
  }
  if ((e.key === "Delete" || e.key === "Backspace") && selected()) {
    e.preventDefault();
    removeSelected();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && selected()) {
    e.preventDefault();
    $("#duplicate")?.click();
  }
});
$("#config-file").addEventListener("change", async (e) => {
  const input = e.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 8 * 1024 * 1024) throw Error("配置文件需小于 8 MB");
    const next = validate(JSON.parse(await file.text()));
    if (next.tree.preset === "spruce") await ensureImage("spruce");
    if (next.items.some((o) => Number(o.asset) >= 12))
      await ensureFurnitureArt();
    commit();
    scene = next;
    renderer.selected = null;
    changed(true);
    updateThemes();
    toast("你的圣诞小屋回来了。");
  } catch (err) {
    toast(err instanceof Error ? err.message : "导入失败");
  }
  input.value = "";
});
async function readPNG(file: File, grid = false) {
  if (file.size > 2 * 1024 * 1024) throw Error("PNG 请控制在 2 MB 以内");
  if (file.type !== "image/png") throw Error("请选择 PNG 格式图片");
  const u = URL.createObjectURL(file),
    i = new Image();
  try {
    i.src = u;
    await i.decode();
    if (i.width > 2048 || i.height > 2048)
      throw Error("图片边长不得超过 2048 像素");
    const c = document.createElement("canvas");
    const f = Math.min(1, 256 / i.width, 256 / i.height);
    c.width = grid ? 32 : Math.round(i.width * f);
    c.height = grid ? 32 : Math.round(i.height * f);
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(i, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(u);
  }
}
$("#png-file").addEventListener("change", async (e) => {
  const input = e.target as HTMLInputElement,
    file = input.files?.[0];
  if (file)
    try {
      const data = await readPNG(file);
      addItem(
        "custom",
        "custom",
        data,
        section === "furniture" ? "floor" : "tree",
      );
    } catch (err) {
      toast((err as Error).message);
    }
  input.value = "";
});
let audio: AudioContext | undefined,
  audioTimer: ReturnType<typeof setInterval> | undefined,
  noise: AudioBufferSourceNode | undefined;
function toggleSound() {
  if (scene.env.sound) {
    scene.env.sound = false;
    clearInterval(audioTimer);
    noise?.stop();
    audio?.suspend();
    changed(true);
    return;
  }
  audio ??= new AudioContext();
  audio.resume();
  scene.env.sound = true;
  const notes = [0, 4, 7, 12, 7, 4, 2, 5, 9, 14, 9, 5];
  let note = 0;
  const play = () => {
    if (document.hidden) return;
    const a = audio!,
      t = a.currentTime;
    const osc = a.createOscillator(),
      gain = a.createGain();
    osc.type = "sine";
    osc.frequency.value = 261.63 * 2 ** (notes[note++ % notes.length] / 12);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.04, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
    osc.connect(gain).connect(a.destination);
    osc.start();
    osc.stop(t + 2.6);
  };
  play();
  audioTimer = setInterval(play, 1100);
  const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate),
    ch = buffer.getChannelData(0);
  for (let j = 0; j < ch.length; j++) ch[j] = (Math.random() * 2 - 1) * 0.015;
  noise = audio.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const low = audio.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 300;
  noise.connect(low).connect(audio.destination);
  noise.start();
  changed(true);
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) audio?.suspend();
  else if (scene.env.sound) audio?.resume();
});
$("#help").onclick = () => {
  const d = $<HTMLDialogElement>("#dialog");
  d.innerHTML = `<div class="dialog-head"><h2>A little guide</h2><button class="icon-button" id="close-dialog" aria-label="关闭">${icon("close")}</button></div><p>点击树进入 Tree Studio；在素材库点选挂饰或家具添加到小屋，再拖动摆放。选中对象后可在面板中编辑。灯带工具允许直接在树冠上画线。所有修改自动保存在当前浏览器。</p><div class="help-keys"><span><kbd>⌘ / Ctrl Z</kbd>撤销</span><span><kbd>⌘ / Ctrl ⇧ Z</kbd>重做</span><span><kbd>⌘ / Ctrl D</kbd>复制</span><span><kbd>Delete</kbd>删除选中</span><span><kbd>Esc</kbd>退出沉浸 / 取消选择</span><span><kbd>双击礼物</kbd>读取祝福</span></div><p>通过左下方作品管理导出配置、导入备份或恢复默认。像素画板的作品可以直接挂到树上，全部在本地完成。</p>`;
  d.showModal();
  $("#close-dialog").onclick = () => d.close();
};
// Lazy-created 32 × 32 pixel workshop, independent undo/redo.
function openWorkshop() {
  showWorkshop({ icon, toast, readPNG, addItem, download });
}
$("#open-workshop").onclick = openWorkshop;
async function init() {
  try {
    await loadArt();
    const saved = await loadScene().catch(() => null);
    if (saved) {
      scene = saved;
      if (scene.tree.preset === "spruce") await ensureImage("spruce");
      if (scene.items.some((o) => Number(o.asset) >= 12))
        await ensureFurnitureArt();
    }
    ready = true;
    readyAt = performance.now();
    $("#loading").remove();
    renderPanel();
    syncHistory();
    updateThemes();
    renderer.start();
  } catch (e) {
    $("#loading").innerHTML = "<small>素材未能加载，请刷新重试。</small>";
    console.error(e);
  }
}
init();
// A read-only diagnostic interface for repeatable browser QA.
Object.defineProperty(window, "pixelNoel", {
  value: {
    get scene() {
      return structuredClone(scene);
    },
    get fps() {
      return renderer.fps;
    },
    get readyAt() {
      return readyAt;
    },
    get ready() {
      return ready;
    },
  },
  writable: false,
});
