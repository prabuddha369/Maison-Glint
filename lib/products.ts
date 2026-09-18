import type {
  Product,
  ProductEditorialContent,
  ProductFeature,
  ProductFinishPreset,
  ProductHeroSlide,
  ProductPanel,
  ProductRitual,
  ProductRitualItem,
  ProductSpecificationRow,
} from '../types/store';
import { getSupabaseBrowser } from './supabase/client';

function createEditorialContent(name: string, images: string[], editionLabel: string): ProductEditorialContent {
  return {
    hero: {
      eyebrow: 'Objects for the Everyday Ritual', editionLabel, description: 'A considered object with a reflective surface, clean geometry, and a quiet presence at the table.',
      discoverLabel: 'Discover Object', reserveLabel: 'Reserve Edition', materialLabel: 'Material', materialValue: 'Surgical Stainless',
      craftLabel: 'Craft', craftValue: 'Optical Hand Finish', editionLabelMeta: 'Edition', editionValue: editionLabel,
      slides: images.slice(0, 2).map((imageUrl, index) => ({ imageUrl, alt: `${name} perspective ${index + 1}`, category: index === 0 ? 'Table Setting' : 'Side Elevation', title: index === 0 ? 'A considered presence at the table' : 'Profile, edge, and reflected light', figureLabel: `FIG. 0${index + 1}`, tabLabel: `Fig. 0${index + 1}`, badge: index === 0 ? 'Atmosphere' : 'Profile', sortOrder: index })),
    },
    showcase: {
      sectionLabel: '01 / Object Showcase', title: name, titleEmphasis: 'Endless possibilities.', description: 'A simple form, a reflective surface, and a different way to set the table.',
      finishBadge: 'Optical Hand Finish', statusLabel: 'Status', statusDescription: 'Serialized atelier allocation with edition verification and provenance documentation included.',
      provenanceLabel: 'Provenance', monographLabel: 'Monograph View', acquireLabel: 'Acquire Edition', priorityLabel: 'Priority Access',
      features: [
        { label: 'Surface Refraction', description: 'A measured finish designed to carry ambient light and tactile detail.', sortOrder: 0 },
        { label: 'Ergonomic Lift', description: 'Balanced geometry engineered for confident handling during service.', sortOrder: 1 },
      ],
      panels: [
        { title: 'Product Details', body: 'Crafted for daily ritual with a considered balance of material, finish, and proportion.', sortOrder: 0 },
        { title: 'Care & Use', body: 'Care instructions and use notes are maintained by the atelier for each edition.', sortOrder: 1 },
        { title: 'Delivery & Provenance', body: 'Each exemplar is serialized and delivered with its corresponding authenticity record.', sortOrder: 2 },
      ],
    },
    finish: {
      sectionLabel: '02 / The Finish & Philosophy', title: 'Made of steel.', titleEmphasis: 'Alive with light.',
      paragraphs: ['A curve. A glint. The room, reflected. A surface that becomes part of the setting.', 'The finish carries the season, the lighting, and the architecture of the gathering.'],
      presetLabel: 'Select Optical Light State', spectrumLabel: 'Reflective Index Spectrum', roughnessLabel: 'Surface Index',
      presets: [
        { key: 'morning', label: 'Morning Sun', angle: 45, roughness: 'Ra < 0.050 µm', dispersion: '98.4%', sortOrder: 0 },
        { key: 'candlelight', label: 'Candlelight Grazing', angle: 22, roughness: 'Ra < 0.048 µm', dispersion: '99.1%', sortOrder: 1 },
        { key: 'zenith', label: 'Overhead Ambient', angle: 70, roughness: 'Ra < 0.045 µm', dispersion: '98.8%', sortOrder: 2 },
      ],
    },
    specifications: {
      sectionLabel: '03 / Specifications', title: 'Every detail,', titleEmphasis: 'considered.', description: 'Refined measurements balanced for the surfaces and rituals of everyday dining.',
      metricToggleLabel: 'MM / G', imperialToggleLabel: 'IN / OZ', serialStamp: 'Verified Serial Stamp', archiveLabel: 'Maison Glint Archive',
      rows: [
        { label: 'DIAMETER', metric: '280 mm', imperial: '11.02 in', sortOrder: 0 },
        { label: 'RIM HEIGHT', metric: '18 mm', imperial: '0.71 in', sortOrder: 1 },
        { label: 'BASE GAUGE', metric: '2.5 mm', imperial: '0.10 in', sortOrder: 2 },
        { label: 'NET MASS', metric: '640 grams', imperial: '22.58 oz', sortOrder: 3 },
        { label: 'ALLOY GRADE', metric: 'Food Safe Austenitic Steel', imperial: 'Food Safe Austenitic Steel', sortOrder: 4 },
        { label: 'MIRROR POLISH', metric: 'Multi-Stage Optical Hand-Buff', imperial: 'Multi-Stage Optical Hand-Buff', sortOrder: 5 },
      ],
    },
    table: {
      sectionLabel: '04 / At The Table', title: 'The Art of the Everyday.', titleEmphasis: 'Set a different table.', description: 'A reflective stage for considered courses, fresh harvest, and intimate evening settings.',
      rituals: [
        { title: 'The Dining Ritual', subtitle: 'Linen, stone, and cool metal.', imageUrl: images[0] || '', imageAlt: `${name} in a dining setting`, description: 'A considered arrangement of bread, linen, and warm natural surfaces.', items: [{ label: 'Artisanal Course', sortOrder: 0 }, { label: 'Washed Linen', sortOrder: 1 }], sortOrder: 0 },
        { title: 'Raw Elements', subtitle: 'A reflective stage for fresh harvest.', imageUrl: images[1] || images[0] || '', imageAlt: `${name} with fresh elements`, description: 'Fresh botanical elements meet a reflective architectural surface.', items: [{ label: 'Seasonal Harvest', sortOrder: 0 }, { label: 'Micro-Crystalline Salt', sortOrder: 1 }], sortOrder: 1 },
        { title: 'Nocturne Setting', subtitle: 'Candlelight and evening reflections.', imageUrl: images[2] || images[0] || '', imageAlt: `${name} in an evening setting`, description: 'A low evening light reveals the object’s changing reflection.', items: [{ label: 'Natural Candlelight', sortOrder: 0 }, { label: 'Hand-Blown Glass', sortOrder: 1 }], sortOrder: 2 },
      ],
    },
  };
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'object-01-the-glint-plate',
    name: 'Object 01 — The Glint Plate',
    description:
      'Forged from surgical Grade 316L stainless steel, featuring undulating liquid perimeter geometry and high-refraction micro-buffed mirror chrome finish. Restricted atelier edition of 250 exemplars.',
    price: 680,
    currency: 'USD',
    images: [
      '/images/fig-01-table.png',
      '/images/fig-02-profile.png',
      '/images/scallops-macro.png',
    ],
    specifications: {
      gauge: '18-Gauge Surgical 316L Core',
      diameter: '280 mm (11.02 inches)',
      finish: 'Micro-Buff Mirror Chrome (>98% Refraction)',
      weight: '1,420 grams (Substantial Heavy Core)',
      origin: 'Atelier Zurich / Milan',
    },
    inStock: true,
    editionTotal: 250,
    editionRemaining: 34,
    createdAt: new Date().toISOString(),
    editorial: createEditorialContent('Object 01 — The Glint Plate', ['/images/fig-01-table.png', '/images/fig-02-profile.png', '/images/scallops-macro.png'], 'Batch 01 / 250'),
  },
  {
    id: 'object-02-fluid-coupe-pair',
    name: 'Object 02 — Fluid Coupe Pair',
    description: 'A matched pair of monolithic steel stem coupes with a mirror-polished interior bowl.',
    price: 490,
    currency: 'USD',
    images: ['/images/dining-ritual.png', '/images/fig-01-table.png', '/images/nocturne-setting.png'],
    specifications: { gauge: 'Seamless Solid Cold Lathe', diameter: '110 mm bowl / 165 mm height', finish: 'Dual Finish: Satin Stem / Mirror Bowl', weight: '480 grams each', origin: 'Atelier Zurich' },
    inStock: true,
    editionTotal: 150,
    editionRemaining: 18,
    createdAt: new Date().toISOString(),
    editorial: createEditorialContent('Object 02 — Fluid Coupe Pair', ['/images/dining-ritual.png', '/images/fig-01-table.png', '/images/nocturne-setting.png'], 'Batch 02 / 150'),
  },
  {
    id: 'object-03-monolith-serving-knife',
    name: 'Object 03 — Monolith Serving Knife',
    description: 'A balanced unibody steel serving knife with a micro-serrated beveled edge for ceremonial slicing.',
    price: 340,
    currency: 'USD',
    images: ['/images/scallops-macro.png', '/images/fig-02-profile.png', '/images/raw-elements.png'],
    specifications: { gauge: 'Forged 440C High-Carbon Stainless', diameter: '320 mm total length', finish: 'Vapour-Deposited Mirror Chrome', weight: '310 grams', origin: 'Solingen / Zurich Atelier' },
    inStock: true,
    editionTotal: 300,
    editionRemaining: 52,
    createdAt: new Date().toISOString(),
    editorial: createEditorialContent('Object 03 — Monolith Serving Knife', ['/images/scallops-macro.png', '/images/fig-02-profile.png', '/images/raw-elements.png'], 'Batch 03 / 300'),
  },
  // {
  //   id: 'object-04-sculpted-centro-vessel',
  //   name: 'Object 02 — Fluid Coupe (Pair)',
  //   description:
  //     'A matched pair of monolithic steel stem coupes. Precision lathed with a mirror-polished interior bowl designed to accelerate chilled culinary vapor and wine bouquet.',
  //   price: 490,
  //   currency: 'USD',
  //   images: [
  //     '/images/dining-ritual.png',
  //     '/images/fig-01-table.png',
  //   ],
  //   specifications: {
  //     gauge: 'Seamless Solid Cold Lathe',
  //     diameter: '110 mm bowl / 165 mm height',
  //     finish: 'Dual Finish: Satin Stem / Mirror Bowl',
  //     weight: '480 grams each',
  //     origin: 'Atelier Zurich',
  //   },
  //   inStock: true,
  //   editionTotal: 150,
  //   editionRemaining: 18,
  //   createdAt: new Date().toISOString(),
  // },
  // {
  //   id: 'object-03-monolith-serving-knife',
  //   name: 'Object 03 — Monolith Serving Knife',
  //   description:
  //     'Unibody steel blade with micro-serrated beveled edge for ceremonial slicing. Balanced center of mass crafted to rest horizontally on table surfaces without touching blade to linen.',
  //   price: 340,
  //   currency: 'USD',
  //   images: [
  //     '/images/scallops-macro.png',
  //     '/images/fig-02-profile.png',
  //   ],
  //   specifications: {
  //     gauge: 'Forged 440C High-Carbon Stainless',
  //     diameter: '320 mm total length',
  //     finish: 'Vapour-Deposited Mirror Chrome',
  //     weight: '310 grams',
  //     origin: 'Solingen / Zurich Atelier',
  //   },
  //   inStock: true,
  //   editionTotal: 300,
  //   editionRemaining: 52,
  //   createdAt: new Date().toISOString(),
  // },
  // {
  //   id: 'object-04-sculpted-centro-vessel',
  //   name: 'Object 04 — Sculpted Centro Vessel',
  //   description:
  //     'Centerpiece parabolic steel vessel holding seasonal botanical or floral arrangements. Dynamic ambient curvature reflects changing gallery light throughout the day.',
  //   price: 820,
  //   currency: 'USD',
  //   images: [
  //     '/images/raw-elements.png',
  //     '/images/nocturne-setting.png',
  //   ],
  //   specifications: {
  //     gauge: 'Hand-Hammered Liquid Form Steel',
  //     diameter: '380 mm width / 140 mm depth',
  //     finish: 'Liquid Mirror Chrome',
  //     weight: '2,640 grams',
  //     origin: 'Zurich Atelier',
  //   },
  //   inStock: true,
  //   editionTotal: 100,
  //   editionRemaining: 12,
  //   createdAt: new Date().toISOString(),
  // },
];

const LOCAL_PRODUCTS_KEY = 'mg_local_products_cache';

function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Local products read error', e);
  }
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Local products write error', e);
  }
}

/**
 * Fetch all products from the secure catalog API with fallback to the default catalog
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await getSupabaseBrowser().from('products').select('*');
    if (error) throw error;
    const list = data?.length ? await hydrateProducts(data as Record<string, unknown>[]) : INITIAL_PRODUCTS;
    saveLocalProducts(list);
    return list;
  } catch (error) {
    console.warn('[Maison Glint] Secure catalog fetch failed, utilizing local fallback:', error);
    return getLocalProducts();
  }
}

/**
 * Fetch single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await getSupabaseBrowser().from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return getLocalProducts().find((product) => product.id === id) || null;
    const hydrated = await hydrateProducts([data as Record<string, unknown>]);
    return hydrated[0] || null;
  } catch (error) {
    console.warn('[Maison Glint] getProductById error, fallback:', error);
    return getLocalProducts().find((p) => p.id === id) || null;
  }
}

/**
 * Client-side seeder that initializes default items if collection is empty
 */
export async function seedDefaultProducts(): Promise<void> {
  try {
    const { error } = await getSupabaseBrowser().from('products').upsert(INITIAL_PRODUCTS.map(toProductRow));
    if (error) throw error;
    console.log('[Maison Glint] Seeded default atelier products to Supabase.');
  } catch (error) {
    console.warn('[Maison Glint] Product seeder notice (safe fallback):', error);
  }
}

/**
 * Admin: Add or update a product
 */
export async function saveProduct(product: Product): Promise<void> {
  // Update local cache first
  const current = getLocalProducts();
  const index = current.findIndex((p) => p.id === product.id);
  let updated: Product[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = product;
  } else {
    updated = [product, ...current];
  }
  saveLocalProducts(updated);

  try {
    const { error } = await getSupabaseBrowser().from('products').upsert(toProductRow(product));
    if (error) throw error;
    if (product.editorial) await saveEditorialContent(product);
  } catch (error) {
    throw error;
  }
}

async function saveEditorialContent(product: Product): Promise<void> {
  if (!product.editorial) return;
  const client = getSupabaseBrowser();
  const { editorial } = product;
  const { error: editorialError } = await client.from('product_editorial').upsert({
    product_id: product.id,
    hero: { ...editorial.hero, slides: undefined },
    showcase: { ...editorial.showcase, features: undefined, panels: undefined },
    finish: { ...editorial.finish, presets: undefined },
    specifications: { ...editorial.specifications, rows: undefined },
    table_content: { ...editorial.table, rituals: undefined },
  });
  if (editorialError) throw editorialError;

  const { error: imageDeleteError } = await client.from('product_images').delete().eq('product_id', product.id);
  if (imageDeleteError) throw imageDeleteError;
  if (product.images.length) {
    const { error: imageInsertError } = await client.from('product_images').insert(product.images.map((url, sortOrder) => ({
      product_id: product.id,
      url,
      alt: product.name,
      role: sortOrder === 0 ? 'catalog' : sortOrder === product.images.length - 1 ? 'showcase' : 'detail',
      sort_order: sortOrder,
    })));
    if (imageInsertError) throw imageInsertError;
  }

  const childTables = ['product_hero_slides', 'product_features', 'product_panels', 'product_finish_presets', 'product_specification_rows', 'product_rituals'];
  for (const table of childTables) {
    const { error } = await client.from(table).delete().eq('product_id', product.id);
    if (error) throw error;
  }

  const childRows = [
    ['product_hero_slides', editorial.hero.slides.map((slide) => ({ product_id: product.id, image_url: slide.imageUrl, alt: slide.alt, category: slide.category, title: slide.title, figure_label: slide.figureLabel, tab_label: slide.tabLabel, badge: slide.badge, sort_order: slide.sortOrder }))],
    ['product_features', editorial.showcase.features.map((feature) => ({ product_id: product.id, label: feature.label, description: feature.description, sort_order: feature.sortOrder }))],
    ['product_panels', editorial.showcase.panels.map((panel) => ({ product_id: product.id, title: panel.title, body: panel.body, sort_order: panel.sortOrder }))],
    ['product_finish_presets', editorial.finish.presets.map((preset) => ({ product_id: product.id, preset_key: preset.key, label: preset.label, angle: preset.angle, roughness: preset.roughness, dispersion: preset.dispersion, sort_order: preset.sortOrder }))],
    ['product_specification_rows', editorial.specifications.rows.map((row) => ({ product_id: product.id, label: row.label, metric: row.metric, imperial: row.imperial, sort_order: row.sortOrder }))],
  ] as const;
  for (const [table, rows] of childRows) {
    if (!rows.length) continue;
    const { error } = await client.from(table).insert(rows as Record<string, unknown>[]);
    if (error) throw error;
  }

  const { data: rituals, error: ritualError } = await client.from('product_rituals').insert(editorial.table.rituals.map((ritual) => ({
    product_id: product.id, title: ritual.title, subtitle: ritual.subtitle, image_url: ritual.imageUrl, image_alt: ritual.imageAlt, description: ritual.description, sort_order: ritual.sortOrder,
  }))).select('id, sort_order');
  if (ritualError) throw ritualError;
  const ritualItems = (rituals || []).flatMap((ritual, index) => editorial.table.rituals[index].items.map((item) => ({ ritual_id: ritual.id, label: item.label, sort_order: item.sortOrder })));
  if (ritualItems.length) {
    const { error } = await client.from('product_ritual_items').insert(ritualItems);
    if (error) throw error;
  }
}

/**
 * Admin: Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  const current = getLocalProducts().filter((p) => p.id !== productId);
  saveLocalProducts(current);

  try {
    const { error } = await getSupabaseBrowser().from('products').delete().eq('id', productId);
    if (error) throw error;
  } catch (error) {
    throw error;
  }
}

function toProduct(item: Record<string, unknown>): Product {
  return {
    id: String(item.id), name: String(item.name), description: String(item.description || ''), price: Number(item.price),
    currency: String(item.currency || 'USD'), images: Array.isArray(item.images) ? item.images as string[] : [],
    specifications: (item.specifications || {}) as Product['specifications'], inStock: item.in_stock !== false,
    editionTotal: typeof item.edition_total === 'number' ? item.edition_total : undefined,
    editionRemaining: typeof item.edition_remaining === 'number' ? item.edition_remaining : undefined,
    createdAt: typeof item.created_at === 'string' ? item.created_at : undefined,
  };
}

async function hydrateProducts(rows: Record<string, unknown>[]): Promise<Product[]> {
  const products = rows.map(toProduct);
  const ids = products.map((product) => product.id);
  if (ids.length === 0) return products;

  const client = getSupabaseBrowser();
  const [editorial, heroSlides, features, panels, presets, specificationRows, rituals] = await Promise.all([
    client.from('product_editorial').select('*').in('product_id', ids),
    client.from('product_hero_slides').select('*').in('product_id', ids).order('sort_order'),
    client.from('product_features').select('*').in('product_id', ids).order('sort_order'),
    client.from('product_panels').select('*').in('product_id', ids).order('sort_order'),
    client.from('product_finish_presets').select('*').in('product_id', ids).order('sort_order'),
    client.from('product_specification_rows').select('*').in('product_id', ids).order('sort_order'),
    client.from('product_rituals').select('*').in('product_id', ids).order('sort_order'),
  ]);

  const relatedErrors = [editorial, heroSlides, features, panels, presets, specificationRows, rituals]
    .map((result) => result.error)
    .find(Boolean);
  if (relatedErrors) throw relatedErrors;

  const ritualRows = (rituals.data || []) as Record<string, unknown>[];
  const ritualIds = ritualRows.map((ritual) => String(ritual.id));
  const ritualItemsResult = ritualIds.length
    ? await client.from('product_ritual_items').select('*').in('ritual_id', ritualIds).order('sort_order')
    : { data: [], error: null };
  if (ritualItemsResult.error) throw ritualItemsResult.error;

  const grouped = new Map<string, ProductEditorialContent>();
  for (const product of products) {
    const productEditorial = (editorial.data || []).find((item) => item.product_id === product.id) as Record<string, unknown> | undefined;
    const hydratedEditorial = toEditorial(product.id, productEditorial, {
      heroSlides: ((heroSlides.data || []) as Record<string, unknown>[]),
      features: ((features.data || []) as Record<string, unknown>[]),
      panels: ((panels.data || []) as Record<string, unknown>[]),
      presets: ((presets.data || []) as Record<string, unknown>[]),
      specificationRows: ((specificationRows.data || []) as Record<string, unknown>[]),
      rituals: ritualRows,
      ritualItems: (ritualItemsResult.data || []) as Record<string, unknown>[],
    });
    const fallbackEditorial = INITIAL_PRODUCTS.find((fallback) => fallback.id === product.id)?.editorial;
    const hasEditorialRows = Boolean(productEditorial) || hydratedEditorial.hero.slides.length > 0 || hydratedEditorial.table.rituals.length > 0;
    grouped.set(product.id, hasEditorialRows ? hydratedEditorial : fallbackEditorial || hydratedEditorial);
  }

  return products.map((product) => ({ ...product, editorial: grouped.get(product.id) }));
}

function toEditorial(
  productId: string,
  row: Record<string, unknown> | undefined,
  related: {
    heroSlides: Record<string, unknown>[];
    features: Record<string, unknown>[];
    panels: Record<string, unknown>[];
    presets: Record<string, unknown>[];
    specificationRows: Record<string, unknown>[];
    rituals: Record<string, unknown>[];
    ritualItems: Record<string, unknown>[];
  }
): ProductEditorialContent {
  const json = (key: string): Record<string, unknown> =>
    row && row[key] && typeof row[key] === 'object' ? row[key] as Record<string, unknown> : {};
  const text = (value: unknown) => String(value || '');
  const owned = (items: Record<string, unknown>[]) => items.filter((item) => item.product_id === productId);
  const hero = json('hero');
  const showcase = json('showcase');
  const finish = json('finish');
  const specifications = json('specifications');
  const table = json('table_content');

  const slides: ProductHeroSlide[] = owned(related.heroSlides).map((item, index) => ({
    id: text(item.id), imageUrl: text(item.image_url), alt: text(item.alt), category: text(item.category),
    title: text(item.title), figureLabel: text(item.figure_label), tabLabel: text(item.tab_label),
    badge: text(item.badge), sortOrder: Number(item.sort_order ?? index),
  }));
  const features: ProductFeature[] = owned(related.features).map((item, index) => ({
    id: text(item.id), label: text(item.label), description: text(item.description), sortOrder: Number(item.sort_order ?? index),
  }));
  const panels: ProductPanel[] = owned(related.panels).map((item, index) => ({
    id: text(item.id), title: text(item.title), body: text(item.body), sortOrder: Number(item.sort_order ?? index),
  }));
  const presets: ProductFinishPreset[] = owned(related.presets).map((item, index) => ({
    id: text(item.id), key: text(item.preset_key), label: text(item.label), angle: Number(item.angle || 0),
    roughness: text(item.roughness), dispersion: text(item.dispersion), sortOrder: Number(item.sort_order ?? index),
  }));
  const specificationRows: ProductSpecificationRow[] = owned(related.specificationRows).map((item, index) => ({
    id: text(item.id), label: text(item.label), metric: text(item.metric), imperial: text(item.imperial), sortOrder: Number(item.sort_order ?? index),
  }));
  const rituals: ProductRitual[] = owned(related.rituals).map((item, index) => ({
    id: text(item.id), title: text(item.title), subtitle: text(item.subtitle), imageUrl: text(item.image_url),
    imageAlt: text(item.image_alt), description: text(item.description), sortOrder: Number(item.sort_order ?? index),
    items: related.ritualItems.filter((ritualItem) => ritualItem.ritual_id === item.id).map((ritualItem, itemIndex): ProductRitualItem => ({
      id: text(ritualItem.id), label: text(ritualItem.label), sortOrder: Number(ritualItem.sort_order ?? itemIndex),
    })),
  }));

  return {
    hero: {
      eyebrow: text(hero.eyebrow), editionLabel: text(hero.edition_label), description: text(hero.description),
      discoverLabel: text(hero.discover_label), reserveLabel: text(hero.reserve_label), materialLabel: text(hero.material_label),
      materialValue: text(hero.material_value), craftLabel: text(hero.craft_label), craftValue: text(hero.craft_value),
      editionLabelMeta: text(hero.edition_label_meta), editionValue: text(hero.edition_value), slides,
    },
    showcase: {
      sectionLabel: text(showcase.section_label), title: text(showcase.title), titleEmphasis: text(showcase.title_emphasis),
      description: text(showcase.description), finishBadge: text(showcase.finish_badge), statusLabel: text(showcase.status_label),
      statusDescription: text(showcase.status_description), provenanceLabel: text(showcase.provenance_label),
      monographLabel: text(showcase.monograph_label), acquireLabel: text(showcase.acquire_label), priorityLabel: text(showcase.priority_label),
      features, panels,
    },
    finish: {
      sectionLabel: text(finish.section_label), title: text(finish.title), titleEmphasis: text(finish.title_emphasis),
      paragraphs: Array.isArray(finish.paragraphs) ? finish.paragraphs.map(text) : [], presetLabel: text(finish.preset_label),
      spectrumLabel: text(finish.spectrum_label), roughnessLabel: text(finish.roughness_label), presets,
    },
    specifications: {
      sectionLabel: text(specifications.section_label), title: text(specifications.title), titleEmphasis: text(specifications.title_emphasis),
      description: text(specifications.description), metricToggleLabel: text(specifications.metric_toggle_label),
      imperialToggleLabel: text(specifications.imperial_toggle_label), serialStamp: text(specifications.serial_stamp),
      archiveLabel: text(specifications.archive_label), rows: specificationRows,
    },
    table: {
      sectionLabel: text(table.section_label), title: text(table.title), titleEmphasis: text(table.title_emphasis),
      description: text(table.description), rituals,
    },
  };
}

function toProductRow(product: Product) {
  return {
    id: product.id, name: product.name, description: product.description, price: product.price, currency: product.currency,
    images: product.images, specifications: product.specifications, in_stock: product.inStock,
    edition_total: product.editionTotal, edition_remaining: product.editionRemaining,
  };
}
