import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('username');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3001/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUser({ ...data, username: token });
      } catch (err) {
        console.error('Error al cargar perfil:', err.message);
      }
    };
    fetchProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
