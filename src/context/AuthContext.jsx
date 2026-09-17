import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const login = (role, name, email) => {
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
  };

  const logout = () => {
    setUserRole(null);
    setUserName('');
    setUserEmail('');
  };

  return (
    <AuthContext.Provider value={{ userRole, userName, userEmail, isLoggedIn: userRole !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
