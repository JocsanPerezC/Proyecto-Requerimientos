import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ProjectRoleContext = createContext();

export function ProjectRoleProvider({ projectId, children }) {
  const [rol, setRol] = useState(null);

  const fetchRole = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('username')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setRol(data.rol);
      }
    } catch (err) {
      console.error("Error al cargar rol:", err.message);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return (
    <ProjectRoleContext.Provider value={{ rol, setRol, refetchRol: fetchRole }}>
      {children}
    </ProjectRoleContext.Provider>
  );
}