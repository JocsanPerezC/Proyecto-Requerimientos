import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/style.css';

function CreateActivity() {
  const { id } = useParams(); // ID del proyecto
  const [activityData, setActivityData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!activityData.name.trim()) {
        throw new Error('El nombre de la actividad es obligatorio');
      }

      const payload = {
        ...activityData,
        projectid: parseInt(id) // Asegurarse de que sea número
      };

      const response = await fetch('http://localhost:3001/api/create-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear la actividad');
        } else {
          const textError = await response.text();
          throw new Error(`Error del servidor (${response.status}): ${textError}`);
        }
      }

      const data = await response.json();
      alert('Actividad creada con éxito');
      navigate(`/project/${id}`); // Volver al detalle del proyecto
    } catch (err) {
      console.error("Error en la creación de la actividad:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="titulo">Crear Nueva Actividad</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label htmlFor="name">Nombre de la Actividad *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={activityData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={activityData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Actividad'}
          </button>
          <button type="button" onClick={() => navigate(`/project/${id}`)} className="cancel-btn">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateActivity;
