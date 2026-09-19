import { createContext, useContext, useState } from 'react';

// Contexto global de sesión — guarda quién está logueado (cliente o
// admin) para que cualquier componente de la app pueda leerlo sin tener
// que pasarlo como prop manualmente por todos lados.
const AuthContext = createContext(null);

// Componente que envuelve toda la app (ver main.jsx) y provee los datos
// de sesión a todos sus hijos.
export function AuthProvider({ children }) {
  const [userRole, setUserRole] = useState(null); // 'admin' | 'client' | null (nadie logueado)
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isPrincipal, setIsPrincipal] = useState(false); // solo aplica a admins
  const [permissions, setPermissions] = useState([]); // solo aplica a admins no principales

  /** `extra` only carries anything for an admin login (isPrincipal +
   * permissions) — a client login just omits it. */
  // Guarda los datos de la sesión al loguearse. "extra" solo trae algo
  // cuando el que inició sesión es un admin (isPrincipal + permissions).
  const login = (role, id, name, email, extra = {}) => {
    setUserRole(role);
    setUserId(id);
    setUserName(name);
    setUserEmail(email);
    setIsPrincipal(extra.isPrincipal ?? false);
    setPermissions(extra.permissions ?? []);
  };

  // Limpia todos los datos de sesión al cerrar sesión.
  const logout = () => {
    setUserRole(null);
    setUserId(null);
    setUserName('');
    setUserEmail('');
    setIsPrincipal(false);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider value={{ userRole, userId, userName, userEmail, isPrincipal, permissions, isLoggedIn: userRole !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para leer el contexto de sesión desde cualquier componente.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider'); // uso incorrecto: falta envolver con <AuthProvider>
  return ctx;
}
