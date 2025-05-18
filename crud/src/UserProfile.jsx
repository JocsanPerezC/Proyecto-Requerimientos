import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserProfile() {
  const [user, setUser] = useState({ name: '', lastname: '', email: '', emergencycontact: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) return;

    // Cargar datos actuales (puedes tener un endpoint /api/user si lo prefieres)
    // Simulación temporal
    setUser({ name: '', lastname: '', email: '', emergencycontact: '' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        },
        body: JSON.stringify(user)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setMessage("Datos actualizados");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar tu cuenta?")) return;
    try {
      const response = await fetch('http://localhost:3001/api/user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.removeItem('username');
      navigate('/login');
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="user-profile">
      <h3>Perfil de Usuario</h3>
      <div className="actions">
        <button onClick={handleUpdate}>Editar Usuario</button>
        <button onClick={handleDelete}>Eliminar Cuenta</button>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
    </div>
  );
}

export default UserProfile;
