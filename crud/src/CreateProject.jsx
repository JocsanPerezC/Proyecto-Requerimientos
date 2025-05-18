import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

function CreateProject() {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    date: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones básicas
      if (!projectData.name.trim()) {
        throw new Error('El nombre del proyecto es obligatorio');
      }

      if (!projectData.date) {
        throw new Error('La fecha de inicio es obligatoria');
      }

      // Agregar logs para depuración
      console.log("Enviando datos al servidor:", {
        body: JSON.stringify(projectData),
        username: localStorage.getItem('username')
      });

      const response = await fetch('http://localhost:3001/api/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        },
        body: JSON.stringify(projectData)
      });

      // Agregar más información para depuración
      console.log("Respuesta status:", response.status);
      
      // Si la respuesta no es ok, intentamos obtener más información
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          // Es JSON, lo procesamos normalmente
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear el proyecto');
        } else {
          // No es JSON, obtenemos el texto para depuración
          const textError = await response.text();
          console.error("Error no JSON:", textError);
          throw new Error(`Error del servidor (${response.status}): Por favor revisa la consola para más detalles`);
        }
      }

      const data = await response.json();
      console.log("Respuesta exitosa:", data);

      // Proyecto creado exitosamente
      alert('Proyecto creado con éxito');
      navigate('/dashboard'); // Redirigir al dashboard
    } catch (err) {
      console.error("Error en la creación del proyecto:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="titulo">Crear Nuevo Proyecto</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label htmlFor="name">Nombre del Proyecto *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={projectData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={projectData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Fecha de Inicio *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={projectData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Proyecto'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="cancel-btn">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProject;