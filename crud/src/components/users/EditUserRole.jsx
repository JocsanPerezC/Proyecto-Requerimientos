
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ProjectRoleContext } from '../Projects/ProjectRoleContext';
import WithProjectRole from '../Projects/WithProjectRole';

function EditUserRole() {
  const { id, userId } = useParams();
  const [rol, setRol] = useState('Lider de Proyecto');
  const { rol: miRol, refetchRol } = useContext(ProjectRoleContext);
  const currentUserId = parseInt(localStorage.getItem('userid'));
  const navigate = useNavigate();
  console.log(userId, 'userid', id, 'id');
  const [message, setMessage] = useState('');

  // Verificar permisos al cargar la página
  useEffect(() => {
    if (miRol !== 'Administrador de Proyecto' && miRol !== 'Lider de Proyecto') {
        navigate(`/project/${id}`);
    }
  }, [miRol, navigate, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:3001/api/project/${id}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('username')}`
        },
        body: JSON.stringify({ rol })
    });

    const data = await res.json();

    if (!res.ok) {
        setMessage('Error: ' + data.message);
    } else {
        setMessage('Rol actualizado');

        // Si el usuario editado es el mismo que está logueado...
        console.log('userid', userId, 'currentUserId', currentUserId);
        if (parseInt(userId) === currentUserId) {
            console.log('dentro', userId);
            await refetchRol(); // recarga el rol actualizado

            // Si ya no tiene permisos, redirigirlo
            const updatedRole = await getUpdatedRole(); // 
            console.log('updatedRole', updatedRole);
            if (updatedRole !== 'Administrador de Proyecto' && updatedRole !== 'Lider de Proyecto') {
                alert("Tu rol ha cambiado. Ya no tienes permisos para editar usuarios.");
                return navigate(`/project/${id}`);
            }
        }

        setTimeout(() => navigate(`/project/${id}/users/${userId}`), 1000);
    }
    };
    
    const getUpdatedRole = async () => {
    const res = await fetch(`http://localhost:3001/api/project/${id}`, {
        headers: {
        Authorization: `Bearer ${localStorage.getItem('username')}`
        }
    });
    const data = await res.json();
    return data.rol;
    };

  return (
    <WithProjectRole> 
    <div className="container-login">
      <h2>Editar Rol del Usuario</h2>
      <form onSubmit={handleSubmit}>
        <select value={rol} onChange={e => setRol(e.target.value)}>
          <option value="Lider de Proyecto">Lider de Proyecto</option>
          <option value="Programador">Programador</option>
          <option value="QA">QA</option>
          <option value="Diseñador">Diseñador</option>
          <option value="Administrador de Proyecto">Administrador de Proyecto</option>
          <option value="Stakeholder">Stakeholder</option>
          <option value="Usuario">Usuario</option>
          <option value="Gerente">Gerente</option>
        </select>
        <button className="buttoncenter"type="submit">Guardar</button>
        <button type="button" onClick={() => navigate(`/project/${id}/users/${userId}`)}>Cancelar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
    </WithProjectRole>
  );
}

export default EditUserRole;
