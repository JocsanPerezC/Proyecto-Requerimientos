import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../Services/Api';
import '../style.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Maneja cambios en todos los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const { username, password } = formData;
      const result = await apiService.login(username, password);
      
      if (result.success) {
        // Redireccionar al usuario al dashboard o página principal
        navigate('/createproject');
      } else {
        // Mostrar mensaje de error
        setMessage(result.data?.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      setMessage('Error del servidor');
      console.error('Error de login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="titulo">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <br /><br />
        
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <br /><br />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
      
      {message && <p style={{ color: 'red' }}>{message}</p>}
      
      <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  );
}

export default Login;