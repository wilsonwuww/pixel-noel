# Development research — 2026-11-24

These tools were inspected as candidates, not installed or executed. Repository metadata and the relevant README, package manifest or skill source were read from their original GitHub endpoints. `research-metadata.json` records the queried license metadata. A readable repository or license is not evidence that its full generation pipeline has been reproduced locally.

| Candidate | Checked availability / license | Dependency and quality assessment | Decision |
| --- | --- | --- | --- |
| [Pixel Art Skill](https://github.com/sorawit-w/agent-skills/tree/main/skills/pixel-art) | Source readable; repository MIT | Hi-fi prompt system, single-subject scope, quantization/grid auditing. A generated raster is not automatically a perfect pixel grid. | Adopt detailed material/lighting briefs and explicit visual review; no script execution or imported source. |
| [Pixel Studio](https://github.com/alanfrigo/pixel-studio) | Repository/package MIT | Next/React + Python pipeline; Node ≥24; provider-based generation. Useful exact grid, alpha and export ideas, larger than a static runtime needs. | Development reference only; no runtime dependency or API key. |
| [Agent Skill Pixel Art](https://github.com/ervareza/agent-skill-pixel-art) | `skills/pixel-art/SKILL.md` readable; repository MIT | Broad generation/audit/export workflow tied to host image capabilities. Root SKILL.md is absent; correct nested file inspected. | Use independent sprite and alpha QA concepts; not blindly executed. |
| [Agent Sprite Forge](https://github.com/0x0funky/agent-sprite-forge) | `skills/generate2dsprite/SKILL.md` readable; repository MIT | Host/provider routing, master/animation separation, frame registration. Video routes add unnecessary cost/dependencies here. | Use atlas bounds and pose-baseline review; no video pipeline. |
| [Dot Asset Generator](https://github.com/abagames/agentic-gamedev-skills/tree/main/.agents/skills/generating-dot-assets) | Nested skill readable; repository MIT | Requires image generation and ImageMagick for its scripts. Documents keying, exact fitting and alpha validation. | Native image tool used directly; no unknown scripts or forced reduction of detail. |
| [Anthropic Frontend Design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Source and local LICENSE.txt readable; Apache-2.0 for that skill | Design guidance, no renderer requirement; repository-level license metadata alone was inconclusive. | Subject-specific pine/brass brand and restrained studio UI; no copied skill source. |
| [Piskel](https://github.com/piskelapp/piskel) | Package/license Apache-2.0 | Full sprite editor with its own build/test stack; unnecessary to bundle for a small 32px workshop. | Implement a bounded original editor, no embedded Piskel copy. |
| [Lospec](https://lospec.com/) | Website publicly accessible | Palette/art reference collection, not a blanket license to redistribute gallery art. | Original project palette; no art downloaded. |

The host's image generation tool created room shell, bare tree, independent ornament atlas, two furniture atlases and a pet pose sheet. This is a development-only step. The published site only decodes local lossless images and composes them in Canvas 2D.

Canvas/Pixi choice and measured performance limits: DESIGN.md and QA.md. Visual reference images are excluded from all source and release archives.
