import { apiFetch, ApiError } from './api';

const LOW_STOCK_THRESHOLD = 5; // a partir de cuántas unidades se considera "stock bajo"
const SORT_FIELD = { 'price-asc': ['precio', 'asc'], 'price-desc': ['precio', 'desc'] }; // traduce el orden elegido en la UI al campo/orden real que entiende MockAPI

// Calcula el estado de stock (disponible / bajo / agotado) a partir de la cantidad real.
function stockLevel(qty) {
  if (qty <= 0) return 'out';
  if (qty <= LOW_STOCK_THRESHOLD) return 'low';
  return 'available';
}

/** MockAPI producto -> shape the frontend components consume.
 * `stockQty` is the real unit count; `stock` stays as the derived
 * available/low/out status computed from it — both are exposed, the
 * status is never the only thing kept. `ratingStats` (optional, from
 * getRatingsByName) is real: an average of the calificacion clients left
 * on their delivered orders' detalle_orden lines — not a MockAPI field on
 * producto itself. */
// Convierte un producto crudo de MockAPI a la forma que usa toda la app,
// agregando también la calificación promedio real (si existe).
function mapProduct(p, ratingsByName = {}) {
  const stats = ratingsByName[p.nombre];
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
    stockQty: p.stock ?? 0, // cantidad real de unidades
    stock: stockLevel(p.stock), // estado derivado (disponible/bajo/agotado)
    visitas: p.visitas ?? 0,
    rating: stats ? stats.sum / stats.count : 0, // promedio real de calificaciones
    reviews: stats ? stats.count : 0, // cantidad de calificaciones recibidas
  };
}

/** Real average rating + review count, AND real units-sold count, per
 * product name — both derived from the same /detalle_orden fetch in one
 * pass. Ratings are needed on every product listing (for the star
 * display); sales are only used when sorting by "Más vendidos", but
 * computing both together here means that sort never needs a second
 * fetch of the same collection. */
// Calcula, para cada producto (por nombre), su calificación promedio Y su
// cantidad de unidades vendidas — recorriendo una sola vez las líneas de
// detalle de todos los pedidos.
async function getRatingsAndSalesByName() {
  const detalles = await apiFetch('/detalle_orden');
  const ratingsByName = {};
  const salesByName = {};
  for (const d of detalles) {
    if (d.calificacion) {
      // suma la calificación de esta línea al acumulado del producto
      const stats = ratingsByName[d.producto] ?? { sum: 0, count: 0 };
      stats.sum += Number(d.calificacion);
      stats.count += 1;
      ratingsByName[d.producto] = stats;
    }
    // suma la cantidad vendida en esta línea al total del producto
    salesByName[d.producto] = (salesByName[d.producto] ?? 0) + (d.cantidad ?? 0);
  }
  return { ratingsByName, salesByName };
}

/** frontend product fields -> MockAPI producto body (partial, allowlist). */
// Convierte los campos del formulario de producto al formato que espera
// MockAPI — solo incluye los campos que vengan definidos (para no pisar
// datos al hacer una edición parcial).
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

/**
 * Fetches producto with MockAPI query params and maps + drops inactive
 * rows. MockAPI answers a filter with zero matches with a 404 ("Not
 * found"), not an empty 200 array — that's treated as "no results", not a
 * request failure.
 */
// Pide productos a MockAPI con ciertos filtros, descarta los inactivos y
// los convierte a la forma de la app. Si el filtro no encuentra nada,
// MockAPI responde 404 en vez de una lista vacía — acá se lo trata como
// "0 resultados", no como un error real.
async function fetchProducts(params, ratingsByName) {
  try {
    const raw = await apiFetch('/producto', { params });
    return raw.filter(p => p.estado !== false).map(p => mapProduct(p, ratingsByName));
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
 *
 * `sort: 'rating' | 'visitas' | 'bestsellers'` are the three real,
 * non-fabricated rankings the home page's "Ver todo" buttons link to
 * ("Destacados", "Recomendados", "Más vendido") — none of them are
 * MockAPI query params, so they're applied client-side, same as
 * precioMin/precioMax/soloDescuento above.
 */
// Función principal del catálogo: filtra, ordena y pagina productos.
// Combina lo que MockAPI puede resolver en el servidor (categoría, marca,
// orden por precio) con filtros que se aplican acá mismo en JavaScript
// (rango de precio, solo con descuento, búsqueda de texto, y los 3
// órdenes "reales" — calificación, visitas, más vendidos).
export async function getProducts({
  page, limit, categoria, marca, precioMin, precioMax, soloDescuento, soloDisponible, sort, search,
} = {}) {
  const marcas = Array.isArray(marca) ? marca.filter(Boolean) : marca ? [marca] : []; // normaliza a un array de marcas
  const [sortField, sortOrder] = SORT_FIELD[sort] ?? []; // busca si el orden pedido es uno que MockAPI sabe resolver

  const baseParams = {};
  if (categoria) baseParams.categoria = categoria;
  if (sortField) { baseParams.sortBy = sortField; baseParams.order = sortOrder; }

  const { ratingsByName, salesByName } = await getRatingsAndSalesByName();
  // Si hay más de una marca seleccionada, hace una petición por cada una (MockAPI no soporta "marca A o B" en una sola).
  const requests = marcas.length > 0 ? marcas.map(m => ({ ...baseParams, marca: m })) : [baseParams];
  const chunks = await Promise.all(requests.map(params => fetchProducts(params, ratingsByName)));
  let list = chunks.flat(); // une los resultados de todas las peticiones en una sola lista

  if (marcas.length > 1 && sortField === 'precio') {
    // si se pidieron varias marcas, cada petición viene ordenada por separado — hay que reordenar todo junto
    list.sort((a, b) => sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
  }

  if (soloDisponible) list = list.filter(p => p.stock !== 'out'); // saca los productos sin stock
  if (precioMin !== undefined && precioMin !== '') list = list.filter(p => p.price >= Number(precioMin));
  if (precioMax !== undefined && precioMax !== '') list = list.filter(p => p.price <= Number(precioMax));
  if (soloDescuento) list = list.filter(p => p.originalPrice !== undefined && p.originalPrice > p.price);
  // Los 3 órdenes "reales" que no puede resolver MockAPI, se aplican acá:
  if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating); // mejor calificados primero
  else if (sort === 'visitas') list = [...list].sort((a, b) => b.visitas - a.visitas); // más vistos primero
  else if (sort === 'bestsellers') list = [...list].sort((a, b) => (salesByName[b.name] ?? 0) - (salesByName[a.name] ?? 0)); // más vendidos primero
  if (search) {
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  // Pagina la lista ya filtrada/ordenada (en memoria, no en MockAPI).
  const total = list.length;
  const limitNum = limit ?? (total || 1);
  const pageNum = page ?? 1;
  const data = (page || limit)
    ? list.slice((pageNum - 1) * limitNum, (pageNum - 1) * limitNum + limitNum)
    : list;

  return { data, page: pageNum, limit: limitNum, total, totalPages: Math.max(1, Math.ceil(total / limitNum)) };
}

/**
 * `precio_original`/`badge_label` are explicitly defaulted here (not left
 * out when the admin doesn't set them) — confirmed live that MockAPI's
 * schema auto-fills omitted fields on producto with fake placeholder data
 * (a random number for precio_original, a "badge_label N" string) instead
 * of leaving them blank/absent. Without this, every product created
 * without a discount would come back with a bogus non-zero
 * precio_original, showing a fake discount badge on the storefront.
 */
// Crea un producto nuevo. precio_original y badge_label se mandan siempre
// explícitos (aunque estén vacíos), porque si se omiten, MockAPI los
// rellena solo con datos inventados — ver la nota en inglés arriba.
export async function createProduct(fields) {
  const raw = await apiFetch('/producto', {
    method: 'POST',
    body: JSON.stringify({
      precio_original: 0,
      badge_label: '',
      ...buildProductBody(fields),
      estado: true,
      visitas: 0,
    }),
  });
  return mapProduct(raw);
}

// Actualiza un producto existente (edición parcial).
export async function updateProduct(id, fields) {
  const raw = await apiFetch(`/producto/${id}`, {
    method: 'PUT',
    body: JSON.stringify(buildProductBody(fields)),
  });
  return mapProduct(raw);
}

// Elimina un producto.
export async function deleteProduct(id) {
  return apiFetch(`/producto/${id}`, { method: 'DELETE' });
}

/** Fetches one product's current data — used right before checkout to
 * re-check real stock, since it can change between when an item was
 * added to the cart and when the order is actually placed. */
// Trae un producto puntual por su id (se usa para revalidar el stock
// justo antes de confirmar una compra).
export async function getProductById(id) {
  const raw = await apiFetch(`/producto/${id}`);
  return mapProduct(raw);
}

/**
 * Read-then-write, same race caveat as incrementarVisita — best-effort,
 * not a hard inventory guarantee under concurrent checkouts. Never goes
 * below 0.
 */
// Resta unidades del stock de un producto después de una compra (lee el
// valor actual y escribe el nuevo — nunca baja de 0).
export async function decrementStock(productId, qty) {
  const producto = await apiFetch(`/producto/${productId}`);
  const newStock = Math.max(0, (producto.stock ?? 0) - qty);
  return apiFetch(`/producto/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ stock: newStock }),
  });
}

/** "Destacados" = best-rated (a real, computed average — not fabricated),
 * same ranking the home page's "Ver todo" button on this section links to
 * via CategoryView's sort: 'rating'. */
// Trae los productos "destacados" de la portada: los mejor calificados
// (dato real, no inventado).
export async function getFeaturedProducts(count = 4) {
  const { data } = await getProducts({ limit: count, soloDisponible: true, sort: 'rating' });
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
// Trae "lo más vendido" de la portada: cuenta cuántas unidades se
// vendieron de cada producto (según las líneas de pedido reales) y se
// queda con los primeros. Si todavía no hay ninguna venta registrada,
// muestra los destacados en su lugar.
export async function getBestSellers(count = 4) {
  const [{ data: products }, detalles] = await Promise.all([
    getProducts({ soloDisponible: true }),
    apiFetch('/detalle_orden'),
  ]);

  // Suma las unidades vendidas de cada producto por su nombre.
  const qtyByProductName = {};
  for (const d of detalles) {
    qtyByProductName[d.producto] = (qtyByProductName[d.producto] ?? 0) + (d.cantidad ?? 0);
  }

  const ranked = products
    .filter(p => qtyByProductName[p.name] > 0) // solo productos que se vendieron al menos una vez
    .sort((a, b) => qtyByProductName[b.name] - qtyByProductName[a.name]) // más vendido primero
    .slice(0, count);

  return ranked.length > 0 ? ranked : getFeaturedProducts(count); // respaldo si no hay ventas todavía
}

/**
 * +1 on a product's visitas. MockAPI has no atomic increment, so this is a
 * read-then-write — two increments firing at the same instant could race
 * and one might get lost. Acceptable for a view counter, not for anything
 * that needs to be exact (like stock).
 */
// Suma +1 a la cantidad de visitas de un producto (se llama cada vez que
// alguien abre su vista de detalle).
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
// Trae los "recomendados para ti" de la portada: los productos más
// visitados (dato real).
export async function getRecommendedProducts(count = 4) {
  const { data } = await getProducts({ soloDisponible: true });
  return [...data].sort((a, b) => b.visitas - a.visitas).slice(0, count);
}
