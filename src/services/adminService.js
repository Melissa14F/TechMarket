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

// Datos de ejemplo para el gráfico de ventas mensuales del Dashboard.
const MONTHLY_SALES = [
  { mes: 'Abr', ventas: 38400, ordenes: 52 },
  { mes: 'May', ventas: 51200, ordenes: 68 },
  { mes: 'Jun', ventas: 44800, ordenes: 59 },
  { mes: 'Jul', ventas: 67300, ordenes: 84 },
  { mes: 'Ago', ventas: 59100, ordenes: 76 },
  { mes: 'Sep', ventas: 72400, ordenes: 91 },
];

// Devuelve los datos de ventas mensuales (mock, ver nota arriba).
export function getMonthlySales() {
  return MONTHLY_SALES;
}

// Formatea una fecha ISO como "19 Sep" (día + mes abreviado en español).
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
// Mapea cada estado real de pedido a uno de 4 grupos, solo para elegir
// color/ícono en el panel admin (el texto real del estado se sigue
// mostrando tal cual en otros lugares).
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

// Devuelve el grupo (bucket) correspondiente a un estado real; si no lo
// reconoce, lo trata como "procesando" por defecto.
export function statusBucket(estado) {
  return STATUS_BUCKET[estado] ?? 'procesando';
}

// Trae TODOS los pedidos (de cualquier cliente) con su detalle completo,
// pensado para el panel de administración de Pedidos.
export async function getAllOrders() {
  // Trae las 3 colecciones en paralelo: pedidos, líneas de detalle y productos.
  const [ordenes, detalles, productos] = await Promise.all([
    apiFetch('/orden'),
    apiFetch('/detalle_orden'),
    apiFetch('/producto'),
  ]);

  // Agrupa las líneas de detalle por número de seguimiento (la clave real
  // que las relaciona con su pedido, no el id del pedido).
  const detallesByTracking = {};
  for (const d of detalles) {
    (detallesByTracking[d.orden] ??= []).push(d);
  }

  // Arma un diccionario de productos por nombre, para poder buscar la imagen rápido.
  const productsByName = {};
  for (const p of productos) productsByName[p.nombre] = p;

  // Ordena los pedidos del más reciente al más viejo y les da la forma
  // final que usa el panel admin (incluyendo sus líneas de detalle).
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

// Actualiza el estado de un pedido puntual (lo usa el desplegable de
// estado en el panel de Pedidos del admin).
export async function updateOrderStatus(id, estado) {
  return apiFetch(`/orden/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ estado_orden: estado }),
  });
}

// Trae los últimos "count" pedidos (por defecto 6), con una forma más
// resumida, para la tabla de "Órdenes recientes" del Dashboard.
export async function getRecentOrders(count = 6) {
  const [ordenes, detalles] = await Promise.all([
    apiFetch('/orden'),
    apiFetch('/detalle_orden'),
  ]);

  // Para cada pedido, guarda el nombre del primer producto de su detalle
  // (alcanza con uno solo para mostrarlo en la tabla resumida).
  const firstItemByTracking = {};
  for (const d of detalles) {
    if (!firstItemByTracking[d.orden]) firstItemByTracking[d.orden] = d.producto;
  }

  return ordenes
    .slice()
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // más recientes primero
    .slice(0, count) // se queda solo con los primeros "count"
    .map((o) => ({
      id: `#ORD-${o.id}`,
      customer: o.cliente,
      product: firstItemByTracking[o.numero_seguimiento] ?? '—',
      amount: o.total,
      status: STATUS_BUCKET[o.estado_orden] ?? 'procesando',
      date: formatDate(o.fecha),
    }));
}
