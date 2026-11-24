# Pixel Noël — Art and interaction direction

## Visual contract

Straight-on Nordic cabin, visible depth, fixed architecture. The tree is the focal point, roughly 72% of the 800px scene height. The left window owns cold blue/violet snow, the right stone hearth owns warm orange/gold. Wood, needles, glass, brass and textiles need distinct detailed pixel texture. Architectural raster is not an editable full-scene photograph: furnishings, tree, baubles, strands, gifts and companions are separate objects.

Two user-supplied references arrived during development and were visually inspected. The interior reference informed central red/gold decoration, timber structure, window/hearth balance and textiles; the landscape reference informed layered blue snow, village windows and pines. Neither reference is included in distribution or used as the runtime background.

Palette: ink `#101b17`, pine `#223c2e`, brass `#dfc18a`, warm white `#e9e8de`, Christmas red `#be4b3e`, cold blue `#8eacc0`. Four theme presets tint shared resources without duplicating room art.

Art masters are detailed AI-assisted raster work produced for this project, rendered with nearest-neighbor sampling. They are not represented as hand-painted, palette-quantized, perfectly grid-certified sprites. Native atlas sizes and source rectangles are recorded explicitly; do not blindly assume generated sheets follow their requested grid.

## Composition

Logical scene 1200 × 800. Tree anchor (630,650), variable height 460–620 and width 280–480. Fixed room/floor junction around y=630. Floor objects anchor at their bottom centers; rugs draw behind all props, then floor objects and tree sort by anchor depth. Wall, tabletop and ceiling decor have bounded vertical placement. No arbitrary furniture rotation. The full-room view, tree camera and Cozy view reuse the same canvas and scene.

Snow/fireworks clip to separate glass panes; they never become an outdoor map. Fireplace belongs behind foreground furniture. Tree strands use a canopy envelope. This envelope is an approximation and does not claim per-needle occlusion.

## Technology choice

Canvas 2D was selected over PixiJS because the scene needs a few dozen sprites, at most 200 snow particles, short polylines and a fixed camera. The browser already supplies sprite compositing, clipping, offscreen caching and export. PixiJS would add GPU batching, texture management and a renderer dependency that are unnecessary for this scale. No unsupported claim about a universal Canvas/Pixi performance winner is made. The shipped JS/CSS sizes and actual browser timings are measured separately.

Tree compositing caches until tree parameters change. Art is baked during development. Additional furniture loads on demand. One animation loop pauses rendering in hidden tabs. Audio is user initiated and suspended while hidden. Sprite assets are lossless WebP; there are no production npm dependencies or font CDN requests.

## State and editing

Versioned JSON scene: tree parameters, object list, light/ribbon paths, environment and reusable user creations. IndexedDB auto-save after edits. Snapshot history is bounded to 80 actions. Pixel workshop has its own bounded history. Imports validate types, finite numbers, known sprites, PNG payloads, identifiers, bounds and count limits before replacing the scene. Original photos are never requested or uploaded.

## Deferred work

Additional botanical variants, segmented recolor masks, dense per-branch occlusion, physically tested mobile/Safari/Firefox support, full modular personal character and local photo analysis. These are recorded rather than represented as finished functionality.
