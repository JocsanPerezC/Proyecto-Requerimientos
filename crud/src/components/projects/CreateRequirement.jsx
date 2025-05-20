import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/style.css';

function CreateRequirement() {
  const { id } = useParams(); // ID del proyecto desde la URL
  const [requirementData, setRequirementData] = useState({
    code: '',
    description: '',
    type: '',
    status: '',
    date: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequirementData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validación básica
      if (!requirementData.code.trim() || !requirementData.description.trim()) {
        throw new Error('Los campos Código y Descripción son obligatorios');
      }

      const payload = {
        ...requirementData,
        projectid: parseInt(id),
        date: requirementData.date || new Date().toISOString(), // Fecha actual si no se especifica
      };

      const response = await fetch('http://localhost:3001/api/create-requirement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('username')}` // Ajusta si usas token real
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear el requerimiento');
        } else {
          const textError = await response.text();
          throw new Error(`Error del servidor (${response.status}): ${textError}`);
        }
      }

      alert('Requerimiento creado con éxito');
      navigate(`/project/${id}`); // Regresar al detalle del proyecto
    } catch (err) {
      console.error("Error al crear requerimiento:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-login">
      <h2 className="titulo">Crear Requerimiento</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label htmlFor="code">Código</label>
          <input
            type="text"
            id="code"
            name="code"
            value={requirementData.code}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={requirementData.description}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Tipo</label>
          <select
            type="text"
            id="type"
            name="type"
            value={requirementData.type}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar estado</option>
            <option value="Funcional">Funcional</option>
            <option value="No Funcional">No Funcional</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Estado</label>
          <select
            type="text"
            name="status"
            value={requirementData.status}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar estado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Completada">Completada</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Fecha (opcional)</label>
          <input
            type="date"
            id="date"
            name="date"
            value={requirementData.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button className="buttoncenter" type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Requerimiento'}
          </button>
          <button type="button" onClick={() => navigate(`/project/${id}`)} className="cancel-btn">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRequirement;
