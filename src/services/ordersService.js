const MOCK_ORDERS = [
  {
    id: '#ORD-1085', date: '10 Sep 2026', status: 'entregado', total: 1499,
    items: [{ name: 'MacBook Air M3 15"', brand: 'Apple', qty: 1, price: 1499, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=120&h=90&fit=crop' }],
    tracking: 'TM-8823-AR', address: 'Av. Corrientes 1234, CABA', payment: 'Visa ···4521',
  },
  {
    id: '#ORD-1071', date: '28 Ago 2026', status: 'entregado', total: 798,
    items: [
      { name: 'Sony WH-1000XM5', brand: 'Sony', qty: 1, price: 349, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=90&fit=crop' },
      { name: 'Logitech MX Master 3S', brand: 'Logitech', qty: 1, price: 99, image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=120&h=90&fit=crop' },
      { name: 'Razer BlackWidow V4', brand: 'Razer', qty: 1, price: 139, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&h=90&fit=crop' },
    ],
    tracking: 'TM-7741-AR', address: 'Av. Corrientes 1234, CABA', payment: 'Mastercard ···9032',
  },
  {
    id: '#ORD-1059', date: '14 Ago 2026', status: 'entregado', total: 1299,
    items: [{ name: 'iPhone 16 Pro Max', brand: 'Apple', qty: 1, price: 1299, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=120&h=90&fit=crop' }],
    tracking: 'TM-6902-AR', address: 'Av. Corrientes 1234, CABA', payment: '12 cuotas de $108',
  },
  {
    id: '#ORD-1044', date: '2 Ago 2026', status: 'cancelado', total: 449,
    items: [{ name: 'PS5 Slim + Controller', brand: 'Sony', qty: 1, price: 449, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=120&h=90&fit=crop' }],
    tracking: '—', address: 'Av. Corrientes 1234, CABA', payment: 'Visa ···4521',
  },
];

export function getOrders() {
  return MOCK_ORDERS;
}
