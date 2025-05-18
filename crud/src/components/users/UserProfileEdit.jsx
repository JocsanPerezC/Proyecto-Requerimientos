import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../auth/UserContext';

function UserProfileEdit() {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    emergencycontact: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('http://localhost:3001/api/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('username')}` }
      });
      const data = await res.json();
      setUserData(prev => ({
        ...prev,
        username: localStorage.getItem('username'),
        email: data.email || '',
        emergencycontact: data.emergencycontact || ''
      }));
    };
    fetchUser();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      username: userData.username,
      email: userData.email,
      emergencycontact: userData.emergencycontact
    };

    if (userData.password.trim()) {
      payload.password = userData.password;
    }

    const res = await fetch('http://localhost:3001/api/user/edit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('username')}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setUser(prev => ({
    ...prev,
    username: userData.username,
    email: userData.email,
    emergencycontact: userData.emergencycontact
    }));

    localStorage.setItem('username', userData.username);
    alert("Perfil actualizado correctamente");
    setMessage('Perfil actualizado correctamente');
    return navigate(`/profile`);
  } catch (err) {
    setMessage('Error: ' + err.message);
  }
};

  return (
    <div className="container">
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" value={userData.username} onChange={handleChange} placeholder="Username" required />
        <input name="email" value={userData.email} onChange={handleChange} placeholder="Email" required />
        <input name="emergencycontact" value={userData.emergencycontact} onChange={handleChange} placeholder="Emergencia" required />
        <input name="password" type="password" value={userData.password} onChange={handleChange} placeholder="Nueva contraseña" />
        <button type="submit">Guardar</button>
        <button type="button" onClick={() => navigate('/profile')}>Cancelar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default UserProfileEdit;
