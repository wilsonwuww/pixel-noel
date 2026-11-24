# Contributing

Run `npm ci`, `npm run dev`, and read DESIGN.md before changing the cabin. Keep one Canvas renderer, one shared scene and no runtime API-key requirement. Preserve transparent sprite independence.

For artwork, follow ASSET_SPEC.md and include provenance and licenses. Append furniture metadata and assets; inspect the actual atlas frames on light and dark backgrounds. Do not submit user photos, user reference images, secrets, generated model weights, or unlicensed internet sprites.

For behavior, test the concrete user flow, undo/redo, save/reload and export/import. Run `npm run build`; then `CI=1 npm test` after installing Playwright Chromium. Local tests can use installed Chrome. Check both desktop and phone layouts; emulation does not replace real hardware testing. Save representative screenshots when the visuals change.

Open a focused PR explaining the problem, resulting behavior, relevant validation and any limitations. Avoid increasing the runtime package footprint without measured benefit. Do not hide visual tradeoffs to satisfy a byte budget.
