---
name: Maison Glint — Visual Direction & Video Pipeline Rules
version: '1.0'
status: creative_direction_ready_product_geometry_pending_validation
primary_persona: Pinterest-Perfect Millennial Host
brand_idea: The Art of Gathering
product_reference: product.md
verbal_reference: voice.md
visual_reference: DESIGN.md
lighting_blueprints: 6
camera:
  focal_lengths_full_frame_equivalent_mm: [85, 100]
  elevations_above_table_plane_deg: [90, 30]
  aperture_targets: [2.8, 4.0]
  default_aperture: 4.0
  default_motion: locked_off
product_geometry_source: approved_reference_or_explicitly_labeled_draft
---

# Maison Glint — Content Engine

## 1. Purpose & Source Hierarchy

This is the prompt and camera bible for static images and video made through Veo, AI Studio, or another approved generation interface. It defines the creative brief, reference requirements, motion limits, prompt structure, and review gates. It does not assume a particular model version or undocumented API parameter.

Read the companion files before generating:

| Source | Governs |
| --- | --- |
| `product.md` | Geometry, finish intent, material facts, and physical exclusions. Draft fields remain draft. |
| `DESIGN.md` | Palette, composition, packaging direction, warm hosting context, and brand continuity. |
| `voice.md` | Captions, titles, emails, overlay wording, and correspondence voice. |
| Approved product photographs and drawings | The actual silhouette, bead, basin, proportions, and surface appearance. |
| This file | Lighting, camera, scene construction, prompts, video sequencing, and review. |

If a generated result conflicts with an approved product reference, the reference wins. If references contradict one another, hold the affected asset and identify the conflict. Do not average competing shapes or mix specifications from earlier documents.

Current product dimensions are draft targets. Images made without approved product references are **concept visuals**, not verified product depictions. Do not present them as manufacturing evidence or a photograph of delivered inventory.

## 2. Core Visual Direction

The primary scene is an intimate table prepared for company. Reflective steel sits among linen, stone, oak, and restrained seasonal food. The object feels considered and usable.

Use the **70/30 material balance** for lifestyle compositions: approximately 70% matte or organic surroundings and 30% reflective steel. This describes visual emphasis, not a strict pixel calculation. Detail photographs and inspection views are exempt when they need to reveal the object clearly.

Lead with the Host Set: four Object 01 pieces and four coherent settings. Use The Duo for two-person stories. Use one Object 01 for detail or single-object content. State counts in every prompt. Never rely on the model to infer offer contents.

Keep the palette consistent: charcoal, warm ivory, natural linen, travertine, dark oak, silver steel, and small terracotta accents. Warm reflections may cross the steel. Its underlying material must remain silver rather than gold, bronze, or colored chrome.

## 3. Coordinate System

Every brief uses these definitions:

- **Camera elevation:** Angle above the horizontal tabletop. 90° is directly overhead, with the optical axis perpendicular to the table. 30° is the low rake, with the optical axis descending toward the subject at 30° to the table.
- **Key-light elevation:** Angle above the tabletop at the object centre. This is independent of camera elevation.
- **Light azimuth:** Direction around the object in plan view. The camera side is 0° for rake shots. For overhead shots, the lower image edge is 0°. Image left is −90° and image right is +90°.
- **Kelvin value:** The creative target for the source, not a claim that generated light is physically calibrated. White balance is specified separately.

Do not use “30° angle” without identifying camera or light. Keep these values consistent across frames in one sequence.

## 4. The Six Fixed Lighting Blueprints

The first three names and settings follow the supplied examples. The remaining three complete the proposed Maison Glint system. All six are creative production targets, not measured lighting data.

| ID / archetype | Key CCT / elevation / azimuth | Source and shadow | White-balance target | Primary use |
| --- | --- | --- | --- | --- |
| L01 — Dawn Horizon | 2800K / 15° / −90° | Broad low window strip, softly defined long shadows | 4000K | Early table preparation; linen, figs, and oak |
| L02 — Architectural Day | 5500K / 45° / −45° | Large diffused window, clean soft shadows | 5500K | Product introduction, proportions, neutral material appearance |
| L03 — Gallery Halogen | 3200K / 60° / +45° | Controlled small source with diffusion, distinct rim highlight | 3800K | Sculptural single-object and rim studies |
| L04 — Candlelit Gathering | 2800K / 20° / −60° | Soft motivated key; visible candle practicals approximately 1900K | 3400K | Warm four-person evening scene |
| L05 — Overcast Linen | 6500K / 45° / −90° | Very broad soft source, minimal shadow edge | 6000K | Quiet daytime tablescapes and soft texture contrast |
| L06 — Atelier Strip | 5000K / 60° / +90° | Narrow diffused strip, controlled highlight gradient | 5000K | Mirror Polish detail and neutral rim inspection imagery |

**L01:** Preserve detail in warm ivory. Do not turn the whole frame orange. Long shadows should agree with the low key position.

**L02:** Use this as the neutral anchor for a campaign. Show silver honestly. Maintain enough reflected structure for the object to remain visibly metallic.

**L03:** Keep the key controlled without burning the rim to featureless white. The object remains within a domestic visual language, not a black void in every asset.

**L04:** Candles are visible practical sources. The soft key supplies readable exposure. Do not ask candle flames alone to produce a uniformly bright table. Reflections must correspond to actual flame positions.

**L05:** Keep linen warm-neutral despite the cooler source. Avoid blue steel, flat grey rendering, or a clinical mood.

**L06:** Use the strip to reveal curvature and surface continuity. Do not generate a second rim or a white painted band in place of the reflection.

Choose exactly one blueprint per shot. Keep it fixed across that shot. A sequence may change blueprint only at a deliberate scene cut. Variations require a named revision, not ad hoc mixing of temperatures and directions.

## 5. Reflection Control & Exposure

Mirror Polish reflects its environment. Shape that environment before adding stylistic adjectives.

Use black flags or negative fill on the unlit side to produce a clean charcoal reflection in part of the basin. Retain a bright, continuous rim highlight and a readable silver midtone. A predominantly dark basin can work for a hero view, but do not impose a fixed dark-area percentage on every composition.

Exclude accidental reflections of cameras, rigs, crew, ceiling fixtures, and unrelated room clutter. Deliberate hands and guests may appear only when required by the shot.

Avoid clipped highlights, crushed basins, artificial chrome glow, and reflections that ignore the scene. Do not use global desaturation to hide incorrect material color. No simulated optical reflectivity percentage belongs in a prompt; the draft >92% target in `product.md` is not verified and cannot be established visually.

Match highlight direction, shadow direction, candle placement, and reflected objects. In video, these relationships must remain physically coherent over time.

## 6. Camera Standards

### Fixed lens and elevation combinations

| Shot class | Lens, full-frame equivalent | Elevation | Aperture target | Focus priority |
| --- | --- | --- | --- | --- |
| Complete table / set | 85mm | 90° or 30° | f/4 | All advertised pieces identifiable; selected hero setting sharp |
| Single-object hero | 85mm | 90° or 30° | f/4 | Basin and leading rim |
| Intimate lifestyle detail | 85mm | 30° | f/2.8 | One intentional detail; background may soften |
| Rim / surface macro | 100mm macro | 90° or 30° | f/4 | Selected rim or finish feature |

85mm and 100mm are full-frame-equivalent framing references. For a real shoot on a different sensor, calculate the corresponding physical lens and working distance. In generated content, these values communicate a visual target; they do not prove camera metadata.

Use adequate working distance to fit a complete table with 85mm. Do not solve a tight crop by introducing a wide-angle perspective. Macro crops must not be used as evidence of full-object dimensions.

### Focus and depth of field

Default to f/4. Reserve f/2.8 for a single intended detail. A 30° table scene at these apertures may not keep every setting sharply focused. Use an overhead composition with surfaces near the same plane, adjust working distance, or simplify the scene when clarity matters.

Do not request contradictory “extremely shallow depth of field” and “every object tack sharp” in the same prompt. For static product-detail work, a documented focus stack is permitted when it preserves truthful geometry. It is not a video technique or a reason to invent sharpness transitions.

Keep focus fixed during each generated shot. Rack focus is outside the default system and requires a separately specified shot. Do not show focus breathing as a product shape change.

### Framing and motion

Use only strict 90° overhead or 30° rake. No Dutch angles, fisheye, ultrawide distortion, orbiting views, or angle drift. Horizon and table edges remain stable.

Default to a locked camera. A slow linear push or lateral slide is permitted for approved hero shots if elevation, focal length, and product proportions remain fixed. For real movement, change camera position rather than focal length. Avoid digital zooms that make a static frame appear to change geometry.

## 7. Product & Scene Locks

Record these before each generation:

| Lock | Required entry |
| --- | --- |
| Reference | Approved image or drawing ID, or explicit draft-concept status |
| Product count | 1, 2, or 4, matching the intended offer |
| Geometry | Circular outline, continuous beaded rim, seamless flat basin, reference proportions |
| Finish | Mirror Polish appearance; silver substrate; no coating implied |
| Setting | Surface material, linen tone, props, and food placement |
| Lighting | One L01–L06 ID and its parameters |
| Camera | 85mm or 100mm macro; 90° or 30°; f/2.8 or f/4 |
| Motion | One action at most, plus fixed or approved simple camera motion |
| Output | Aspect ratio, target duration where relevant, and intended placement |

Maintain prop positions, food quantity, rim shape, set count, and surface character across adjacent shots. Food must rest on the basin rather than float or merge into it. The table must support the object. Fingers must contact the correct surface without passing through metal.

Packaging remains governed by the approved packaging reference. Do not invent a drawer mechanism, insert, foil mark, or four-piece packing configuration that has not been approved. Add exact logos and text in post-production rather than relying on generated lettering.

## 8. Negative Prompt Matrix

The universal denylist is a semantic instruction. `--no` is shorthand in this document, **not a guaranteed Veo or AI Studio parameter**. Use a dedicated negative-prompt field only when the selected interface supports it. Otherwise write exclusions explicitly in the prompt. Negative prompts reduce risk; they do not replace inspection.

**Universal denylist shorthand:**

```text
--no tikli, decorative patterns, engravings, stamped metal patterns,
floral etching, factory debossing, embossed logos, plastic sheen,
oversaturated colors, fingerprints, smudges, buffing burns,
compartments, hammered texture, gold plating, scalloped rims,
warped circles, duplicated rims, floating objects, illegible text
```

| Layer | Additional exclusions |
| --- | --- |
| Product geometry | Changing diameter, changing rim height, added feet, seams, handles, holes, centre medallions, decorative grooves |
| Material | Matte plastic, liquid metal, glass transparency, chrome paint, unexplained rainbow coating, rubber edges |
| Reflection | Camera or crew reflections, phantom candles, detached highlights, impossible reflected props |
| Styling | Neon accents, excessive clutter, sterile cafeteria staging, ornamental luxury props unrelated to the scene |
| Camera | Wide-angle distortion, fisheye, Dutch angle, orbit, focal-length change, unplanned rack focus |
| Video | Morphing, flicker, texture crawl, temporal warping, prop teleportation, object duplication, changing food, inconsistent shadows |
| People | Extra fingers, fused hands, impossible grip, skin-metal merging, spontaneous faces |
| Text and branding | Invented wordmarks, garbled lettering, factory logos, model-generated watermarks |

Do not strip required platform provenance labels or metadata. The watermark exclusion concerns invented visual marks inside the generated scene.

For a documented wear or care demonstration, use an approved used-object reference and intentionally permit the specific wear being explained. Do not use clean-surface exclusions to erase real condition information. For customer product imagery, preserve actual representative surface character.

## 9. Static Image Prompt Architecture

Use this order: purpose → reference → exact count and geometry → scene → lighting → camera → composition → exclusions → output constraints.

```text
PURPOSE: [campaign role and audience]
STATUS: [approved product depiction / draft concept]
REFERENCE: [approved reference identifier]
PRODUCT: [exact count] Object 01 pieces. Preserve the reference silhouette,
continuous beaded rim, seamless flat basin, and Mirror Polish appearance.
SCENE: [surface, linen, food, and restrained props]
LIGHT: [one blueprint ID, source CCT, elevation, azimuth, white balance]
REFLECTIONS: Controlled negative fill. Readable silver midtones.
CAMERA: [85mm / 100mm macro] full-frame equivalent.
Elevation [90° / 30°] above the table. Aperture target [f/2.8 / f/4].
Focus on [specific feature].
COMPOSITION: [aspect ratio, subject position, overlay space, crop allowance]
EXCLUSIONS: [universal denylist plus relevant matrix layers]
OUTPUT: No baked-in text. Preserve product count and geometry.
```

### Example A — Host Set discovery image

Four Object 01 pieces form four settings on dark oak. Natural linen, restrained seasonal food, and two candles establish an intimate evening. Use L04 with its soft 2800K key at 20° and −60° azimuth, warm candle practicals, and 3400K white balance. Use strict 90° overhead, 85mm equivalent, and f/4. Compose vertically for 2:3. Keep every piece countable and leave quiet space above the table for later typography. Apply the universal and reflection exclusions. Use approved geometry or label the image as a concept.

### Example B — Neutral finish study

One Object 01 piece against warm ivory and folded linen. Use L02 at 5500K, 45° elevation, and −45° azimuth. White balance 5500K. Camera at 30° rake with 85mm equivalent and f/4. Focus on the basin and front rim. Preserve controlled dark reflection without hiding the silver surface. Compose 4:5. No text or additional product pieces.

### Example C — Rim detail

One Object 01 piece, tightly cropped to its approved beaded rim and adjoining basin. Use L06 at 5000K, 60° elevation, and +90° azimuth. Camera at 30° rake, 100mm macro equivalent, f/4. Keep the bead profile consistent with the reference. Show a continuous highlight gradient rather than a painted stripe. Compose 4:5. Do not imply dimensions or polishing performance from the image.

## 10. Video Pipeline

### Stage 1 — Capability and asset check

Record the selected model and interface. Verify its actual aspect-ratio options, supported duration, resolution, reference-image handling, frame controls, audio behavior, and negative-prompt support in that interface before submitting a job. Do not assume controls are shared across model versions.

Create a generation record with the product reference, prompt revision, shot ID, blueprint, and intended output. Confirm rights to supplied reference assets.

### Stage 2 — Storyboard and reference frame

Build short shots around one action each. Approve a static reference frame before animation. Where supported, use that frame as an image-to-video reference. Otherwise provide the reference through available controls and expect additional review for drift.

Prefer simple, independently generated shots to a single long clip with several scene changes. Establish product count and geometry in the reference frame. Do not ask the model to reveal unseen packaging mechanics or unreferenced construction details.

### Stage 3 — Motion brief

Specify starting state, action, ending state, camera behavior, focus, light, and continuity locks. Avoid vague requests such as “cinematic movement.” A candle flicker or one hand placing linen is enough.

```text
SHOT: [identifier]
REFERENCE: [approved still]
DURATION TARGET: [editorial duration; adapt to supported generation length]
START: [exact scene state]
ACTION: [one simple action]
END: [exact scene state]
CAMERA: [locked / slow linear push / lateral slide], fixed elevation and lens.
FOCUS: Fixed on [feature].
LIGHT: [blueprint]; consistent direction and color throughout.
CONTINUITY: Preserve product count, rim, basin, props, and food placement.
AUDIO: [silent generation if supported / room tone / specific permitted sound]
EXCLUSIONS: Universal denylist plus video, reflection, and relevant people rules.
```

### Stage 4 — Generate and inspect

Generate each shot independently. Review the full clip at normal speed, then inspect transitions and high-motion moments frame by frame. A good opening frame is not evidence that the whole clip passes.

If geometry drifts, reduce motion, simplify props, strengthen the reference, or split the action. Do not conceal a misleading product transformation through a rapid cut or blur. Rework or discard the affected shot.

### Stage 5 — Edit, sound, and typography

Use calm straight cuts. Avoid glitch transitions, speed ramps, aggressive zooms, and false slow motion created by broken interpolation. Preserve a stable grade across shots.

Default sound is quiet room tone, linen movement, or subtle table-setting audio. Avoid exaggerated metallic clangs and luxury-advertising impact sounds. Generated audio must be reviewed separately. Use music only with appropriate rights. Do not add dialogue by default.

Set exact typography and wordmarks in the editor. Apply `voice.md`: short observations, zero exclamation marks, no banned vocabulary, no pressure-led CTA. Keep essential product information outside ambiguous visual storytelling.

### Stage 6 — Export and archive

Preserve the original generation and make a separate delivery export. Record original dimensions, frame rate, and duration. Do not describe an upscaled file as native higher-resolution generation. Use the editor's supported delivery settings and check the exported file itself.

Archive the approved reference, prompts, model identifier, shot revisions, raw output, edit, rights notes, and QA result. Record a seed only if the interface actually exposes one. A repeated seed is not a universal continuity guarantee.

## 11. Default 15-Second Sequence

This is an editorial timing plan. Generate supported clip lengths and trim them to the plan. Do not assume the tool accepts these exact segment durations.

| Timeline | Shot | Camera and light | Action / purpose |
| --- | --- | --- | --- |
| 0–4s | Four-person table | 90°, 85mm, f/4, L04 | Locked frame. Gentle flame movement establishes the setting. |
| 4–8s | Rim and linen detail | 30°, 100mm macro, f/4, L04 | Locked frame. A hand settles linen beside the object without moving it. |
| 8–12s | Object in the setting | 30°, 85mm, f/4, L04 | Slow linear push. The silver surface remains rigid and stable. |
| 12–15s | Editorial end frame | Approved still or composed graphic | Exact wordmark and “The table is set for four.” added in post. |

The same lighting blueprint governs this sequence. Use a separate daylight sequence when L02 is desired. If hands produce unreliable anatomy or reflections, substitute a static detail with natural candle motion.

A CTA may appear on the end frame as **Explore the Host Set**. The linked destination must match the depicted four-piece offer. Do not add an unverified price or availability claim.

## 12. Formats & Composition

| Placement | Working ratio | Composition rule |
| --- | --- | --- |
| Pinterest discovery | 2:3 | Keep the table and object count readable in vertical framing. |
| Instagram feed | 4:5 | Preserve the main rim and enough context for scale. |
| Vertical video | 9:16 | Keep essential subjects and text clear of interface overlays. |
| Website hero | 16:9 plus a separately composed mobile version | Reserve deliberate negative space for live text. |
| Product detail | 1:1 or 4:5 | Prioritize shape, scale, and accurate visible contents. |

Ratios are creative targets, not claims of current platform requirements. If a tool does not support the target ratio, generate with sufficient crop allowance and reframe in the editor. Never stretch the object.

Use a conservative internal safe area, then preview in the actual placement because interface overlays vary. Do not bake a fixed universal safe-zone measurement into every channel. Keep text live or editable until placement is approved.

## 13. Asset Review Gates

### Product fidelity — mandatory

- [ ] Reference status is clear: approved depiction or labeled concept.
- [ ] Product count matches the intended offer.
- [ ] Circular form, rim, and basin match the reference throughout.
- [ ] No Tikli, decorative patterns, logos, stamps, or factory debossing.
- [ ] Silver appearance remains consistent. No plastic or liquid-metal surface.
- [ ] No unsupported material, dimension, safety, or reflectivity claim is inferred from the asset.

### Optical and scene coherence — mandatory

- [ ] One lighting blueprint governs each shot.
- [ ] Camera elevation and focal-length appearance remain locked.
- [ ] Highlights, shadows, and reflections correspond to the scene.
- [ ] Essential contours remain readable without clipping or crushed blacks.
- [ ] Hands, food, linen, and object contacts are physically plausible.
- [ ] Props and surfaces remain consistent across adjacent shots.

### Editorial and delivery — mandatory

- [ ] The asset feels appropriate to intimate hosting and the selected persona.
- [ ] Text follows `voice.md` and is rendered accurately in post.
- [ ] No garbled text, flicker, duplication, morphing, or unexplained motion remains.
- [ ] Audio is deliberate, appropriate, and rights-cleared where necessary.
- [ ] Final crop, interface overlays, playback, and export have been checked.
- [ ] Reference, prompt, generation version, and approval record are retained.

**Immediate rework or rejection:** Wrong product geometry, prohibited pattern, incorrect set count, misleading packaging, persistent temporal distortion, impossible reflections that alter the product, or invented claims. Attractive styling cannot compensate for a wrong object.

## 14. Generation Record Template

```yaml
asset_id: null
campaign: null
channel: null
shot_id: null
product_reference_id: null
reference_status: null
product_spec_revision: null
prompt_revision: null
model_and_interface: null
lighting_blueprint: null
lens_equivalent_mm: null
camera_elevation_deg: null
aperture_target: null
product_count: null
aspect_ratio_target: null
duration_target_seconds: null
motion: null
negative_prompt_delivery_method: null
seed_if_supported: null
raw_output_path: null
original_resolution: null
original_frame_rate: null
edit_version: null
rights_record: null
qa_status: pending
reviewer: null
approval_date: null
```

Never fill missing technical metadata from visual appearance. Record unknown values as unknown. This system specifies a consistent creative process; it does not make generated imagery a physical measurement tool.
