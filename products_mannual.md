# Maison Glint Product Manual

This manual teaches atelier administrators how to create, edit, retire, and fully customise products in Maison Glint.

Product data controls the catalog, product detail page, homepage carousels, image rendering, pricing, edition status, and editorial copy.

## 1. Admin Access

1. Open `/admin`.
2. Sign in with an authorized administrator account.
3. Select the **Products** tab.
4. Use **Create New Object** for a new product or **Edit** on an existing product.
5. Save the product and verify it on the storefront.

Product writes require administrator permissions. Public visitors can read active products, but cannot create or modify them.

The database migration for editorial content must be applied before relational editorial content can be stored:

- [Initial schema](supabase/migrations/001_initial_schema.sql)
- [Product editorial schema](supabase/migrations/003_product_editorial_content.sql)

## 2. Creating A Product

### Core workflow

1. Select **Create New Object**.
2. Enter the product name.
3. Enter a non-negative price.
4. Select the currency.
5. Add one image URL per line.
6. Complete the specifications.
7. Set inventory and edition values.
8. Complete the **Section Content JSON** field.
9. Select **Save to Catalog**.
10. Refresh the Products tab and verify the storefront.

The current admin editor exposes core fields, image URLs, and the full editorial object as JSON. The editorial JSON must be valid before saving.

### Required fields

| Field | Meaning | Example |
|---|---|---|
| `name` | Public product name shown throughout the storefront | `Object 05 - The Torsion Bowl` |
| `price` | Numeric product price; must be zero or greater | `550` |
| `currency` | Currency code displayed beside the price | `USD` |
| `images` | Ordered image URLs, entered one per line | `/images/fig-01-table.png` |
| `inStock` | Controls whether the product is publicly available | `true` |

## 3. Editing A Product

1. Select **Edit** on the product card.
2. Keep the existing `id` unchanged unless you intentionally want a completely new product.
3. Modify only the fields that should change.
4. Preserve array ordering in the editorial JSON.
5. Keep every `sortOrder` unique within its array.
6. Save the product.
7. Confirm the updated name, images, price, carousels, specifications, and ritual modal.

Changing a product ID can break product detail links, cart references, order references, and related editorial rows. Treat IDs as permanent identifiers.

## 4. Retiring A Product

Uncheck **In Stock / Available for Acquisition** to hide a product from the public active catalog while preserving its record for administrators.

Use product deletion only when the product and its editorial content should be permanently removed. The database uses cascading foreign keys, so deleting a product also deletes its related editorial records, slides, features, panels, presets, specification rows, rituals, and ritual items.

The **Seed Catalog** action restores the configured default products. Use it carefully because it can overwrite matching seeded product records.

## 5. Core Product Fields

The authoritative TypeScript definitions are in [types/store.ts](types/store.ts).

| Field | Type | Purpose |
|---|---|---|
| `id` | `string` | Stable unique identifier. Usually an `object-...` slug. |
| `name` | `string` | Product name shown in headings, catalog cards, navigation, cart, and detail views. |
| `description` | `string` | Main product description used in catalog, showcase, and product detail views. |
| `price` | `number` | Numeric price used by catalog, cart, checkout, and detail views. |
| `currency` | `string` | Currency displayed with the price, such as `USD`, `INR`, or `GBP`. |
| `images` | `string[]` | Ordered image URLs used by catalog, showcase, detail, drawer, and fallback ritual content. |
| `specifications` | object | Flexible short specification values used by cards and product detail. |
| `inStock` | `boolean` | Public availability flag. Inactive products are filtered from the active catalog. |
| `editionTotal` | `number?` | Total number of units in the edition. |
| `editionRemaining` | `number?` | Units remaining. Used in edition badges and allocation displays. |
| `createdAt` | `string?` | Creation timestamp. Normally managed by the database. |
| `editorial` | object? | Complete content model for the homepage carousels. |

### Specifications object

The standard specification keys are:

| Key | Storefront meaning |
|---|---|
| `gauge` | Material thickness, core, or construction specification. |
| `diameter` | Diameter, width, height, or total dimensions. |
| `finish` | Surface finish or treatment. |
| `weight` | Product mass. |
| `origin` | Atelier, manufacturing, or provenance location. |

Additional string keys are allowed, but new keys should be used consistently across products.

## 6. Image URLs

Enter one URL per line in the admin image field.

Supported examples:

```text
/images/fig-01-table.png
/images/fig-02-profile.png
https://images.unsplash.com/example-image
```

Rules:

- Local images must exist under `public/images` and use paths beginning with `/images/`.
- Remote images must use HTTPS.
- Remote hosts must be allowed in [next.config.ts](next.config.ts).
- Use descriptive image content that matches the product.
- Keep the first image as the primary catalog image.
- Use at least two images for the hero perspective carousel.
- Use at least three images when the product has three distinct ritual or detail views.
- Alt text belongs in hero slides and rituals; describe the actual product and setting.
- Do not use an image URL from another product unless that reuse is intentional.

Product images are stored directly on the product record in the `public.products(images)` JSONB array column, which serves as the single source of truth for the storefront catalog, cart, and image gallery.

## 7. Editorial Content JSON

The `editorial` object supplies product-specific content to all homepage sections. It contains five groups:

- `hero`
- `showcase`
- `finish`
- `specifications`
- `table`

A complete example is provided below. Replace the values, but preserve the field names and array structure.

```json
{
  "hero": {
    "eyebrow": "Objects for the Everyday Ritual",
    "editionLabel": "Edition 05",
    "description": "A sculptural object with a reflective surface and measured presence at the table.",
    "discoverLabel": "Discover Object",
    "reserveLabel": "Reserve Edition",
    "materialLabel": "Material",
    "materialValue": "316L Stainless Steel",
    "craftLabel": "Craft",
    "craftValue": "Optical Hand Finish",
    "editionLabelMeta": "Edition",
    "editionValue": "Batch 05 / 100",
    "slides": [
      {
        "imageUrl": "/images/object-05-front.png",
        "alt": "Object 05 resting on a stone dining table",
        "category": "Table Setting",
        "title": "A considered presence at the table",
        "figureLabel": "FIG. 01",
        "tabLabel": "Fig. 01",
        "badge": "Atmosphere",
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/object-05-profile.png",
        "alt": "Object 05 side profile showing its curved edge",
        "category": "Side Elevation",
        "title": "Profile, edge, and reflected light",
        "figureLabel": "FIG. 02",
        "tabLabel": "Fig. 02",
        "badge": "Profile",
        "sortOrder": 1
      }
    ]
  },
  "showcase": {
    "sectionLabel": "01 / Object Showcase",
    "title": "A precise form.",
    "titleEmphasis": "Endless possibilities.",
    "description": "A simple form, a reflective surface, and a different way to set the table.",
    "finishBadge": "Optical Hand Finish",
    "statusLabel": "Status",
    "statusDescription": "Serialized atelier allocation with edition verification and provenance documentation included.",
    "provenanceLabel": "Provenance",
    "monographLabel": "Monograph View",
    "acquireLabel": "Acquire Edition",
    "priorityLabel": "Priority Access",
    "features": [
      {
        "label": "Surface Refraction",
        "description": "A measured finish designed to carry ambient light and tactile detail.",
        "sortOrder": 0
      },
      {
        "label": "Ergonomic Lift",
        "description": "Balanced geometry engineered for confident handling during service.",
        "sortOrder": 1
      }
    ],
    "panels": [
      {
        "title": "Product Details",
        "body": "Crafted for daily ritual with a considered balance of material, finish, and proportion.",
        "sortOrder": 0
      },
      {
        "title": "Care & Use",
        "body": "Care instructions and use notes are maintained by the atelier for each edition.",
        "sortOrder": 1
      },
      {
        "title": "Delivery & Provenance",
        "body": "Each exemplar is serialized and delivered with its corresponding authenticity record.",
        "sortOrder": 2
      }
    ]
  },
  "finish": {
    "sectionLabel": "02 / The Finish & Philosophy",
    "title": "Made with intention.",
    "titleEmphasis": "Alive with light.",
    "paragraphs": [
      "A curve. A glint. The room, reflected.",
      "The finish carries the season, the lighting, and the architecture of the gathering."
    ],
    "presetLabel": "Select Optical Light State",
    "spectrumLabel": "Reflective Index Spectrum",
    "roughnessLabel": "Surface Index",
    "presets": [
      {
        "key": "morning",
        "label": "Morning Sun",
        "angle": 45,
        "roughness": "Ra < 0.050 µm",
        "dispersion": "98.4%",
        "sortOrder": 0
      },
      {
        "key": "candlelight",
        "label": "Candlelight Grazing",
        "angle": 22,
        "roughness": "Ra < 0.048 µm",
        "dispersion": "99.1%",
        "sortOrder": 1
      }
    ]
  },
  "specifications": {
    "sectionLabel": "03 / Specifications",
    "title": "Every detail,",
    "titleEmphasis": "considered.",
    "description": "Refined measurements balanced for the surfaces and rituals of everyday dining.",
    "metricToggleLabel": "MM / G",
    "imperialToggleLabel": "IN / OZ",
    "serialStamp": "Verified Serial Stamp No. 001-100",
    "archiveLabel": "Maison Glint Archive",
    "rows": [
      {
        "label": "DIAMETER",
        "metric": "280 mm",
        "imperial": "11.02 in",
        "sortOrder": 0
      },
      {
        "label": "NET MASS",
        "metric": "640 grams",
        "imperial": "22.58 oz",
        "sortOrder": 1
      }
    ]
  },
  "table": {
    "sectionLabel": "04 / At The Table",
    "title": "The Art of the Everyday.",
    "titleEmphasis": "Set a different table.",
    "description": "A reflective stage for considered courses and intimate settings.",
    "rituals": [
      {
        "title": "The Dining Ritual",
        "subtitle": "Linen, stone, and cool metal.",
        "imageUrl": "/images/object-05-dining.png",
        "imageAlt": "Object 05 arranged with linen and stoneware",
        "description": "A considered arrangement of bread, linen, and warm natural surfaces.",
        "items": [
          { "label": "Artisanal Course", "sortOrder": 0 },
          { "label": "Washed Linen", "sortOrder": 1 }
        ],
        "sortOrder": 0
      }
    ]
  }
}
```

## 8. Editorial Field Reference

### Hero

The `hero` group controls [HeroSection.tsx](components/HeroSection.tsx).

| Field | Purpose |
|---|---|
| `eyebrow` | Small introductory label above the product heading. |
| `editionLabel` | Edition label beside the eyebrow. |
| `description` | Main hero description. |
| `discoverLabel` | Discover button text. |
| `reserveLabel` | Reservation button text. |
| `materialLabel`, `materialValue` | First metadata item. |
| `craftLabel`, `craftValue` | Second metadata item. |
| `editionLabelMeta`, `editionValue` | Third metadata item. |
| `slides` | Ordered hero perspective carousel. |

Each hero slide needs an image URL, alt text, category, title, figure label, tab label, badge, and unique `sortOrder`.

### Showcase

The `showcase` group controls [ObjectShowcase.tsx](components/ObjectShowcase.tsx).

`title`, `titleEmphasis`, and `description` form the section heading. `finishBadge` appears over the showcase image. Status and provenance fields control the allocation card. `acquireLabel`, `priorityLabel`, and `monographLabel` control the action buttons and link.

`features` creates the feature cards. `panels` creates the accordion rows. Each feature and panel requires a unique `sortOrder`.

### Finish

The `finish` group controls [FinishPhilosophy.tsx](components/FinishPhilosophy.tsx).

`paragraphs` is an ordered list of narrative paragraphs. `presets` controls the optical-light selector and diagram.

- `angle` is measured in degrees.
- `roughness` is a display value such as `Ra < 0.050 µm`.
- `dispersion` is a display percentage or optical index.
- `key` must be unique within the product.

### Specifications

The `specifications` group controls [Specifications.tsx](components/Specifications.tsx).

Each row has a visible `label`, a metric value, an imperial value, and a unique `sortOrder`. The unit toggle displays either `metric` or `imperial`.

If a value does not change between systems, repeat the same value in both fields.

### At The Table

The `table` group controls [AtTheTable.tsx](components/AtTheTable.tsx) and the ritual modal.

Each ritual contains a title, subtitle, image URL, image alt text, description, nested `items`, and `sortOrder`. Ritual items are the individual curation lines shown in the modal.

## 9. Supabase Data Model

The parent product is stored in `public.products`.

| Table | Stores |
|---|---|
| `public.products(images)` | Ordered general product image URLs stored directly as JSONB array. |
| `product_editorial` | Non-repeatable hero, showcase, finish, specification, and table labels/copy. |
| `product_hero_slides` | Hero carousel slides. |
| `product_features` | Showcase feature cards. |
| `product_panels` | Showcase accordion panels. |
| `product_finish_presets` | Finish optical presets. |
| `product_specification_rows` | Ordered metric/imperial specification rows. |
| `product_rituals` | At-the-table ritual cards. |
| `product_ritual_items` | Nested curation items belonging to a ritual. |

Every child record references its parent through a foreign key. Deleting a product cascades to its child content. Public users can read content for active products. Admin users can insert, update, and delete content.

The application hydrates these records into one `Product` object in [lib/products.ts](lib/products.ts). Legacy products without editorial rows use the typed fallback content until they are fully populated.

## 10. Storefront Verification Checklist

After saving a product, verify:

- The product appears in `CatalogGrid`.
- The first image appears in the catalog card.
- The hero carousel shows the configured slides.
- Hero captions and metadata match the product.
- The showcase image, features, status, and panels match the product.
- Finish presets change the diagram and values correctly.
- Specifications switch between metric and imperial values.
- Ritual cards use the configured images and text.
- The ritual modal contains the correct curation items.
- The product detail page shows the correct name, price, images, and specifications.
- The acquisition drawer uses the correct name, image, price, and currency.
- The product has no stale Object 01 copy.
- The layout works at desktop and mobile widths.

## 11. Safe Authoring Rules

- Keep product IDs stable.
- Use valid JSON with double quotes.
- Do not add trailing commas to JSON.
- Use unique `sortOrder` values within each array.
- Keep `sortOrder` zero-based and consecutive where possible.
- Use non-empty image URLs for every visible image.
- Use descriptive alt text.
- Keep labels short enough for mobile buttons and badges.
- Keep price numeric, not formatted with currency symbols.
- Keep edition values numeric.
- Do not remove all hero slides, finish presets, or rituals unless the related section is intentionally allowed to be empty.
- Save one product at a time and verify the result before making bulk changes.

## 12. Troubleshooting

### The product does not appear publicly

Check `inStock`. The active catalog filters out products where `inStock` is false. Also confirm the product was saved successfully and that the Supabase products policy is active.

### The editorial content is missing

Confirm that migration `003_product_editorial_content.sql` has been applied. Until related rows exist, the application may use typed fallback content. Check the browser console and Supabase table records.

### The save button does nothing

Check that `name` and `price` are present. Confirm the price is numeric and greater than or equal to zero.

### JSON content stops updating

The admin editor keeps the last valid editorial object while JSON is temporarily invalid during editing. Fix missing quotes, braces, brackets, or commas, then save again.

### An image does not render

Check the URL, protocol, file path, and host configuration in [next.config.ts](next.config.ts). Local images must be inside `public/images`. Remote hosts must be listed in `remotePatterns`.

### Changes appear stale

Refresh the Products tab. The app also maintains a browser local product cache for fallback behavior. Clear the `mg_local_products_cache` localStorage entry only when testing cache recovery.

### A product was deleted accidentally

Restore it through the admin editor or reseed the catalog if it is one of the configured default products. Related editorial rows cannot be restored after cascade deletion unless the product content is re-entered.

### Before reporting a bug

Run:

```powershell
npx tsc --noEmit
npm run build
```

Record the product ID, the field changed, the browser error, and whether the issue occurs in Supabase or only in the local fallback catalog.
