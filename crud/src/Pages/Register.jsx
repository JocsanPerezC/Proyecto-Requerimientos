import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../Services/Api';
import '../style.css';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    lastname: '',
    username: '',
    emergencycontact: '',
    birthday: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error'); // 'error' o 'success'
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

  // Validación del formulario antes de enviar
  const validateForm = () => {
    // Validación de contraseña segura
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setMessage('La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial.');
      return false;
    }
    
    // Validación de contacto de emergencia
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(formData.emergencycontact)) {
      setMessage('El contacto de emergencia debe ser un número de 8 dígitos.');
      return false;
    }
    
    // Validación de edad mínima
    const fechaNac = new Date(formData.birthday);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    if (edad < 15) {
      setMessage('Debes tener al menos 15 años para registrarte.');
      return false;
    }
    
    return true;
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMessageType('error');
    
    // Validación del lado del cliente
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await apiService.register(formData);
      
      if (result.success) {
        setMessageType('success');
        setMessage('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
        
        // Opcionalmente redirigir al login después de unos segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessageType('error');
        setMessage(result.data?.message || 'Error al registrarse');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Error del servidor');
      console.error('Error de registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="titulo">Registro</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
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
        
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <br /><br />
        
        <input
          type="text"
          name="lastname"
          placeholder="Apellido"
          value={formData.lastname}
          onChange={handleChange}
          required
        />
        <br /><br />
        
        <input
          type="text"
          name="username"
          placeholder="Nombre de usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <br /><br />
        
        <input
          type="text"
          name="emergencycontact"
          placeholder="Contacto de emergencia"
          value={formData.emergencycontact}
          onChange={handleChange}
          required
        />
        <br /><br />
        
        <input
          type="date"
          name="birthday"
          placeholder="Fecha de nacimiento"
          value={formData.birthday}
          onChange={handleChange}
          required
        />
        <br /><br />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Registrarse'}
        </button>
      </form>
      
      {message && <p style={{ color: messageType === 'error' ? 'red' : 'green' }}>{message}</p>}
      
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}

export default Register;