import { apiFetch } from './api';

// Convierte un descuento/cupón crudo de MockAPI a la forma que usa la app.
function mapDiscount(d) {
  return {
    id: d.id,
    code: d.codigo,
    type: d.tipo, // 'porcentaje' | 'monto_fijo' (real MockAPI values)
    value: d.valor,
    minOrder: d.pedido_minimo,
    uses: d.usos,
    maxUses: d.usos_max,
    active: d.estado !== false,
    expires: d.fecha_vencimiento,
  };
}

// Trae todos los cupones (para el panel de admin y para validar códigos en el carrito).
export async function getDiscounts() {
  const raw = await apiFetch('/descuento');
  return raw.map(mapDiscount);
}

// Crea un cupón nuevo, activo y con 0 usos.
export async function createDiscount({ code, type, value, minOrder, maxUses, expires }) {
  const raw = await apiFetch('/descuento', {
    method: 'POST',
    body: JSON.stringify({
      codigo: code,
      tipo: type,
      valor: Number(value),
      pedido_minimo: Number(minOrder) || 0,
      usos: 0,
      usos_max: Number(maxUses) || 0,
      estado: true,
      fecha_vencimiento: expires,
    }),
  });
  return mapDiscount(raw);
}

// Actualiza un cupón existente (edición parcial).
export async function updateDiscount(id, fields = {}) {
  const body = {};
  if (fields.code !== undefined) body.codigo = fields.code;
  if (fields.type !== undefined) body.tipo = fields.type;
  if (fields.value !== undefined) body.valor = Number(fields.value);
  if (fields.minOrder !== undefined) body.pedido_minimo = Number(fields.minOrder);
  if (fields.maxUses !== undefined) body.usos_max = Number(fields.maxUses);
  if (fields.uses !== undefined) body.usos = Number(fields.uses);
  if (fields.active !== undefined) body.estado = fields.active;
  if (fields.expires !== undefined) body.fecha_vencimiento = fields.expires;

  const raw = await apiFetch(`/descuento/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapDiscount(raw);
}

// Activa o desactiva un cupón (atajo sobre updateDiscount).
export async function toggleDiscount(id, active) {
  return updateDiscount(id, { active });
}

// Elimina un cupón.
export async function deleteDiscount(id) {
  return apiFetch(`/descuento/${id}`, { method: 'DELETE' });
}

// Suma +1 al contador de usos de un cupón — se llama cada vez que un
// cliente completa una compra usándolo, para que el límite de "usos
// máximos" funcione de verdad.
export async function incrementUsage(id) {
  const raw = await apiFetch(`/descuento/${id}`); // trae el valor actual...
  return updateDiscount(id, { uses: (raw.usos ?? 0) + 1 }); // ...y lo actualiza en +1
}

// Función pura (no llama a la API): revisa si un cupón se puede aplicar a
// una compra de cierto total, y si es válido calcula cuánto descuenta.
// Se puede llamar en cada tecla que el cliente escribe, sin costo de red.
export function calculateDiscount(discount, orderTotal) {
  if (!discount.active) {
    return { eligible: false, reason: 'inactive', amount: 0 }; // el cupón está desactivado
  }
  if (discount.expires && new Date(discount.expires) < new Date()) {
    return { eligible: false, reason: 'expired', amount: 0 }; // el cupón venció
  }
  if (discount.maxUses && discount.uses >= discount.maxUses) {
    return { eligible: false, reason: 'max_uses', amount: 0 }; // ya se usó el máximo de veces permitido
  }
  if (orderTotal < (discount.minOrder ?? 0)) {
    return { eligible: false, reason: 'min_order', amount: 0 }; // la compra no llega al mínimo requerido
  }

  // Calcula el monto del descuento según el tipo (porcentaje o monto fijo).
  const rawAmount = discount.type === 'porcentaje'
    ? orderTotal * (discount.value / 100)
    : discount.value;

  // El descuento nunca puede ser mayor al total de la compra.
  return { eligible: true, reason: null, amount: Math.min(rawAmount, orderTotal) };
}
