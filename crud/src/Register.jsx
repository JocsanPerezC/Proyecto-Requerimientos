// src/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css'

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [emergencycontact, setEmergencyContact] = useState('');
  const [birthday, setBirthday] = useState('');
  const [msg, setMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, emergencycontact, username, name, lastname, birthday }),
      });

      const data = await response.json();
      if (response.ok) {
        setMsg('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
      } else {
        setMsg(data.message || 'Error al registrarse');
      }
    } catch (error) {
      setMsg('Error del servidor');
    }
  };

  return (
    <div className= 'titulo'>
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /><br /><br />
        <input
          type="text"
          placeholder="Apellido"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        /><br /><br />
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br /><br />
        <input
          type="text"
          placeholder="Contacto de emergencia"
          value={emergencycontact}
          onChange={(e) => setEmergencyContact(e.target.value)}
          required
        /><br /><br />
        <input
          type="date"
          placeholder="Fecha de nacimiento"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Registrarse</button>
      </form>
      <p style={{ color: 'green' }}>{msg}</p>
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}

export default Register;
