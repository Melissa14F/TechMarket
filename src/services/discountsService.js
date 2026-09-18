import { apiFetch } from './api';

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

export async function getDiscounts() {
  const raw = await apiFetch('/descuento');
  return raw.map(mapDiscount);
}

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

export async function toggleDiscount(id, active) {
  return updateDiscount(id, { active });
}

export async function deleteDiscount(id) {
  return apiFetch(`/descuento/${id}`, { method: 'DELETE' });
}

/** Read-then-write, same race caveat as productsService.incrementarVisita. */
export async function incrementUsage(id) {
  const raw = await apiFetch(`/descuento/${id}`);
  return updateDiscount(id, { uses: (raw.usos ?? 0) + 1 });
}

/**
 * Pure function: checks eligibility against an order total, then computes
 * the discount amount by type. No API calls — safe to call from the cart
 * on every keystroke of a coupon code.
 */
export function calculateDiscount(discount, orderTotal) {
  if (!discount.active) {
    return { eligible: false, reason: 'inactive', amount: 0 };
  }
  if (discount.expires && new Date(discount.expires) < new Date()) {
    return { eligible: false, reason: 'expired', amount: 0 };
  }
  if (discount.maxUses && discount.uses >= discount.maxUses) {
    return { eligible: false, reason: 'max_uses', amount: 0 };
  }
  if (orderTotal < (discount.minOrder ?? 0)) {
    return { eligible: false, reason: 'min_order', amount: 0 };
  }

  const rawAmount = discount.type === 'porcentaje'
    ? orderTotal * (discount.value / 100)
    : discount.value;

  return { eligible: true, reason: null, amount: Math.min(rawAmount, orderTotal) };
}
