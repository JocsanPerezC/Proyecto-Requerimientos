// src/Login.jsx
import React, { use, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './style.css'

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMsg('Login exitoso');
        // Aquí podrías redirigir o guardar algo en localStorage
        // localStorage.setItem('user', JSON.stringify(data));
        // navigate('/dashboard');
      } else {
        setMsg(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      setMsg('Error del servidor');
    }
  };

  return (
    <div className = "container">
      <h2 className ="titulo"> Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          type="User"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Entrar</button>
      </form>
      <p style={{ color: 'red' }}>{msg}</p>
      <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  );
}

export default Login;
