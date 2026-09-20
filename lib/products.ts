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

/**
 * Normalizes Google Drive sharing links to direct CDN endpoints.
 * Handles /file/d/{id}/view, ?id={id}, open?id={id}, uc?id={id}, and lh3.googleusercontent.com
 */
export function formatGoogleDriveUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Already a direct local image or data URI
  if (trimmed.startsWith('/') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Extract Google Drive File ID
  const driveMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  return trimmed;
}

export const DEFAULT_FINISH_PRESETS: ProductFinishPreset[] = [];
export const INITIAL_PRODUCTS: Product[] = [];

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
    for (const product of INITIAL_PRODUCTS) {
      if (product.editorial) {
        await saveEditorialContent(product);
      }
    }
    console.log('[Maison Glint] Seeded default atelier products and editorial reflection presets to Supabase.');
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

  const client = getSupabaseBrowser();
  const { error: productError } = await client.from('products').upsert(toProductRow(product));
  if (productError) {
    throw new Error(`Products table error: ${productError.message || productError.code || JSON.stringify(productError)}`);
  }
  if (product.editorial) {
    await saveEditorialContent(product);
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
    finish: { ...editorial.finish, presets: editorial.finish.presets },
    specifications: { ...editorial.specifications, rows: undefined },
    table_content: { ...editorial.table, rituals: undefined },
  });
  if (editorialError) {
    throw new Error(`Editorial table error: ${editorialError.message || editorialError.code || JSON.stringify(editorialError)}`);
  }

  const { error: imageDeleteError } = await client.from('product_images').delete().eq('product_id', product.id);
  if (imageDeleteError) {
    throw new Error(`Images delete error: ${imageDeleteError.message || imageDeleteError.code || JSON.stringify(imageDeleteError)}`);
  }
  if (product.images.length) {
    const { error: imageInsertError } = await client.from('product_images').insert(product.images.map((url, sortOrder) => ({
      product_id: product.id,
      url,
      alt: product.name,
      role: sortOrder === 0 ? 'catalog' : sortOrder === product.images.length - 1 ? 'showcase' : 'detail',
      sort_order: sortOrder,
    })));
    if (imageInsertError) {
      throw new Error(`Images insert error: ${imageInsertError.message || imageInsertError.code || JSON.stringify(imageInsertError)}`);
    }
  }

  const childTables = ['product_hero_slides', 'product_features', 'product_panels', 'product_finish_presets', 'product_specification_rows', 'product_rituals'];
  for (const table of childTables) {
    const { error } = await client.from(table).delete().eq('product_id', product.id);
    if (error) {
      throw new Error(`${table} delete error: ${error.message || error.code || JSON.stringify(error)}`);
    }
  }

  const childRows = [
    ['product_hero_slides', (editorial.hero?.slides || []).map((slide, idx) => ({ product_id: product.id, image_url: slide.imageUrl, alt: slide.alt || '', category: slide.category || '', title: slide.title || '', figure_label: slide.figureLabel || '', tab_label: slide.tabLabel || '', badge: slide.badge || '', sort_order: slide.sortOrder ?? idx }))],
    ['product_features', (editorial.showcase?.features || []).map((feature, idx) => ({ product_id: product.id, label: feature.label, description: feature.description || '', sort_order: feature.sortOrder ?? idx }))],
    ['product_panels', (editorial.showcase?.panels || []).map((panel, idx) => ({ product_id: product.id, title: panel.title, body: panel.body || '', sort_order: panel.sortOrder ?? idx }))],
    ['product_finish_presets', (editorial.finish?.presets || []).map((preset, idx) => ({ product_id: product.id, preset_key: preset.key, label: preset.label, angle: preset.angle ?? 0, roughness: preset.roughness || '', dispersion: preset.dispersion || '', image_url: preset.imageUrl || '', sort_order: preset.sortOrder ?? idx }))],
    ['product_specification_rows', (editorial.specifications?.rows || []).map((row: any, idx) => ({ product_id: product.id, label: row.label || '', metric: row.metric || row.metricValue || '', imperial: row.imperial || row.imperialValue || '', sort_order: row.sortOrder ?? row.sort_order ?? idx }))],
  ] as const;
  for (const [table, rows] of childRows) {
    if (!rows.length) continue;
    let { error } = await client.from(table).insert(rows as Record<string, unknown>[]);
    if (
      error &&
      table === 'product_finish_presets' &&
      ((error as { code?: string }).code === '42703' ||
        (error as { code?: string }).code === 'PGRST204' ||
        (error as { message?: string }).message?.includes('image_url') ||
        (error as { message?: string }).message?.includes('schema cache'))
    ) {
      // If migration 006 has not been applied yet or schema cache hasn't reloaded, gracefully fallback without image_url column
      console.warn('Column image_url does not exist on product_finish_presets in database schema cache. Retrying without image_url.');
      const fallbackRows = (rows as Record<string, unknown>[]).map(({ image_url: _, ...rest }) => rest);
      const retry = await client.from(table).insert(fallbackRows);
      error = retry.error;
    }
    if (error) {
      throw new Error(`${table} insert error: ${error.message || error.code || JSON.stringify(error)}`);
    }
  }

  const tableRituals = editorial.table?.rituals || [];
  if (tableRituals.length > 0) {
    const { data: rituals, error: ritualError } = await client.from('product_rituals').insert(tableRituals.map((ritual: any, idx) => ({
      product_id: product.id,
      title: ritual.title || '',
      subtitle: ritual.subtitle || ritual.tag || '',
      image_url: ritual.imageUrl || ritual.image || '',
      image_alt: ritual.imageAlt || ritual.title || '',
      description: ritual.description || '',
      sort_order: ritual.sortOrder ?? ritual.sort_order ?? idx,
    }))).select('id, sort_order');
    if (ritualError) {
      throw new Error(`product_rituals insert error: ${ritualError.message || ritualError.code || JSON.stringify(ritualError)}`);
    }
    const ritualItems = (rituals || []).flatMap((ritual, index) => {
      const items = (tableRituals[index] as any)?.items || [];
      return items.map((item: any, itemIdx: number) => ({
        ritual_id: ritual.id,
        label: item.label || '',
        sort_order: item.sortOrder ?? item.sort_order ?? itemIdx,
      }));
    });
    if (ritualItems.length) {
      const { error } = await client.from('product_ritual_items').insert(ritualItems);
      if (error) {
        throw new Error(`product_ritual_items insert error: ${error.message || error.code || JSON.stringify(error)}`);
      }
    }
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
    editionReserved: typeof item.edition_reserved === 'number' ? item.edition_reserved : 0,
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

    grouped.set(product.id, hydratedEditorial);
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
  const text = (value: unknown) => String(value ?? '');
  const owned = (items: Record<string, unknown>[]) => items.filter((item) => item.product_id === productId);
  const hero = json('hero');
  const showcase = json('showcase');
  const finish = json('finish');
  const specifications = json('specifications');
  const table = json('table_content');

  const rawSlides = Array.isArray(hero.slides) ? (hero.slides as Record<string, unknown>[]) : [];
  const slides: ProductHeroSlide[] = owned(related.heroSlides).length > 0
    ? owned(related.heroSlides).map((item, index) => ({
        id: text(item.id),
        imageUrl: text(item.image_url || item.imageUrl),
        alt: text(item.alt),
        category: text(item.category),
        title: text(item.title),
        figureLabel: text(item.figure_label || item.figureLabel),
        tabLabel: text(item.tab_label || item.tabLabel),
        badge: text(item.badge),
        sortOrder: Number(item.sort_order ?? item.sortOrder ?? index),
      }))
    : rawSlides.map((item, index) => ({
        id: text(item.id || `slide-${index}`),
        imageUrl: text(item.imageUrl || item.image_url),
        alt: text(item.alt),
        category: text(item.category),
        title: text(item.title),
        figureLabel: text(item.figureLabel || item.figure_label),
        tabLabel: text(item.tabLabel || item.tab_label),
        badge: text(item.badge),
        sortOrder: Number(item.sortOrder ?? item.sort_order ?? index),
      }));

  const rawFeatures = Array.isArray(showcase.features) ? (showcase.features as Record<string, unknown>[]) : [];
  const features: ProductFeature[] = owned(related.features).length > 0
    ? owned(related.features).map((item, index) => ({
        id: text(item.id), label: text(item.label), description: text(item.description), sortOrder: Number(item.sort_order ?? index),
      }))
    : rawFeatures.map((item, index) => ({
        id: text(item.id || `feat-${index}`), label: text(item.label), description: text(item.description), sortOrder: Number(item.sortOrder ?? item.sort_order ?? index),
      }));

  const rawPanels = Array.isArray(showcase.panels) ? (showcase.panels as Record<string, unknown>[]) : [];
  const panels: ProductPanel[] = owned(related.panels).length > 0
    ? owned(related.panels).map((item, index) => ({
        id: text(item.id), title: text(item.title), body: text(item.body), sortOrder: Number(item.sort_order ?? index),
      }))
    : rawPanels.map((item, index) => ({
        id: text(item.id || `panel-${index}`), title: text(item.title), body: text(item.body), sortOrder: Number(item.sortOrder ?? item.sort_order ?? index),
      }));

  const rawPresets = Array.isArray(finish.presets)
    ? (finish.presets as (ProductFinishPreset & Record<string, unknown>)[])
    : [];
  const presets: ProductFinishPreset[] = owned(related.presets).length > 0
    ? owned(related.presets).map((item, index) => {
        const rawJsonMatch = rawPresets.find((jp) => jp.key === text(item.preset_key));
        return {
          id: text(item.id),
          key: text(item.preset_key),
          label: text(item.label),
          angle: Number(item.angle || 0),
          roughness: text(item.roughness),
          dispersion: text(item.dispersion),
          imageUrl: text(item.image_url) || rawJsonMatch?.imageUrl || (rawJsonMatch?.image_url as string) || '',
          sortOrder: Number(item.sort_order ?? index),
        };
      })
    : rawPresets.map((jp, index) => ({
        id: jp.id || `preset-${jp.key || index}`,
        key: jp.key || `preset-${index}`,
        label: jp.label || '',
        angle: Number(jp.angle || 0),
        roughness: jp.roughness || '',
        dispersion: jp.dispersion || '',
        imageUrl: jp.imageUrl || (jp.image_url as string) || '',
        sortOrder: Number(jp.sortOrder ?? jp.sort_order ?? index),
      }));

  const rawSpecRows = Array.isArray(specifications.rows) ? (specifications.rows as Record<string, unknown>[]) : [];
  const specificationRows: ProductSpecificationRow[] = owned(related.specificationRows).length > 0
    ? owned(related.specificationRows).map((item, index) => ({
        id: text(item.id), label: text(item.label), metric: text(item.metric), imperial: text(item.imperial), sortOrder: Number(item.sort_order ?? index),
      }))
    : rawSpecRows.map((item, index) => ({
        id: text(item.id || `spec-${index}`), label: text(item.label), metric: text(item.metric || item.metricValue), imperial: text(item.imperial || item.imperialValue), sortOrder: Number(item.sortOrder ?? item.sort_order ?? index),
      }));

  const rawRituals = Array.isArray(table.rituals) ? (table.rituals as Record<string, unknown>[]) : [];
  const rituals: ProductRitual[] = owned(related.rituals).length > 0
    ? owned(related.rituals).map((item, index) => ({
        id: text(item.id), title: text(item.title), subtitle: text(item.subtitle), imageUrl: text(item.image_url || item.imageUrl),
        imageAlt: text(item.image_alt || item.imageAlt), description: text(item.description), sortOrder: Number(item.sort_order ?? index),
        items: related.ritualItems.filter((ritualItem) => ritualItem.ritual_id === item.id).map((ritualItem, itemIndex): ProductRitualItem => ({
          id: text(ritualItem.id), label: text(ritualItem.label), sortOrder: Number(ritualItem.sort_order ?? itemIndex),
        })),
      }))
    : rawRituals.map((item, index) => ({
        id: text(item.id || `ritual-${index}`), title: text(item.title), subtitle: text(item.subtitle),
        imageUrl: text(item.imageUrl || item.image_url || item.image),
        imageAlt: text(item.imageAlt || item.image_alt || item.title),
        description: text(item.description),
        sortOrder: Number(item.sortOrder ?? item.sort_order ?? index),
        items: Array.isArray(item.items)
          ? (item.items as Record<string, unknown>[]).map((ritItem, ritIdx) => ({
              id: text(ritItem.id || `ritual-item-${index}-${ritIdx}`),
              label: text(ritItem.label),
              sortOrder: Number(ritItem.sortOrder ?? ritItem.sort_order ?? ritIdx),
            }))
          : [],
      }));

  return {
    hero: {
      eyebrow: text(hero.eyebrow),
      editionLabel: text(hero.editionLabel ?? hero.edition_label),
      description: text(hero.description),
      discoverLabel: text(hero.discoverLabel ?? hero.discover_label),
      reserveLabel: text(hero.reserveLabel ?? hero.reserve_label),
      materialLabel: text(hero.materialLabel ?? hero.material_label),
      materialValue: text(hero.materialValue ?? hero.material_value),
      craftLabel: text(hero.craftLabel ?? hero.craft_label),
      craftValue: text(hero.craftValue ?? hero.craft_value),
      editionLabelMeta: text(hero.editionLabelMeta ?? hero.edition_label_meta),
      editionValue: text(hero.editionValue ?? hero.edition_value),
      slides,
    },
    showcase: {
      sectionLabel: text(showcase.sectionLabel ?? showcase.section_label),
      title: text(showcase.title),
      titleEmphasis: text(showcase.titleEmphasis ?? showcase.title_emphasis),
      description: text(showcase.description),
      finishBadge: text(showcase.finishBadge ?? showcase.finish_badge),
      statusLabel: text(showcase.statusLabel ?? showcase.status_label),
      statusDescription: text(showcase.statusDescription ?? showcase.status_description),
      provenanceLabel: text(showcase.provenanceLabel ?? showcase.provenance_label),
      monographLabel: text(showcase.monographLabel ?? showcase.monograph_label),
      acquireLabel: text(showcase.acquireLabel ?? showcase.acquire_label),
      priorityLabel: text(showcase.priorityLabel ?? showcase.priority_label),
      features,
      panels,
    },
    finish: {
      sectionLabel: text(finish.sectionLabel ?? finish.section_label),
      title: text(finish.title),
      titleEmphasis: text(finish.titleEmphasis ?? finish.title_emphasis),
      paragraphs: Array.isArray(finish.paragraphs) ? finish.paragraphs.map(text) : [],
      presetLabel: text(finish.presetLabel ?? finish.preset_label),
      spectrumLabel: text(finish.spectrumLabel ?? finish.spectrum_label),
      roughnessLabel: text(finish.roughnessLabel ?? finish.roughness_label),
      presets,
    },
    specifications: {
      sectionLabel: text(specifications.sectionLabel ?? specifications.section_label),
      title: text(specifications.title),
      titleEmphasis: text(specifications.titleEmphasis ?? specifications.title_emphasis),
      description: text(specifications.description),
      metricToggleLabel: text(specifications.metricToggleLabel ?? specifications.metric_toggle_label),
      imperialToggleLabel: text(specifications.imperialToggleLabel ?? specifications.imperial_toggle_label),
      serialStamp: text(specifications.serialStamp ?? specifications.serial_stamp),
      archiveLabel: text(specifications.archiveLabel ?? specifications.archive_label),
      rows: specificationRows,
    },
    table: {
      sectionLabel: text(table.sectionLabel ?? table.section_label),
      title: text(table.title),
      titleEmphasis: text(table.titleEmphasis ?? table.title_emphasis),
      description: text(table.description),
      rituals,
    },
  };
}

function toProductRow(product: Product) {
  return {
    id: product.id, name: product.name, description: product.description, price: product.price, currency: product.currency,
    images: product.images, specifications: product.specifications, in_stock: product.inStock,
    edition_total: product.editionTotal, edition_remaining: product.editionRemaining,
    edition_reserved: product.editionReserved ?? 0,
  };
}

export const EMPTY_EDITORIAL_TEMPLATE: ProductEditorialContent = {
  hero: {
    eyebrow: 'Objects for the Everyday Ritual',
    editionLabel: 'Batch 01 / 100',
    description: 'A considered object with a reflective surface, clean geometry, and a quiet presence at the table.',
    discoverLabel: 'Discover Object',
    reserveLabel: 'Acquire Edition',
    materialLabel: 'Material',
    materialValue: 'AISI 304 Stainless Steel',
    craftLabel: 'Surface Craft',
    craftValue: 'Double-Buffed 8K Mirror Chrome',
    editionLabelMeta: 'Provenance',
    editionValue: 'Numbered Atelier Run',
    slides: [
      {
        id: 'slide-1',
        imageUrl: '/images/fig-01-table.png',
        alt: 'Atmosphere setting',
        category: 'Table Setting',
        title: 'A considered presence at the table',
        figureLabel: 'FIG. 01',
        tabLabel: 'Fig. 01',
        badge: 'Atmosphere',
        sortOrder: 0,
      },
    ],
  },
  showcase: {
    sectionLabel: '01 / Object Showcase',
    title: 'New Atelier Edition',
    titleEmphasis: 'Alive with light.',
    description: 'A simple form, a reflective surface, and a different way to set the table.',
    finishBadge: 'Double-Buffed 8K Mirror Chrome',
    statusLabel: 'Status',
    statusDescription: 'Serialized atelier allocation with edition verification and provenance documentation included.',
    provenanceLabel: 'Provenance',
    monographLabel: 'Monograph View',
    acquireLabel: 'Acquire Edition',
    priorityLabel: 'Priority Access',
    features: [
      { id: 'f-1', label: 'Surface Refraction', description: 'A measured finish designed to carry ambient light.', sortOrder: 0 },
    ],
    panels: [
      { id: 'p-1', title: 'Product Details', body: 'Crafted for daily ritual with a considered balance of material, finish, and proportion.', sortOrder: 0 },
    ],
  },
  finish: {
    sectionLabel: '02 / The Finish & Philosophy',
    title: 'Made of steel.',
    titleEmphasis: 'Alive with light.',
    paragraphs: ['A curve. A glint. The room, reflected. A surface that becomes part of the setting.'],
    presetLabel: 'Select Optical Light State',
    spectrumLabel: 'Reflective Index Spectrum',
    roughnessLabel: 'Surface Index',
    presets: [],
  },
  specifications: {
    sectionLabel: '03 / Specifications',
    title: 'Every detail,',
    titleEmphasis: 'considered.',
    description: 'Refined measurements balanced for the surfaces and rituals of everyday dining.',
    metricToggleLabel: 'MM / G',
    imperialToggleLabel: 'IN / OZ',
    serialStamp: 'Verified Serial Stamp',
    archiveLabel: 'Maison Glint Archive',
    rows: [
      { id: 's-1', label: 'DIAMETER', metric: '280 mm', imperial: '11.0 in', sortOrder: 0 },
    ],
  },
  table: {
    sectionLabel: '04 / At The Table',
    title: 'The Art of the Everyday.',
    titleEmphasis: 'Set a different table.',
    description: 'A reflective stage for considered courses and intimate evening settings.',
    rituals: [],
  },
};

