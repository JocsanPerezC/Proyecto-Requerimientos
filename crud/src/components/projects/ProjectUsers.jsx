import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProjectUsers() {
  const { id } = useParams(); // projectId
  const [rolActual, setRolActual] = useState('');
  const [completed, setcompleted] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const currentUserId = parseInt(localStorage.getItem('userid'));

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`http://localhost:3001/api/project/${id}/users`, {
        headers: {
          method: 'GET',
          Authorization: `Bearer ${localStorage.getItem('username')}`
        }
      });
      const data = await res.json();
      setUsers(data.users);
      setRolActual(data.rolActual);
      setcompleted(data.completed);
    };
    fetchUsers();
  }, [id]);

const handleRemoveUser = async (userIdToRemove) => {
  if (!window.confirm('¿Estás seguro de que deseas eliminar a este usuario del proyecto?')) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3001/api/project/${id}/users/${userIdToRemove}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('username')}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert('Usuario eliminado del proyecto');

    // Eliminar del estado
    setUsers(prev => prev.filter(u => u.id !== userIdToRemove));
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

  return (
    <div className="container-users">
    <h2>Usuarios del Proyecto</h2>
    {users.map(user => (
      <div key={user.id} className="user-box">
        <div className="user-info">
          <p><strong>{user.username}</strong> - Rol: {user.rol}</p>
        </div>
        <div className="user-actions">
          <button onClick={() => navigate(`/project/${id}/users/${user.id}`)}>Ver Perfil</button>
          {(user.id !== currentUserId && (rolActual === 'Administrador de Proyecto' || rolActual === 'Lider de Proyecto')) &&
            !completed && (
              <button
                className="delete-button"
                onClick={() => handleRemoveUser(user.id)}
              >
                Eliminar
              </button>
          )}
        </div>
      </div>
      ))}
      <button className="button"onClick={() => navigate(`/project/${id}`)}>Volver</button>
    </div>
  );
}

export default ProjectUsers;
