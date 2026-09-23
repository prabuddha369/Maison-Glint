---
name: Maison Glint — Technical & Metallurgical Specifications
revision: '0.1'
status: draft_for_supplier_validation
product: Object 01
production_release: false
customer_claims_release: false
units_master: metric
source: User-supplied example targets; not measured production data
sku_example: MG-OBJ-01-11IN-18GA
sku_released: null
material:
  family: stainless_steel
  candidate_grades: [AISI_304, AISI_202]
  selected_grade: null
  certificate_reference: null
  food_contact_status: unverified
  magnetic_response_requirement: pending_agreed_method
geometry_targets:
  outer_diameter_mm: 280.0
  overall_rim_height_mm: 18.0
  finished_basin_thickness_mm: 1.20
  net_mass_g: 600
  decorative_patterns_allowed: false
  factory_debossing_allowed: false
  basin: seamless_flat
  rim: beaded
proposed_tolerances:
  outer_diameter_plus_minus_mm: 1.0
  overall_rim_height_plus_minus_mm: 0.5
  finished_basin_thickness_plus_minus_mm: 0.10
  net_mass_plus_minus_g: 30
  status: engineering_proposals_not_released
finish:
  target: double_buffed_8K_mirror
  reference_sample_id: null
  reflectivity_target_percent: 92
  reflectivity_comparator: greater_than
  reflectivity_method: null
  reflectivity_status: unqualified_target
qa_draft_limits:
  buffing_burns_allowed: false
  scratch_reject_if_length_gt_mm: 0.5
  scratch_dimension_interpretation: length_pending_approval
  rocking_reject_if_vertical_travel_gt_mm: 1.0
  patterned_or_stamped_units_allowed: false
---

# Object 01 — Product Specification & Factory QA

## 1. Document Control

This document supplies structured physical targets for concept generation and a draft factory inspection plan. It is not a certificate, test report, approved drawing, or production release.

The latest brief gives examples rather than confirmed measurements. Its targets are preserved above. Tolerances and inspection methods introduced below are engineering proposals requiring supplier and Maison Glint approval against a physical first article.

| Source conflict | Treatment in this revision |
| --- | --- |
| Earlier assessment: AISI 316; current examples: AISI 304 or 202 | Grade remains unresolved. Do not combine grades or permit substitution under one released SKU. |
| Earlier assessment: 2.5mm and 640g; current examples: 1.2mm and approximately 600g | Use 1.2mm and 600g as current draft targets only. Validate together on a formed sample. |
| Earlier edition or hallmark concepts; current zero factory debossing requirement | No marks on the object. Traceability belongs on packaging and records. |
| Verbal identity avoids commodity terminology | `voice.md` controls public wording. Technical records must retain precise material, dimension, and defect descriptions. |

Product facts take precedence over editorial language. A generative image cannot validate geometry, alloy, mass, finish performance, or food-contact suitability.

## 2. SKU Taxonomy & Traceability

Requested example: `MG-OBJ-01-11IN-18GA`.

| Segment | Meaning |
| --- | --- |
| MG | Maison Glint |
| OBJ | Object product family |
| 01 | Object model |
| 11IN | Nominal size class; not an exact inch conversion |
| 18GA | Proposed gauge designation; unresolved until the gauge system is specified |

Do not release the example SKU as proof that 1.20mm equals 18 gauge. Gauge labels depend on the material and gauge table. The controlled drawing must use millimetres as its acceptance basis.

**Recommended draft format:** `MG-OBJ-01-280MM-120T-GRADE`.

Here `120T` explicitly means 1.20mm, not 120mm. Replace `GRADE` with the single approved alloy, for example `304`, only after material approval. These are proposed identifiers, not live inventory codes.

Maintain drawing revision, supplier, heat or coil number, forming lot, polishing lot, inspection record, and packaging lot outside the SKU. If an alloy or geometry changes, issue a controlled revision and assess whether a new SKU is required. Never mix 202 and 304 under one material declaration.

Use `-S1`, `-D2`, and `-H4` as optional offer suffixes for one, two, and four pieces. All pieces in a set must match the released specification and appearance reference. No serial number, factory logo, grade stamp, engraving, or debossing may be added to the object under this draft.

## 3. Material Science & Evidence

### Alloy selection

AISI 304 and AISI 202 are alternative candidates, not equivalent labels. Require a certificate tied to the actual supplied heat or coil and the agreed procurement standard. Record its chemical composition and traceability. Do not infer grade from appearance, weight, price, or a magnet.

Grade selection is unresolved in this document. Neither an earlier 316 description nor the current 304/202 examples authorize a factory substitution. Record the final grade in the structured fields, drawing, purchase order, and approved claim register before release.

### Magnetic response

“Non-magnetic” is a requested characteristic, not a verified absolute claim. Austenitic stainless steel can show magnetic response after cold forming. A magnet check alone does not identify grade or establish food-contact safety.

If magnetic response is an acceptance requirement, agree an instrument, measurement locations, sample condition, and quantitative limit with the supplier. Until then, log the observation without using it as a stand-alone pass/fail grade test. Do not publish “completely non-magnetic.”

### Food-contact suitability

Food-contact suitability must be assessed for the finished article, its intended foods, contact times, temperatures, cleaning conditions, and destination market. A grade label alone is insufficient evidence.

Retain material documentation, finishing and cleaning records, and applicable finished-article test reports. The EDQM technical guide describes metal release limits and release-testing methods; it is useful technical guidance, not a certificate for Object 01. [EDQM: Metals and alloys used in food contact materials and articles](https://www.edqm.eu/en/metals-and-alloys-used-in-food-contact-materials-and-articles).

No “certified food-safe,” “FDA approved,” “zero leaching,” “surgical grade,” or dishwasher-performance claim is released by this document. A qualified laboratory must define the applicable test programme. Do not invent a regulatory pass threshold here.

### Surface chemistry and residues

Baseline intent is bare stainless steel with a mechanically polished surface. No added chrome plating, lacquer, paint, or decorative coating is authorized. Chromeware is brand language, not a coating specification.

No visible buffing compound, oil, adhesive, loose abrasive, rust, or foreign metal contamination is acceptable after final cleaning. Document cleaning chemicals and rinsing. Visual cleanliness is not a substitute for chemical or food-contact evaluation.

## 4. Physical Metrics & Drawing Requirements

The following tolerances are **proposed**, not supplied or validated limits. Adopt them only after a first article demonstrates feasibility and the drawing is approved.

| Characteristic | Draft nominal | Proposed acceptance interval | Definition and method |
| --- | --- | --- | --- |
| Outer diameter | 280.0mm / 28.0cm | 279.0–281.0mm | Maximum outside rim envelope. Measure at four axes: 0°, 45°, 90°, 135°. Each reading must comply. |
| Overall rim height | 18.0mm / 1.8cm | 17.5–18.5mm | Height from the support datum to the highest rim surface. Measure at four quadrants on a qualified flat surface. |
| Finished basin metal thickness | 1.20mm | 1.10–1.30mm | Single-wall thickness after forming and polishing. Centre plus four drawing-defined basin locations. Excludes the folded bead. |
| Net mass | Approximately 600g | 570–630g | One clean, dry object without sleeve, insert, label, or box. |
| Basin | Seamless and flat | Numerical flatness limit pending | No seams, partitions, embossed centre, or decorative relief. Separate measured flatness from visual appearance. |
| Rim | Continuous bead | Profile dimensions pending | Smooth, consistent bead with no exposed burr or sharp edge. Overall height does not define bead diameter. |

**Unit conversion:** 280mm equals approximately 11.0236 inches. “11.0 in” is rounded merchandising language. An exact 11-inch diameter is 279.4mm. Do not use both as independent exact acceptance dimensions.

**Thickness method:** Use a suitable deep-throat micrometer where accessible, a validated ultrasonic method, or approved destructive first-article sections. A rim measurement over folded material is not a basin thickness reading. Define the minimum permitted thickness in the formed transition separately before production release.

**Mass sanity check:** A simplified flat 280mm disk at 1.20mm thickness and an assumed density of 8.0g/cm³ weighs approximately 591g. This is only a plausibility calculation. The formed profile, bead, blank size, trimming, and density affect actual mass. It neither confirms the 600g target nor substitutes for weighing.

Before release, the drawing must also define basin diameter, basin flatness, support/contact geometry, bead cross-section, transition radius, minimum formed-wall thickness, and measurement datums. Until then, exact geometry is incomplete.

## 5. Surface Polish

**Target:** Double-buffed 8K mirror finish. Public finish name: **Mirror Polish**.

“Double-buffed” describes the proposed process. Require the factory to record its actual stages and cleaning sequence. “8K” is a supplier finish descriptor here; it does not independently establish a universal optical-performance threshold.

Approve a physical reference sample under controlled lighting. Record its identifier, photographs, viewing conditions, and permissible appearance range. Judge both the basin and rim for haze, directional scratches, orange-peel texture, compound residue, and burn discoloration. Do not expect an optically perfect imaging mirror from an undefined decorative finish.

### Reflectivity target

The requested **greater than 92% optical reflectivity** remains an unqualified target. Do not claim it has been achieved or assume it is feasible for the chosen alloy and finish.

Before it becomes an acceptance criterion, define:

- Specular or total reflectance.
- Wavelength or spectral band and weighting.
- Incidence and collection angles, aperture, and polarization where relevant.
- Instrument, calibration reference, uncertainty, and surface preparation.
- Sampling locations and the rule for combining readings.

Gloss units are not percentage optical reflectance. A gloss reading of 92 is not evidence of 92% reflectivity. Do not silently replace the requested target with a gloss threshold. If the target cannot be demonstrated, revise it through documented approval or remove the numerical claim.

## 6. Negative Constraints

These are explicit design requirements for both factory output and image generation:

- Zero decorative patterns. **Strictly without Tikli.**
- Zero factory debossing, embossing, stamping, engraving, logos, or visible grade marks on any object surface.
- Seamless, uninterrupted flat basin. No compartments, centre medallion, radial grooves, hammered texture, or decorative rings.
- Continuous beaded rim. No scalloping, perforations, handles, cut-outs, or gold-colored trim.
- No unauthorized coating, plating, attached foot, or welded decoration.

The forming transition and required bead are structural features, not decorative patterns. Drawings must distinguish them clearly. Keep traceability on packaging and records.

## 7. Inspection Conditions & Equipment

**Proposed visual method:** Inspect clean, dry surfaces under diffuse neutral-white light, approximately 4000–6500K and 800–1200 lux at the work surface. View from approximately 30–40cm. Rotate each object through a full turn and inspect with raking light as well. Check both faces and the complete rim.

Use calibrated or verified equipment appropriate to the tolerance: a diameter instrument, height gauge, suitable thickness instrument, balance, scratch-measuring microscope or reticle, and dial indicator. Suggested display resolutions are 0.1mm for diameter, 0.01mm for thickness and rocking travel, and 1g for mass. Resolution alone does not establish accuracy.

Use a qualified metrology surface for numerical rocking checks. Flat-looking travertine is a useful end-use check but may have pores, unevenness, or texture. Do not treat an unverified decorative slab as the measurement datum. If travertine is retained as a fixture, document its flatness and condition before use.

Records close to a limit must be assessed with the agreed measurement uncertainty. Do not round a failure down to a pass. Hold borderline results for a more capable measurement or documented engineering decision.

## 8. Quality Failure Thresholds

The brief's example limits become draft inspection rules below. Factory use requires approval of the definitions and method. A rejected piece is immediately segregated; rejection does not automatically mean irreversible scrapping.

| Characteristic | Draft rejection rule | Inspection and disposition |
| --- | --- | --- |
| Buffing burns | Any visible burn or heat discoloration | Inspect under the defined lighting. Reject and segregate. Rework requires approved procedure and full reinspection. |
| Scratches | Any scratch longer than 0.5mm | Interpret the supplied 0.5mm as **length**, provisionally. Measure the longest continuous trace with magnification. Reject above the limit. |
| Gouges / burrs | Any sharp, tactile, or hazardous defect, regardless of length | Reject. A short defect does not pass simply because it is below the cosmetic length limit. |
| Rim rocking / wobble | Vertical rocking travel greater than 1.0mm | Use the procedure below. Reject above the limit. |
| Patterns / factory marks | Any prohibited feature | Reject. Includes Tikli and underside factory marks. |
| Cracks / seams / splits | Any visible crack, split, or unauthorized seam | Reject and investigate the affected process lot. |
| Diameter / height / thickness / mass | Outside approved drawing limits | Proposed intervals in Section 4 become binding only after approval. |
| Finish uniformity | Outside the approved reference appearance range | Hold or reject against the documented reference. No subjective “premium enough” release. |
| Contamination | Visible residue, rust, or foreign matter after cleaning | Hold, investigate, and re-clean only under an approved process. Reinspect. |
| Material identity | Wrong grade or missing traceability | Quarantine the affected lot. No release based on appearance. |
| Food-contact evidence | Required evidence absent or failed | Hold the lot from shipment pending resolution. |
| Optical reflectivity | Target or test method not qualified | Hold this claim. Production specification must resolve or formally remove the target before release. |

A scratch exactly 0.5mm long or rocking travel exactly 1.0mm does not exceed the stated numerical limit. It still requires assessment of measurement uncertainty and all other criteria. Multiple shorter scratches, visible haze, or defects on a prominent surface are judged against the approved appearance reference. They do not receive an automatic pass.

### Rocking measurement

1. Clean the object and reference surface. Seat the object in its normal use orientation.
2. Position a dial indicator vertically on the rim. Record the setup location.
3. Alternately seat opposing support points with a light, repeatable force that does not elastically bend the object. Establish and record this force during first-article method validation.
4. Record the rim's peak-to-peak vertical travel. Repeat at four quadrants. Use the maximum result.
5. Reject if the maximum exceeds 1.0mm. Hold an unstable or method-sensitive result for investigation.

A feeler-gauge gap beneath a resting object, rim-height variation, and rocking travel are different measurements. Do not interchange them. A flat-travertine use check may supplement this test but does not override it.

## 9. Factory QA Checklist

**Draft inspection coverage:** For the planned small-volume operation, inspect every finished piece for appearance, prohibited features, rim safety, cleanliness, mass, diameter, overall height, and rocking. Define lot-based material, thickness, and laboratory checks in an approved sampling plan. Do not invent an AQL or claim a statistical sampling standard has been followed.

### Incoming material and first article

- [ ] Approved grade, procurement standard, and heat/coil certificate match the purchase order.
- [ ] Lot identity remains traceable through forming, polishing, cleaning, and packaging.
- [ ] Released drawing defines all missing geometry and tolerances.
- [ ] First article confirms diameter, height, wall-thickness map, mass, and support geometry together.
- [ ] Appearance reference and defect photographs are approved and identified.
- [ ] Food-contact evaluation covers intended use and destination requirements.
- [ ] Reflectivity target is qualified or formally revised; unsupported claims remain disabled.
- [ ] Inspection methods, uncertainty, equipment, and sampling plan are approved.

### Every finished piece

- [ ] Piece maps to the correct lot and released revision.
- [ ] Diameter, overall height, and mass are recorded and acceptable.
- [ ] Basin and rim match the approved geometry and appearance reference.
- [ ] No buffing burns, unacceptable scratches, gouges, cracks, or sharp edges.
- [ ] No Tikli, decorative pattern, factory logo, or debossing.
- [ ] Rocking measurement is within the approved limit.
- [ ] Final cleaning is complete. No visible residues or contamination.
- [ ] Packaging prevents metal-to-metal abrasion and matches the offer count.
- [ ] Inspector records pass, reject, or hold with date and evidence.

### Lot release

- [ ] Required thickness and material checks have passed under the approved sampling plan.
- [ ] Supporting laboratory and conformity records are complete and applicable.
- [ ] Rejects and held pieces are physically segregated and excluded from packing.
- [ ] Reworked units have undergone the affected checks and final inspection again.
- [ ] Packing quantities reconcile with inspected, rejected, held, and released counts.
- [ ] Authorized quality owner signs release. No unresolved critical fields remain.

## 10. Inspection Record Template

| Field | Recorded value |
| --- | --- |
| Date / inspector / supplier | Pending |
| SKU / drawing revision / lot / heat | Pending |
| Piece identifier on record or packaging | Pending |
| Certificate / laboratory report references | Pending |
| Equipment IDs / verification status | Pending |
| Diameter at four axes, mm | Pending |
| Rim height at four quadrants, mm | Pending |
| Thickness locations and values, mm | Pending or linked approved lot record |
| Net mass, g | Pending |
| Maximum scratch length / location, mm | Pending |
| Rocking travel at four quadrants, mm | Pending |
| Finish / burns / marks / residues / edge condition | Pending |
| Reference sample ID / evidence photographs | Pending |
| Result: PASS / REJECT / HOLD | Pending |
| Defect code / rework record / reinspection | Pending |
| Quality release owner / date | Pending |

## 11. Generative AI Contract

Read the status fields before using any number. The YAML contains targets, not measurements. `production_release: false` and `customer_claims_release: false` mean the engine must not turn this draft into verified product copy.

**Concept visualization:** May use the proposed 280mm diameter, 18mm height, beaded rim, flat basin, and mirror appearance. Label output as a concept. Use an approved drawing or CAD model when dimensional accuracy is required.

**Customer copy:** May use only individually verified facts from the released specification and claim register. Apply `voice.md` after factual selection. Never infer alloy from the word Chromeware or add food-contact, magnetic, optical, or durability claims.

**Factory instruction:** Use only the signed revision and drawing. This draft supports review and method development; it is not permission to manufacture for shipment.

Concept prompt template:

> Object 01 by Maison Glint. Circular stainless steel dinnerware. Draft outer diameter 280mm and overall height 18mm. Continuous beaded rim. Seamless flat basin. Mirror Polish appearance with controlled reflections. No decorative patterns. Strictly without Tikli. No logos, stamps, debossing, compartments, engraving, or colored trim. Preserve the approved drawing when supplied. Render as a concept, not proof of exact dimensions or material performance.

Do not feed competing values from the earlier assessment into the same generation. If the selected grade, approved drawing, or necessary claim evidence is missing, return an internal missing-input notice.

## 12. Release and Change Control

Release requires a selected alloy, an approved dimensioned drawing, validated inspection methods and tolerances, a physical reference sample, applicable finished-product evidence, and authorized signatures. Every previously unresolved field must be resolved, removed by formal revision, or explicitly excluded from the released claim set.

Changes to alloy, thickness, tooling, finish process, cleaning chemicals, or food-contact conditions require documented impact review and appropriate requalification. Retain prior revisions and affected lot records.

**Prepared from:** The current user specification examples, the Maison Glint strategic assessment, and the existing design and verbal identity context. No production samples or supplier certificates were supplied. The linked EDQM source supports the food-contact testing discussion only; it does not verify any Maison Glint specification. Proposed tolerances, inspection coverage, and methods are authored recommendations for engineering review.
