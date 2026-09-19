import { apiFetch } from './api';

// Lista de secciones del panel admin que se le pueden asignar a un admin
// que NO es el principal. Dashboard y "Configuración" quedan afuera porque
// todo admin las tiene siempre; "Usuarios" también queda afuera porque
// gestionar cuentas admin es exclusivo del principal, no es algo que se
// pueda otorgar como permiso.
export const ADMIN_SECTIONS = [
  { id: 'products', label: 'Productos' },
  { id: 'orders', label: 'Pedidos' },
  { id: 'orderstatus', label: 'Estados de pedido' },
  { id: 'categories', label: 'Categorías' },
  { id: 'discounts', label: 'Descuentos' },
  { id: 'banners', label: 'Anuncios' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'pageinfo', label: 'Info de la tienda' },
];

// Solo los ids de ADMIN_SECTIONS — se usa para darle "todos los permisos" al admin principal.
const ALL_ADMIN_SECTION_IDS = ADMIN_SECTIONS.map(s => s.id);

// Calcula el hash SHA-256 de un texto (usado para las contraseñas).
// No es un algoritmo de hasheo de contraseñas "de verdad" (no tiene salt ni
// costo computacional), pero es mucho mejor que guardar la contraseña en
// texto plano, y no requiere agregar ninguna librería nueva al proyecto.
export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text); // convierte el texto a bytes
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes); // calcula el hash
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join(''); // lo pasa a texto hexadecimal
}

// Busca, dentro de una lista de registros (admins o clientes), el primero
// que esté activo y cuyo correo coincida — y compara la contraseña
// hasheándola primero (nunca en texto plano).
async function matchCredentials(records, identifierField, identifier, password) {
  const record = records.find(r => r.estado !== false && r[identifierField] === identifier);
  if (!record) return null; // no existe ninguna cuenta con ese correo
  const hash = await sha256Hex(password);
  return hash === record.contrasena ? record : null; // solo devuelve el registro si la contraseña coincide
}

// Función de login: recibe correo + contraseña y busca primero entre los
// admins y después entre los clientes. Si encuentra una cuenta admin,
// arma también su rol (isPrincipal) y sus permisos. Si no encuentra nada
// en ninguna de las dos listas, tira un error genérico (para no revelar
// si el correo existe o no).
export async function login(identifier, password) {
  // Trae ambas listas en paralelo, para no hacer dos peticiones seguidas.
  const [admins, clientes] = await Promise.all([
    apiFetch('/admin'),
    apiFetch('/cliente'),
  ]);

  const admin = await matchCredentials(admins, 'correo', identifier, password);
  if (admin) {
    const isPrincipal = admin.esPrincipal === true;
    return {
      role: 'admin',
      id: admin.id,
      name: admin.nombre,
      email: admin.correo,
      isPrincipal,
      // El admin principal siempre tiene todos los permisos, sin excepción.
      permissions: isPrincipal ? ALL_ADMIN_SECTION_IDS : (admin.permisos ?? []),
    };
  }

  const cliente = await matchCredentials(clientes, 'correo', identifier, password);
  if (cliente) return { role: 'client', id: cliente.id, name: `${cliente.nombre} ${cliente.apellido}`, email: cliente.correo };

  // Ni admin ni cliente coincidieron — credenciales inválidas.
  throw new Error('Correo o contraseña incorrectos.');
}

// Cambia la contraseña de un admin: primero verifica que la contraseña
// actual ingresada sea correcta (comparando el hash), y solo si coincide
// guarda el hash de la nueva contraseña.
export async function changeAdminPassword(id, currentPassword, newPassword) {
  const raw = await apiFetch(`/admin/${id}`); // trae el registro completo (incluye la contraseña hasheada)
  const currentHash = await sha256Hex(currentPassword);
  if (currentHash !== raw.contrasena) {
    throw new Error('La contraseña actual no es correcta.');
  }
  const newHash = await sha256Hex(newPassword);
  await apiFetch(`/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ contrasena: newHash }), // guarda solo el nuevo hash
  });
}
