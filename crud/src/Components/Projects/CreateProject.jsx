import React, { useState } from 'react';
import '../../style.css';

function CreateProject({ onProjectCreated }) {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    startDate: '',
    type: '',
    members: []
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Realizar conexión real con el servidor
      const response = await fetch('http://localhost:3001/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Si la respuesta es exitosa, enviamos el proyecto al componente padre
        onProjectCreated(data.project);
        
        setMessage(data.message || 'Proyecto creado exitosamente');
        setError('');
        
        // Limpiar el formulario
        setProjectData({
          name: '',
          description: '',
          startDate: '',
          type: '',
          members: []
        });
        
        // Añadir este timeout para limpiar el mensaje después de unos segundos
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        // Si hay un error en la respuesta del servidor
        setError(data.message || 'Error al crear el proyecto');
        setMessage('');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      setMessage('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container">
      <h2>Crear Nuevo Proyecto</h2>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre del Proyecto:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={projectData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descripción:</label>
          <textarea
            id="description"
            name="description"
            value={projectData.description}
            onChange={handleInputChange}
            rows="4"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="startDate">Fecha de inicio:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={projectData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Tipo de Proyecto:</label>
          <select
            id="type"
            name="type"
            value={projectData.type}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione un tipo</option>
            <option value="Desarrollo">Desarrollo</option>
            <option value="Investigación">Investigación</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn-submit" 
          disabled={isUpdating}
        >
          {isUpdating ? 'Creando...' : 'Crear Proyecto'}
        </button>
      </form>
    </div>
  );
}

export default CreateProject;