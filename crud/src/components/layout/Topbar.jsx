import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/style.css';

function Topbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [showMenu, setShowMenu] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    lastname: '',
    email: '',
    emergencycontact: ''
  });

  useEffect(() => {
  const fetchData = async () => {
    const res = await fetch('http://localhost:3001/api/user', {
      headers: {
        'Authorization': `Bearer ${username}`
      }
    });
    const data = await res.json();
    setUserData(data);
     };
    fetchData();
    }, []);

  const [message, setMessage] = useState('');

  const toggleMenu = () => setShowMenu(!showMenu);

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${username}`
        },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('Datos actualizados');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar tu cuenta?")) return;
    try {
      const res = await fetch('http://localhost:3001/api/user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${username}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.removeItem('username');
      navigate('/login');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };
// Bienvenido, <strong>{username}</strong>
  return (
    <div className="topbar">
      <div className="topbar-left">
        Bienvenid@, <strong>{username}</strong>
      </div>

      <div className="topbar-right">
        <button onClick={toggleMenu} className="menu-btn">⚙️</button>
        {showMenu && (
          <div className="user-menu">
            <button onClick={() => navigate('/profile')}>Ver Perfil</button>
            <button onClick={handleDelete} className="delete-btn">Eliminar Cuenta</button>
            <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
            {message && <p className="message">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;
