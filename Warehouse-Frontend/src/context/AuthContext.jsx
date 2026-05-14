import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('warehouseToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          const jwtRole = decoded.role || '';
          
          let mappedRole = jwtRole;
          if (typeof jwtRole === 'string') {
            const upperRole = jwtRole.toUpperCase();
            if (upperRole.includes('OPERATOR')) mappedRole = 'OPERATOR';
            else if (upperRole.includes('MANAGER') || upperRole.includes('ADMIN')) mappedRole = 'MANAGER';
          }
          
          setUser({ username: decoded.sub, role: mappedRole });
        } else {
          localStorage.removeItem('warehouseToken');
        }
      } catch (error) {
        localStorage.removeItem('warehouseToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, role) => {
    localStorage.setItem('warehouseToken', token);
    const decoded = jwtDecode(token);
    setUser({ username: decoded.sub, role: role });
  };

  const logout = () => {
    localStorage.removeItem('warehouseToken');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isOperator = () => user?.role === 'OPERATOR' || user?.role === 'DELIVERY';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isOperator, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};