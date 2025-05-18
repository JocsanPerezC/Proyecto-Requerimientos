import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProjectUsers() {
  const { id } = useParams(); // projectId
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const currentUserId = parseInt(localStorage.getItem('userid'));

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`http://localhost:3001/api/project/${id}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('username')}`
        }
      });
      const data = await res.json();
      setUsers(data.users);
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
    <div className="container">
      <h2>Usuarios del Proyecto</h2>
      {users.map(user => (
        <div key={user.id} className="user-box">
          <p><strong>{user.username}</strong> - Rol: {user.rol}</p>
          <button onClick={() => navigate(`/project/${id}/users/${user.id}`)}>Ver Perfil</button>
            {user.id !== currentUserId && (
                <>
                    <button onClick={() => navigate(`/project/${id}/users/${user.id}/edit`)}>
                    Editar Rol
                    </button>
                    <button
                    style={{ backgroundColor: '#dc3545', color: 'white', marginLeft: '10px' }}
                    onClick={() => handleRemoveUser(user.id)}
                    >
                    Eliminar
                    </button>
                </>
                )}
        </div>
      ))}
      <button onClick={() => navigate(`/project/${id}`)}>Volver</button>
    </div>
  );
}

export default ProjectUsers;
