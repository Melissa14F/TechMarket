import { apiFetch } from './api';

// getCategories, getDiscounts y getPageInfo se movieron a
// categoriesService.js, discountsService.js y pageInfoService.js
// respectivamente, ya conectados a MockAPI. getRecentOrders también es
// real ahora (ver abajo).
//
// getMonthlySales sigue en datos de muestra: /orden en MockAPI solo tiene
// pedidos de un único mes (agosto 2026), así que agruparlos "por mes"
// ahora mismo daría una sola barra, no una tendencia real. Ver
// recomendación entregada en el chat para decidir cómo encarar esto en
// una fase de reportes aparte, una vez haya varios meses de historial.

const MONTHLY_SALES = [
  { mes: 'Abr', ventas: 38400, ordenes: 52 },
  { mes: 'May', ventas: 51200, ordenes: 68 },
  { mes: 'Jun', ventas: 44800, ordenes: 59 },
  { mes: 'Jul', ventas: 67300, ordenes: 84 },
  { mes: 'Ago', ventas: 59100, ordenes: 76 },
  { mes: 'Sep', ventas: 72400, ordenes: 91 },
];

export function getMonthlySales() {
  return MONTHLY_SALES;
}

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS_ES[d.getUTCMonth()]}`;
}

/**
 * Collapses the 10 real estado_orden values into the 4 buckets this
 * dashboard's status pill understands (same idea as ordersService's
 * STATUS_BUCKET, but 'completado' here instead of 'entregado' — this is
 * the admin-facing label set, not the client-facing one).
 */
const STATUS_BUCKET = {
  'Entregado': 'completado',
  'Enviado': 'enviado',
  'En camino': 'enviado',
  'Cancelado': 'cancelado',
  'Devuelto': 'cancelado',
  'Reembolsado': 'cancelado',
  'Pendiente': 'procesando',
  'Confirmado': 'procesando',
  'En preparación': 'procesando',
  'En espera de pago': 'procesando',
};

/**
 * Real orders, most recent first. `product` comes from the first
 * detalle_orden line matched by numero_seguimiento (the real join key —
 * detalle_orden.orden is that tracking code, not orden.id); most orders
 * have no matching line yet in the current seed data, so this falls back
 * to '—' rather than guessing.
 */
/**
 * Every real estado_orden value, in a sensible lifecycle order for a
 * dropdown — not a strict linear flow (Cancelado/Devuelto/Reembolsado are
 * side branches, not a single next-step), so this stays a free-form pick
 * rather than a stepper.
 */
export const ORDER_STATUSES = [
  'Pendiente', 'En espera de pago', 'Confirmado', 'En preparación',
  'Enviado', 'En camino', 'Entregado', 'Devuelto', 'Reembolsado', 'Cancelado',
];

export function statusBucket(estado) {
  return STATUS_BUCKET[estado] ?? 'procesando';
}

/** Every order, full detail, for the admin panel — not filtered by
 * client like ordersService.getOrders. */
export async function getAllOrders() {
  const [ordenes, detalles, productos] = await Promise.all([
    apiFetch('/orden'),
    apiFetch('/detalle_orden'),
    apiFetch('/producto'),
  ]);

  const detallesByTracking = {};
  for (const d of detalles) {
    (detallesByTracking[d.orden] ??= []).push(d);
  }

  const productsByName = {};
  for (const p of productos) productsByName[p.nombre] = p;

  return ordenes
    .slice()
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .map((o) => ({
      id: o.id,
      displayId: `#ORD-${o.id}`,
      customer: o.cliente,
      date: formatDate(o.fecha),
      total: o.total,
      payment: o.metodo_pago,
      address: o.direccion_envio,
      postalCode: o.codigo_postal,
      tracking: o.numero_seguimiento,
      estado: o.estado_orden,
      items: (detallesByTracking[o.numero_seguimiento] ?? []).map((d) => ({
        name: d.producto,
        qty: d.cantidad,
        price: d.precio_unitario,
        image: productsByName[d.producto]?.imagen ?? '',
      })),
    }));
}

export async function updateOrderStatus(id, estado) {
  return apiFetch(`/orden/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ estado_orden: estado }),
  });
}

export async function getRecentOrders(count = 6) {
  const [ordenes, detalles] = await Promise.all([
    apiFetch('/orden'),
    apiFetch('/detalle_orden'),
  ]);

  const firstItemByTracking = {};
  for (const d of detalles) {
    if (!firstItemByTracking[d.orden]) firstItemByTracking[d.orden] = d.producto;
  }

  return ordenes
    .slice()
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, count)
    .map((o) => ({
      id: `#ORD-${o.id}`,
      customer: o.cliente,
      product: firstItemByTracking[o.numero_seguimiento] ?? '—',
      amount: o.total,
      status: STATUS_BUCKET[o.estado_orden] ?? 'procesando',
      date: formatDate(o.fecha),
    }));
}
