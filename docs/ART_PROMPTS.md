# Asset briefs and generation provenance

Tool: native image generation, development only. All delivery files are copied into this project and losslessly encoded as WebP. The public application does not call an image generator. User references are excluded from the repository.

## Room shell — assets/room/room.webp

Production game art, wide 1536×1024, refined high-fidelity pixel art, fixed straight-on Nordic cabin. Warm honey oak walls and beams, floor in lower portion, large left mullioned window with blue-purple snowy village, distant mountains and pine forests. Right built-in gray stone fireplace, dark empty firebox, evergreen mantel garland and red stockings. Bare cream center wall for an independent tree. No tree, movable furnishings, rug, gifts, people, pets, UI or writing. Distinct finely dithered wood/stone material and cold/warm contrast.

## Bare fir — assets/trees/tree.webp

Final brief: “TRANSPARENT PNG GAME SPRITE. One entire undecorated Nordmann fir tree in a woven basket. Very dense dark evergreen needle branches, broad full natural conical silhouette, front view, detailed Nordic Christmas high fidelity pixel art. Absolutely isolated on ALPHA ZERO TRANSPARENCY. No background at all. No shadows. No glow. No halo. No vignette. No green atmosphere. Only opaque tree and basket pixels, every surrounding pixel fully transparent. Entire tree fully in frame. No decorations or ornaments or star or snow or lights. Intricate layered visible pine branch needle texture. Strong full beautiful 14 branch tier silhouette with rich dark emerald and forest greens. Warm subtle right-facing highlights ON NEEDLES ONLY. Width 2/3 height. This is an isolated asset for placing on a cream wall, green backdrop is forbidden.”

Earlier master/cutout attempts were inspected but not shipped. Transparent source RGB previews may show residual matte colors; actual alpha and browser composition were checked rather than trusting a raw RGB preview.

## Ornament atlas — assets/ornaments/ornaments.webp

Twelve isolated luxurious Nordic ornaments in four columns and three rows, transparent margins, hi-fi pixel material and common warm lighting. Ruby glass bauble with gold snowflake, red velvet bow, brass bell, ivory snowflake; gingerbread man, Dala horse, ornate golden star, snowy miniature chalet; candy cane, candle lantern, pine cone and Scandinavian heart. No text, background, floor or grid lines. The generated atlas is 1254×1254 and uses explicitly recorded native source rectangles.

## Furniture atlases — assets/furniture/furniture.webp and furniture2.webp

First: 4×3 independent front-view props, warm top-right light, slightly visible tops and rich pixel material. Red fabric sofa with cream blanket, cocoa coffee table, cream reading armchair, oak bookcase; foreshortened red rug, brass floor lamp, record player, green plant; red/gold gift, cream/green gift, knit cushion and candle.

Second: 4×3 isolated props matching the first sheet. Oak rocker, side table, brass lantern, red-ribbon wreath; folded cream blanket, red Nordic cushion, antique books, firewood basket; snow globe, winter garland, brass chandelier, knitted footstool. Generated sheets do not exactly match requested cell margins; integration uses inspected per-item source rectangles instead of blindly slicing a grid.

## Pet poses — assets/pets/pets.webp

4×2 production sprite sheet, transparent margins, common baseline. Ginger cat then cocoa spaniel. Columns: idle, walking A, walking B, curled-up asleep. Side view, fine crisp fur pixels, no accessories or background. Frames are original generated poses rather than claims of motion-captured or video-generated animation.

## Blue spruce — assets/spruce/spruce.webp

Independent bare blue spruce and weathered wooden barrel. Dense silver-blue/emerald needle clusters, natural pointed crown and fourteen layered branch tiers, front view, genuine alpha transparency, subtle warm right-facing highlights. No backdrop, atmosphere, halo, lights, baubles, star, snow or gifts. Separate botanical master, loaded only when selected.

## Review

In-browser composition checks cover proportion, source-frame clipping, alpha, nearby material harmony and the tree as visual focal point. Original procedural UI symbols, pixel effects and optional personal character are code-authored. Not all generated masters use a mathematically perfect shared pixel lattice; this remains a documented art refinement area.
