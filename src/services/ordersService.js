import { apiFetch, ApiError } from './api';

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * MockAPI's estado_orden has 10 distinct real values. `order.status`
 * carries that real value as-is (so any change the admin makes is always
 * visible to the client, not silently absorbed into a coarser bucket) —
 * this bucket is only for picking an icon/color grouping in the UI.
 */
const STATUS_BUCKET = {
  'Entregado': 'entregado',
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

export function statusBucket(estado) {
  return STATUS_BUCKET[estado] ?? 'procesando';
}

/** Tracking only shows once the order has actually shipped, per the
 * requested rule — even though the current seed data has every order
 * pre-filled with a numero_seguimiento regardless of status. */
const SHIPPED_STATUSES = new Set(['Enviado', 'En camino', 'Entregado', 'Devuelto', 'Reembolsado']);

async function fetchClienteOrdenes(clienteName) {
  try {
    return await apiFetch('/orden', { params: { cliente: clienteName } });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

/**
 * detalle_orden.orden is NOT orden.id — it's the tracking code
 * (numero_seguimiento, e.g. "TRK-100001"). That's the real join key.
 */
function mapOrder(o, detallesByTracking, productsByName) {
  const items = (detallesByTracking[o.numero_seguimiento] ?? []).map((d) => {
    const product = productsByName[d.producto];
    return {
      // undefined when the product was renamed/deleted since — "Volver a
      // comprar" skips items it can't match back to a real product.
      id: product?.id,
      name: d.producto,
      brand: product?.marca ?? '',
      qty: d.cantidad,
      price: d.precio_unitario,
      image: product?.imagen ?? '',
    };
  });

  return {
    id: `#ORD-${o.id}`,
    rawId: o.id,
    date: formatDate(o.fecha),
    status: o.estado_orden,
    total: o.total,
    items,
    tracking: SHIPPED_STATUSES.has(o.estado_orden) ? o.numero_seguimiento : '',
    address: o.direccion_envio,
    postalCode: o.codigo_postal,
    payment: o.metodo_pago,
  };
}

export async function cancelOrder(id) {
  return apiFetch(`/orden/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ estado_orden: 'Cancelado' }),
  });
}

/**
 * `clienteName` must match orden.cliente exactly — MockAPI stores the
 * client on an order as a plain "Nombre Apellido" string, not an id
 * reference, so this needs the client's full name (authService.login
 * returns `${nombre} ${apellido}` for exactly this reason).
 */
/**
 * Creates a real order + its detalle_orden lines. numero_seguimiento
 * doubles as the join key detalle_orden.orden points to (same convention
 * as every existing order), so it's generated once and reused for both.
 */
export async function createOrder({ clienteName, items, address, postalCode, paymentMethod = 'Tarjeta de crédito', discountAmount = 0 }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = Math.max(0, Math.round(subtotal - discountAmount));
  const trackingCode = `TRK-${Date.now()}`;

  await apiFetch('/orden', {
    method: 'POST',
    body: JSON.stringify({
      cliente: clienteName,
      fecha: new Date().toISOString(),
      metodo_pago: paymentMethod,
      total,
      descuento: discountAmount,
      direccion_envio: address ?? '',
      codigo_postal: postalCode ?? '',
      estado_orden: 'Pendiente',
      numero_seguimiento: trackingCode,
    }),
  });

  await Promise.all(items.map((item) => apiFetch('/detalle_orden', {
    method: 'POST',
    body: JSON.stringify({
      orden: trackingCode,
      producto: item.name,
      cantidad: item.qty,
      precio_unitario: item.price,
      subtotal: item.price * item.qty,
    }),
  })));
}

export async function getOrders(clienteName) {
  const [ordenes, detalles, productos] = await Promise.all([
    fetchClienteOrdenes(clienteName),
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
    .map((o) => mapOrder(o, detallesByTracking, productsByName));
}
