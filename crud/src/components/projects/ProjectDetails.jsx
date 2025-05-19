import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../layout/Topbar';
import '../../styles/style.css';

function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [rolUsuario, setRolUsuario] = useState('');

  useEffect(() => {
  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/project/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        }
      });

      const data = await response.json();
      setProject(data.project);
      setRolUsuario(data.rol); // el backend debe enviarlo
    } catch (err) {
      setError(err.message);
    }
  };

  fetchProject();
}, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Cargando...</div>;

  return (
    <>
    <Topbar />
        <div className="container">
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <p><strong>Fecha de inicio:</strong> {new Date(project.date).toLocaleDateString()}</p>
        <div className = "buttongroup">
        {(rolUsuario === 'Administrador de Proyecto' || rolUsuario === 'Lider de Proyecto') && (
            <>
                <button className = "button" onClick={() => navigate(`/project/${id}/add-user`)}>Agregar Usuario</button>
                <button className = "button" onClick={() => navigate(`/project/${id}/users`)}>Ver Usuarios</button>
                <button className = "button" onClick={() => navigate(`/project/${id}/add-requirement`)}>Agregar Requerimiento</button>
                <button className = "button" onClick={() => navigate(`/project/${id}/add-task`)}>Agregar Actividad</button>
              
            </>
            )}
            <button  onClick={() => navigate('/dashboard')}>Volver</button>
            </div>
        </div>
    </>
  );
}

export default ProjectDetails;