import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AccountRecovery() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setMessage('Cuenta recuperada exitosamente. Ya puedes iniciar sesión.');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Recuperar Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Nombre de usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Correo electrónico"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder="Contraseña"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Recuperar Cuenta</button>
      </form>
      <p>¿No necesitas recuperar la cuenta? <Link to="/login">Inicia sesión</Link></p>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AccountRecovery;
