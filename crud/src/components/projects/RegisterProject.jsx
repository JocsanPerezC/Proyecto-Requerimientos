// src/Register.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/style.css';

function Register() {
  const { id } = useParams(); // ID del proyecto
    console.log(id);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [emergencycontact, setEmergencyContact] = useState('');
  const [birthday, setBirthday] = useState('');
  const [rol, setRol] = useState('Usuario');
  const [msg, setMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/register-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, emergencycontact, username, name, lastname, birthday, rol }),
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
    <div classname= 'titulo'>
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
        <div className="form-group">
          <label>Rol</label>
          <select value={rol} onChange={e => setRol(e.target.value)}>
            <option value="Administrador">Administrador</option>
            <option value="Programador">Programador</option>
            <option value="QA">QA</option>
            <option value="Diseñador">Diseñador</option>
            <option value="Administrador de Proyecto">Administrador de Proyecto</option>
            <option value="Stakeholder">Stakeholder</option>
            <option value="Usuario">Usuario</option>
            <option value="Gerente">Gerente</option>
          </select>
        </div>
        <button type="submit">Registrarse</button>
        <button onClick={() => navigate(`/project/${id}/add-user`)}>Volver</button>
      </form>
      <p style={{ color: 'green' }}>{msg}</p>
    </div>
  );
}

export default Register;