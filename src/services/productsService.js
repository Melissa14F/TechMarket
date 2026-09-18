import { apiFetch, ApiError } from './api';

const LOW_STOCK_THRESHOLD = 5;
const SORT_FIELD = { 'price-asc': ['precio', 'asc'], 'price-desc': ['precio', 'desc'] };

function stockLevel(qty) {
  if (qty <= 0) return 'out';
  if (qty <= LOW_STOCK_THRESHOLD) return 'low';
  return 'available';
}

/** MockAPI producto -> shape the frontend components consume.
 * `stockQty` is the real unit count; `stock` stays as the derived
 * available/low/out status computed from it — both are exposed, the
 * status is never the only thing kept. */
function mapProduct(p) {
  return {
    id: p.id,
    name: p.nombre,
    description: p.descripcion,
    brand: p.marca,
    category: p.categoria,
    price: p.precio,
    originalPrice: p.precio_original || undefined,
    image: p.imagen,
    badge: p.badge_label ? { label: p.badge_label } : undefined,
    stockQty: p.stock ?? 0,
    stock: stockLevel(p.stock),
    visitas: p.visitas ?? 0,
    // MockAPI has no rating/reviews fields yet — default so <Stars> doesn't
    // render NaN. Remove this fallback once those fields exist upstream.
    rating: 0,
    reviews: 0,
  };
}

/** frontend product fields -> MockAPI producto body (partial, allowlist). */
function buildProductBody(fields = {}) {
  const body = {};
  if (fields.name !== undefined) body.nombre = fields.name;
  if (fields.description !== undefined) body.descripcion = fields.description;
  if (fields.brand !== undefined) body.marca = fields.brand;
  if (fields.category !== undefined) body.categoria = fields.category;
  if (fields.price !== undefined) body.precio = Number(fields.price);
  if (fields.originalPrice !== undefined) body.precio_original = fields.originalPrice ? Number(fields.originalPrice) : 0;
  if (fields.image !== undefined) body.imagen = fields.image;
  if (fields.badge !== undefined) body.badge_label = fields.badge?.label ?? '';
  if (fields.stockQty !== undefined) body.stock = Number(fields.stockQty);
  if (fields.active !== undefined) body.estado = fields.active;
  return body;
}

/** MockAPI banner -> shape Hero.jsx consumes.
 * `boton_texto` isn't part of the resource's original schema — MockAPI
 * stores whatever extra JSON properties get sent, so it works as a real,
 * persisted field once the admin form starts writing it; falls back to
 * 'Ver ahora' for existing banners that predate it. */
function mapBanner(b) {
  return {
    id: b.id,
    title: b.titulo,
    subtitle: b.subtitulo,
    cta: b.boton_texto || 'Ver ahora',
    link: b.boton_link,
    image: b.imagen,
    accent: b.color_boton,
    order: b.orden ?? 0,
    active: b.estado !== false,
  };
}

/** frontend banner fields -> MockAPI banner body (partial, allowlist). */
function buildBannerBody(fields = {}) {
  const body = {};
  if (fields.title !== undefined) body.titulo = fields.title;
  if (fields.subtitle !== undefined) body.subtitulo = fields.subtitle;
  if (fields.cta !== undefined) body.boton_texto = fields.cta;
  if (fields.link !== undefined) body.boton_link = fields.link;
  if (fields.image !== undefined) body.imagen = fields.image;
  if (fields.accent !== undefined) body.color_boton = fields.accent;
  if (fields.order !== undefined) body.orden = Number(fields.order);
  if (fields.active !== undefined) body.estado = fields.active;
  return body;
}

/**
 * Fetches producto with MockAPI query params and maps + drops inactive
 * rows. MockAPI answers a filter with zero matches with a 404 ("Not
 * found"), not an empty 200 array — that's treated as "no results", not a
 * request failure.
 */
async function fetchProducts(params) {
  try {
    const raw = await apiFetch('/producto', { params });
    return raw.filter(p => p.estado !== false).map(mapProduct);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

/**
 * Filters/sorts/pages the catalog. What actually reaches MockAPI as query
 * params: `categoria` and `marca` (exact match only — confirmed there's no
 * OR across several marca values, `marca=A&marca=B` 404s — so more than
 * one selected brand fires one request per brand and merges the results)
 * and `sortBy`/`order` for price.
 *
 * What MockAPI can't do at all, and so runs here instead on the
 * already server-filtered set: `precioMin`/`precioMax` (no gte/lte support
 * — a range query 404s the same as an unmatched filter), `soloDescuento`
 * (comparing precio_original to precio on the same row isn't expressible
 * as a query param on any REST backend), and `search` (no full-text search
 * param either — `?q=` 404s too; kept here so the header search box, which
 * isn't part of this step's param list, doesn't regress).
 *
 * `page`/`limit` paginate that final list in memory rather than being
 * handed to MockAPI directly, so `total`/`totalPages` stay correct no
 * matter which of the above ran — the catalog is small enough that
 * fetching everything that matches and paging it here costs nothing.
 *
 * `soloDisponible` drops out-of-stock products entirely — used by every
 * customer-facing call site (catalog, home sections, favorites) so a
 * product with 0 units never shows up to shop at all. AdminView calls
 * getProducts() without it on purpose: an admin managing inventory needs
 * to see out-of-stock products too, not have them disappear.
 */
export async function getProducts({
  page, limit, categoria, marca, precioMin, precioMax, soloDescuento, soloDisponible, sort, search,
} = {}) {
  const marcas = Array.isArray(marca) ? marca.filter(Boolean) : marca ? [marca] : [];
  const [sortField, sortOrder] = SORT_FIELD[sort] ?? [];

  const baseParams = {};
  if (categoria) baseParams.categoria = categoria;
  if (sortField) { baseParams.sortBy = sortField; baseParams.order = sortOrder; }

  const requests = marcas.length > 0 ? marcas.map(m => ({ ...baseParams, marca: m })) : [baseParams];
  const chunks = await Promise.all(requests.map(fetchProducts));
  let list = chunks.flat();

  if (marcas.length > 1 && sortField === 'precio') {
    list.sort((a, b) => sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
  }

  if (soloDisponible) list = list.filter(p => p.stock !== 'out');
  if (precioMin !== undefined && precioMin !== '') list = list.filter(p => p.price >= Number(precioMin));
  if (precioMax !== undefined && precioMax !== '') list = list.filter(p => p.price <= Number(precioMax));
  if (soloDescuento) list = list.filter(p => p.originalPrice !== undefined && p.originalPrice > p.price);
  if (search) {
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  const total = list.length;
  const limitNum = limit ?? (total || 1);
  const pageNum = page ?? 1;
  const data = (page || limit)
    ? list.slice((pageNum - 1) * limitNum, (pageNum - 1) * limitNum + limitNum)
    : list;

  return { data, page: pageNum, limit: limitNum, total, totalPages: Math.max(1, Math.ceil(total / limitNum)) };
}

export async function createProduct(fields) {
  const raw = await apiFetch('/producto', {
    method: 'POST',
    body: JSON.stringify({ ...buildProductBody(fields), estado: true, visitas: 0 }),
  });
  return mapProduct(raw);
}

export async function updateProduct(id, fields) {
  const raw = await apiFetch(`/producto/${id}`, {
    method: 'PUT',
    body: JSON.stringify(buildProductBody(fields)),
  });
  return mapProduct(raw);
}

export async function deleteProduct(id) {
  return apiFetch(`/producto/${id}`, { method: 'DELETE' });
}

/**
 * Read-then-write, same race caveat as incrementarVisita — best-effort,
 * not a hard inventory guarantee under concurrent checkouts. Never goes
 * below 0.
 */
export async function decrementStock(productId, qty) {
  const producto = await apiFetch(`/producto/${productId}`);
  const newStock = Math.max(0, (producto.stock ?? 0) - qty);
  return apiFetch(`/producto/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ stock: newStock }),
  });
}

export async function getBanners() {
  const raw = await apiFetch('/banner');
  return raw
    .filter(b => b.estado !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map(mapBanner);
}

/** Every banner, active or not — for the admin panel. getBanners() (Hero's
 * carousel) only shows active ones, so an admin using that same function
 * would never see (or be able to re-enable) a disabled banner. */
export async function getAllBanners() {
  const raw = await apiFetch('/banner');
  return raw
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map(mapBanner);
}

export async function createBanner(fields) {
  const raw = await apiFetch('/banner', {
    method: 'POST',
    body: JSON.stringify({ ...buildBannerBody(fields), estado: true }),
  });
  return mapBanner(raw);
}

export async function updateBanner(id, fields) {
  const raw = await apiFetch(`/banner/${id}`, {
    method: 'PUT',
    body: JSON.stringify(buildBannerBody(fields)),
  });
  return mapBanner(raw);
}

export async function deleteBanner(id) {
  return apiFetch(`/banner/${id}`, { method: 'DELETE' });
}

export async function getFeaturedProducts(count = 4) {
  const { data } = await getProducts({ limit: count, soloDisponible: true });
  return data;
}

/**
 * Ranks products by units sold, derived from detalle_orden (there's no
 * "sales" field on producto itself). detalle_orden.producto stores the
 * product's *name*, not its id, so that's what the grouping keys off —
 * a fragile join (renaming a product orphans its order history), but it's
 * what the current data model has.
 * Falls back to getFeaturedProducts when there's no order history yet.
 */
export async function getBestSellers(count = 4) {
  const [{ data: products }, detalles] = await Promise.all([
    getProducts({ soloDisponible: true }),
    apiFetch('/detalle_orden'),
  ]);

  const qtyByProductName = {};
  for (const d of detalles) {
    qtyByProductName[d.producto] = (qtyByProductName[d.producto] ?? 0) + (d.cantidad ?? 0);
  }

  const ranked = products
    .filter(p => qtyByProductName[p.name] > 0)
    .sort((a, b) => qtyByProductName[b.name] - qtyByProductName[a.name])
    .slice(0, count);

  return ranked.length > 0 ? ranked : getFeaturedProducts(count);
}

/**
 * +1 on a product's visitas. MockAPI has no atomic increment, so this is a
 * read-then-write — two increments firing at the same instant could race
 * and one might get lost. Acceptable for a view counter, not for anything
 * that needs to be exact (like stock).
 */
export async function incrementarVisita(productId) {
  const producto = await apiFetch(`/producto/${productId}`);
  return apiFetch(`/producto/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ visitas: (producto.visitas ?? 0) + 1 }),
  });
}

/**
 * MockAPI's producto has no `rating` field, so "recommended" can't be
 * ranked by rating like the original mock did. Ranks by `visitas` instead
 * (most-viewed = most relevant) — real data, no fabricated field needed.
 */
export async function getRecommendedProducts(count = 4) {
  const { data } = await getProducts({ soloDisponible: true });
  return [...data].sort((a, b) => b.visitas - a.visitas).slice(0, count);
}
