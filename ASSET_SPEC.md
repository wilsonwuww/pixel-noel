# Asset specification v1

Furniture is data-driven: append an entry to `public/assets/manifest.json`. No renderer change is needed for a new furniture pack. All art must share front perspective, coherent amber lighting and a consistent high-detail pixel finish.

```json
{
  "id": "24",
  "name": "A small winter lantern",
  "category": "furniture",
  "image": "my-pack",
  "frame": [0, 0, 128, 192],
  "size": [80, 120],
  "anchor": [0.5, 1],
  "surface": "table",
  "author": "Your name",
  "license": "CC-BY-4.0",
  "recolor": "hue"
}
```

`image` resolves to `public/assets/<image>/<image>.webp`; `furniture2` is the existing second furniture atlas in the furniture directory. Add the new file, choose an unused sequential numeric id (the registry index must match), and append the definition. The loader discovers image keys from the registry and loads them on entering the furniture panel or restoring a scene that uses them.

`frame` is the exact source rectangle in native pixel units; `size` is the nominal logical scene size before user scaling. Anchors are currently fixed to bottom-center for furniture and recorded as `[0.5,1]`; alternative anchors are reserved for a future schema. Surfaces: floor (y650–780), wall (y200–550), table (y540–720), ceiling (y90–230). Table range is an editing aid, not automatic attachment to a moving table. Depth sorts by the object's anchor; rugs are an explicit behind-all category in this version (built-in index 4).

Ornaments share a 4×3 atlas and a nominal 24×28 drawing size. Their registry includes native frame, name, anchor, surface, author and license. The current 12 ornament types and two tree masters are fixed built-ins; general tree/ornament pack discovery is future work. Custom PNG import and the pixel workshop already provide a no-code extension path.

Pets use a 4×2 sheet: rows cat/dog, columns idle/walk A/walk B/sleep. Frames have a common baseline. Animation selects recorded poses at a low frame rate; it does not generate video or run a model.

Keep transparency in PNG source and lossless WebP delivery. Confirm alpha on a light wall, dark pine and checkerboard. Crop by observed bounds, not by the generation prompt. Extra atlas furniture has source rectangles explicitly checked against the generated sheet.

Imports accept PNG only, at most 2 MB and 2048×2048. Delivery objects are fitted to at most 256px with nearest-neighbor sampling; the pixel editor offers 32-grid fitting and preserves aspect ratio when grid fitting is off. Color coordination is manual; there is no forced palette quantization. JSON max 8 MB, 500 scene objects, 100 paths, 3000 samples/path, 64 reusable original designs. Custom pictures are embedded in JSON backups and remain local.

Every contributed pack needs an author, license, provenance, native dimensions, pixel-scale note and permission to redistribute. Original artwork and third-party imports retain their own licenses; code's MIT license does not override them.
