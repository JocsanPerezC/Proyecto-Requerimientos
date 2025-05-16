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

  try {
    const pool = await poolPromise;

    // VALIDACIÓN: Edad mínima 15 años
    const fechaNac = new Date(birthday);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (edad < 15) {
      console.log("Edad inválida:", edad);
      return res.status(400).json({ success: false, message: 'Debes tener al menos 15 años.' });
    }

    // VALIDACIÓN: Contraseña segura
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial.'
      });
    }

    //VALIDACIÓN: emergencycontact debe ser un numero
    if (isNaN(emergencycontact)) {
      return res.status(400).json({ success: false, message: 'El contacto de emergencia debe ser un número.' });
    }

    //VALIDACIÓN: Teléfono válido
    const phoneRegex = /^\d{8}$/; 
    if (!phoneRegex.test(emergencycontact)) {
      return res.status(400).json({ success: false, message: 'El contacto de emergencia debe ser un número valido.' });
    }

    //VALIDACIÓN: Email único
    const emailresult = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');
    if (emailresult.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'El email ya se encuentra asociado a un usuario.' });
    }

    // VALIDACIÓN: Usuario único sin importar mayúsculas
    const result = await pool.request()
    .input('username', sql.VarChar, username.toLowerCase())
    .query('SELECT * FROM Users WHERE LOWER(username) = @username');

    if (result.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'El nombre de usuario ya existe.' });
    }

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
        .query('SELECT * FROM Users WHERE username = @username');
      
      if (result.recordset.length === 0) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
      }
      const user = result.recordset[0];

      if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
      }
      console.log('Inicio de sesión exitoso:', username);
      res.json({ success: true, message: 'Inicio de sesión exitoso' });
  
    } catch (err) {
      console.error('Error en login:', err);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Crear un nuevo proyecto
app.post("/api/projects/create", async (req, res) => {
  const { name, description, type, startDate, members } = req.body;

  try {
    const pool = await poolPromise;
    
    // Validación: nombre del proyecto no puede estar vacío
    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'El nombre del proyecto no puede estar vacío.' 
      });
    }
    
    // Insertar el proyecto en la base de datos
    const result = await pool.request()
      .input('name', sql.VarChar, name)
      .input('description', sql.VarChar, description)
      .input('date', sql.Date, date)
      .input('type', sql.Date, type)
      .query(`
        INSERT INTO Projects (name, description, date, type, createdAt)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.date, 
               INSERTED.type, INSERTED.creator
        VALUES (@name, @description, @date, @type, GETDATE())
      `);
    
    // Obtener el proyecto recién creado
    const newProject = result.recordset[0];
    
    // Si hay miembros para asignar, insertarlos en la tabla de relación
    if (members && members.length > 0) {
      for (const memberId of members) {
        await pool.request()
          .input('projectId', sql.Int, newProject.id)
          .input('userId', sql.Int, memberId)
          .query('INSERT INTO ProjectMembers (projectId, userId) VALUES (@projectId, @userId)');
      }
    }
    
    console.log('Proyecto creado exitosamente:', newProject.name);
    res.json({ 
      success: true, 
      message: 'Proyecto creado exitosamente', 
      project: newProject 
    });
    
  } catch (err) {
    console.error('Error al crear proyecto:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear el proyecto', 
      error: err.message 
    });
  }
});

// Obtener todos los proyectos
app.get("/api/projects", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Projects ORDER BY createdAt DESC');
    
    res.json({ 
      success: true, 
      projects: result.recordset 
    });
    
  } catch (err) {
    console.error('Error al obtener proyectos:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los proyectos', 
      error: err.message 
    });
  }
});

// Obtener un proyecto específico por ID
app.get("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const pool = await poolPromise;
    
    // Obtener detalles del proyecto
    const projectResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Projects WHERE id = @id');
    
    if (projectResult.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proyecto no encontrado' 
      });
    }
    
    const project = projectResult.recordset[0];
    
    // Obtener miembros del proyecto
    const membersResult = await pool.request()
      .input('projectId', sql.Int, id)
      .query(`
        SELECT u.id, u.username, u.name, u.lastname
        FROM Users u
        JOIN ProjectMembers pm ON u.id = pm.userId
        WHERE pm.projectId = @projectId
      `);
    
    project.members = membersResult.recordset;
    
    res.json({ 
      success: true, 
      project: project 
    });
    
  } catch (err) {
    console.error('Error al obtener proyecto:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener el proyecto', 
      error: err.message 
    });
  }
});


const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`));
