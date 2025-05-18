import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserProfileView() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('username')}`
          }
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Error al cargar usuario:', err);
      }
    };
    fetchUser();
  }, []);

  if (!user) return <div>Cargando perfil...</div>;

  return (
    <div className="container">
      <h2>Mi Perfil</h2>
      <p><strong>Nombre:</strong> {user.name}</p>
      <p><strong>Apellido:</strong> {user.lastname}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Contacto de emergencia:</strong> {user.emergencycontact}</p>
      <p><strong>Username:</strong> {localStorage.getItem('username')}</p>
      <button onClick={() => navigate('/profile/edit')}>Editar Perfil</button>
      <button onClick={() => navigate('/dashboard')}>Volver</button>
    </div>
  );
}

export default UserProfileView;
