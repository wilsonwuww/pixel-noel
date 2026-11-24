export type AssetDefinition = {
  id: string;
  name: string;
  category: "furniture" | "gift";
  image: string;
  frame: [number, number, number, number];
  size: [number, number];
  anchor: [number, number];
  surface: "floor" | "wall" | "table" | "ceiling";
  author: string;
  license: string;
  recolor: "hue";
  animation?: { frames: number; fps: number };
};
export let furnitureAssets: AssetDefinition[] = [];
export async function loadManifest() {
  const r = await fetch(`${import.meta.env.BASE_URL}assets/manifest.json`);
  if (!r.ok) throw Error("素材清单无法读取");
  const manifest = await r.json();
  furnitureAssets = manifest.furniture;
  return furnitureAssets;
}
