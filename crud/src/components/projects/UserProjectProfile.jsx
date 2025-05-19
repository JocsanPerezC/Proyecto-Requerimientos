import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function UserProjectProfile() {
  const { id, userId } = useParams(); // projectId y userId
  console.log("userId", userId);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [completed, setcompleted] = useState(null);
  const [rolActual, setRolActual] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`http://localhost:3001/api/project/${id}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('username')}` }
      });
      const data = await res.json();
      const found = data.users.find(u => u.id === parseInt(userId));
      setUser(found);
      setcompleted(data.completed);
      console.log(completed);
      setRolActual(data.rolActual);
    };
    fetchUsers();
  }, [id, userId]);

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="container">
      <h2>Perfil de {user.username}</h2>
      <p><strong>Nombre:</strong> {user.name}</p>
      <p><strong>Apellido:</strong> {user.lastname}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Emergencia:</strong> {user.emergencycontact}</p>
      <p><strong>Rol:</strong> {user.rol}</p>
      {user.id !== userId && 
        (rolActual === 'Administrador de Proyecto' || rolActual === 'Lider de Proyecto') && 
        !completed && (
        <button onClick={() => navigate(`/project/${id}/users/${user.id}/edit`)}>
            Editar Rol
        </button>
      )}
      <button onClick={() => navigate(`/project/${id}/users`)}>Volver</button>
    </div>
  );
}

export default UserProjectProfile;
