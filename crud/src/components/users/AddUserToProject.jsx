import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function AddUserToProject() {
  const { id } = useParams(); // ID del proyecto
  console.log(id);
  const [username, setUsername] = useState('');
  const [rol, setRol] = useState('Lider de Proyecto');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`http://localhost:3001/api/project/${id}/add-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        },
        body: JSON.stringify({ username, rol })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al agregar usuario');
      }

      setMessage('Usuario agregado correctamente');
      setUsername('');
      setRol('Usuario');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Agregar Usuario al Proyecto</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de Usuario (username)</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Rol</label>
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
        </div>
        <div className="buttongroup">
          <button type="submit">Agregar</button>
          <button type="button" onClick={() => navigate(`/project/${id}`)}>Volver</button>
        </div>
      </form>
      <p className='links'>¿Deseas registrar un usuario nuevo? <Link to="/register-project">Click aquí</Link></p>
    </div>
  );
}

export default AddUserToProject;
