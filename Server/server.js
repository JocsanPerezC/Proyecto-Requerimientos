const express = require("express");
const cors = require("cors");
const { sql, poolPromise } = require('./db');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(bodyParser.json()); 


// Registrar usuario
app.post("/api/register", async (req, res) => {
  const { email, password, emergencycontact, username, name, lastname, birthday} = req.body;
  const hashedPass = await bcrypt.hash(password, 10);

  // Verificar si el usuario ya existe
  try {
    const pool = await poolPromise;
    await pool.request()
     .input('username', sql.VarChar, username)
     .input('password', sql.VarChar, password)
     .input('email', sql.VarChar, email)
     .input('emergencycontact', sql.VarChar, emergencycontact)
     .input('name', sql.VarChar, name)
     .input('lastname', sql.VarChar, lastname)
     .input('birthday', sql.Date, birthday)
     .query('INSERT INTO Users (name, lastname, birthday, emergencycontact, username, email, password) VALUES (@name, @lastname, @birthday, @emergencycontact, @username, @email, @password)');
    console.log("Usuario registrado exitosamente:", username);
    res.json({ message: "Usuario registrado exitosamente" });
    } 
    catch (err) {
        console.error("Error al registrar el usuario:", err.message);
        res.status(500).json({ message: "Error al registrar", error: err.message });
    }
});

// Login usuario
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .input('password', sql.VarChar, password)
        .query('SELECT * FROM Users WHERE username = @username AND password = @password');
  
      if (result.recordset.length > 0) {
        console.log('Inicio de sesión exitoso:', username);
        res.json({ success: true, message: 'Inicio de sesión exitoso' });
      } else {
        console.log('Credenciales inválidas:', username);
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }
  
    } catch (err) {
      console.error('Error en login:', err);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`));
