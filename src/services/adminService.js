const INIT_CATEGORIES = [
  { id: 1, name: 'Laptops', parent: 'Computadoras', count: 3, visible: true },
  { id: 2, name: 'Smartphones', parent: '', count: 2, visible: true },
  { id: 3, name: 'Audio', parent: '', count: 2, visible: true },
  { id: 4, name: 'Gaming', parent: '', count: 2, visible: true },
  { id: 5, name: 'Tablets', parent: '', count: 1, visible: true },
  { id: 6, name: 'Monitores', parent: '', count: 1, visible: true },
  { id: 7, name: 'Accesorios', parent: '', count: 1, visible: true },
];

const INIT_DISCOUNTS = [
  { id: 1, code: 'BIENVENIDO10', type: 'percent', value: 10, minOrder: 0, uses: 45, maxUses: 100, active: true, expires: '2026-12-31' },
  { id: 2, code: 'TECH50', type: 'fixed', value: 50, minOrder: 500, uses: 12, maxUses: 50, active: true, expires: '2026-10-31' },
  { id: 3, code: 'GAMING20', type: 'percent', value: 20, minOrder: 200, uses: 50, maxUses: 50, active: false, expires: '2026-09-01' },
];

const INIT_PAGE = {
  storeName: 'TechMarket', tagline: 'Tu tienda de tecnología de confianza',
  email: 'hola@techmarket.com', phone: '+54 11 4567-8900',
  address: 'Av. Tecnología 1234, Piso 3', hours: 'Lun–Vie 9:00–18:00 · Sáb 10:00–14:00',
  whatsapp: '1234567890', facebook: 'techmarket', instagram: 'techmarket.ar',
};

const MONTHLY_SALES = [
  { mes: 'Abr', ventas: 38400, ordenes: 52 },
  { mes: 'May', ventas: 51200, ordenes: 68 },
  { mes: 'Jun', ventas: 44800, ordenes: 59 },
  { mes: 'Jul', ventas: 67300, ordenes: 84 },
  { mes: 'Ago', ventas: 59100, ordenes: 76 },
  { mes: 'Sep', ventas: 72400, ordenes: 91 },
];

const RECENT_ORDERS = [
  { id: '#ORD-1091', customer: 'Lucía Fernández', product: 'MacBook Air M3 15"', amount: 1499, status: 'completado', date: 'Hoy 14:32' },
  { id: '#ORD-1090', customer: 'Martín Gómez', product: 'iPhone 16 Pro Max', amount: 1299, status: 'enviado', date: 'Hoy 11:05' },
  { id: '#ORD-1089', customer: 'Valentina López', product: 'Sony WH-1000XM5', amount: 349, status: 'procesando', date: 'Ayer 18:47' },
  { id: '#ORD-1088', customer: 'Diego Ramírez', product: 'PS5 Slim + Controller', amount: 449, status: 'completado', date: 'Ayer 09:13' },
  { id: '#ORD-1087', customer: 'Sofía Herrera', product: 'ASUS ROG Strix G16', amount: 1849, status: 'cancelado', date: '14 Sep' },
  { id: '#ORD-1086', customer: 'Tomás Acosta', product: 'LG 27" 4K Monitor', amount: 599, status: 'enviado', date: '14 Sep' },
];

export function getCategories() {
  return INIT_CATEGORIES;
}

export function getDiscounts() {
  return INIT_DISCOUNTS;
}

export function getPageInfo() {
  return INIT_PAGE;
}

export function getMonthlySales() {
  return MONTHLY_SALES;
}

export function getRecentOrders() {
  return RECENT_ORDERS;
}
