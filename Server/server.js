const express = require("express");
const cors = require("cors");
const { sql, poolPromise } = require('./db');
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json()); 

const isAdminOfProject = async (userId, projectId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('userid', sql.Int, userId)
    .input('projectid', sql.Int, projectId)
    .query(`
      SELECT * FROM RolesProyecto 
      WHERE userid = @userid AND projectid = @projectid AND ( rol = 'Administrador de Proyecto' OR rol = 'Lider de Proyecto')
    `);
  return result.recordset.length > 0;
};

// Middleware para validar autenticación básica
const authenticateUser = async (req, res, next) => {
  const username = req.headers.authorization?.split('Bearer ')[1];
  
  if (!username) {
    return res.status(401).json({ success: false, message: 'No autorizado: Usuario no autenticado' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Adjuntar la información del usuario al objeto request
    req.user = result.recordset[0];
    next();
  } catch (err) {
    console.error('Error de autenticación:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

app.post("/api/recover", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE LOWER(username) = LOWER(@username) AND LOWER(email) = LOWER(@email)');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado con ese username y email' });
    }

    const user = result.recordset[0];

    if (user.password !== password) {
      return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });
    }

    if (user.active === 1) {
      return res.status(200).json({ success: true, message: 'La cuenta ya estaba activa' });
    }

    // Reactivar la cuenta
    await pool.request()
      .input('id', sql.Int, user.id)
      .query('UPDATE Users SET Active = 1 WHERE id = @id');

    res.json({ success: true, message: 'Cuenta reactivada correctamente' });
  } catch (err) {
    console.error("Error al recuperar cuenta:", err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// Registrar usuario
app.post("/api/register", async (req, res) => {
  const { email, password, emergencycontact, username, name, lastname, birthday} = req.body;

  try {
    const pool = await poolPromise;

    // VALIDACIÓN: Edad mínima 15 años
    const fechaNac = new Date(birthday);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
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
  console.log("estoy dentro de login");
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

      if (user.Active == 0) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
      }

      if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
      }
      
      console.log('Inicio de sesión exitoso:', username);
      res.json({ 
        success: true, 
        message: 'Inicio de sesión exitoso',
        username: user.username
      });
  
    } catch (err) {
      console.error('Error en login:', err);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Obtener todos los proyectos del usuario
app.get("/api/projects", authenticateUser, async (req, res) => {
  console.log("estoy dentro de projects");
  try {
    const userId = req.user.id;
    const pool = await poolPromise;
    
    // Obtenemos proyectos donde el usuario es miembro
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT p.* FROM Projects p
        INNER JOIN RolesProyecto pm ON p.id = pm.projectid
        WHERE pm.userid = @userId
        ORDER BY p.date DESC
      `);
    
    res.json({ success: true, projects: result.recordset });
  } catch (err) {
    console.error('Error al obtener proyectos:', err);
    res.status(500).json({ success: false, message: 'Error al cargar los proyectos' });
  }
});

// Crear un nuevo proyecto
app.post("/api/create-project", authenticateUser, async (req, res) => {
  try {
    const { name, description, date} = req.body;
    const userId = req.user.id;
    
    console.log("Datos recibidos:", { name, description, date});
    console.log("Usuario:", userId);

    // Validación básica
    if (!name || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y fecha de inicio son obligatorios' 
      });
    }
    
    const pool = await poolPromise;
    
    // Comenzamos una transacción
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      // 1. Insertar el proyecto
      const projectResult = await transaction.request()
        .input('name', sql.VarChar, name)
        .input('description', sql.VarChar, description || '')
        .input('date', sql.Date, date)
        .input('creator', sql.Int, userId)
        .query(`
          INSERT INTO Projects (name, description, date, creator)
          OUTPUT INSERTED.id
          VALUES (@name, @description, @date, @creator)
        `);
      
      const projectId = projectResult.recordset[0].id;
      
      // 2. Agregar al creador como miembro del proyecto (con rol de administrador de proyecto)
      await transaction.request()
        .input('projectid', sql.Int, projectId)
        .input('userid', sql.Int, userId)
        .input('rol', sql.VarChar, 'Administrador de Proyecto')
        .query(`
          INSERT INTO RolesProyecto (projectid, userid, rol)
          VALUES (@projectid, @userid, @rol)
        `);
      
      // Confirmar transacción
      await transaction.commit();
      
      res.json({ 
        success: true, 
        message: 'Proyecto creado exitosamente',
        projectId: projectId
      });
    } catch (err) {
      // Rollback en caso de error
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error al crear proyecto:', err);
    res.status(500).json({ success: false, message: 'Error al crear el proyecto' });
  }
});

app.get("/api/project/:id", authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.id;

    const pool = await poolPromise;

    const projectResult = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query('SELECT * FROM Projects WHERE id = @projectId');

    if (projectResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    // Obtener rol del usuario en este proyecto
    const roleResult = await pool.request()
      .input('userid', sql.Int, userId)
      .input('projectid', sql.Int, projectId)
      .query(`
        SELECT rol FROM RolesProyecto WHERE userid = @userid AND projectid = @projectid
      `);

    const rol = roleResult.recordset.length > 0 ? roleResult.recordset[0].rol : null;

    res.json({ success: true, project: projectResult.recordset[0], rol });
  } catch (err) {
    console.error("Error al obtener proyecto:", err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.post("/api/project/:id/add-user", authenticateUser, async (req, res) => {
  try {
    const projectid = parseInt(req.params.id);
    const userid = req.user.id;
    const { username, rol } = req.body;

    if (!await isAdminOfProject(userid, projectid)) {
      return res.status(403).json({ success: false, message: 'Solo los administradores pueden agregar usuarios' });
    }

    if (!username || !rol) {
      return res.status(400).json({ success: false, message: 'Se requiere nombre de usuario y rol' });
    }

    const pool = await poolPromise;

    // 1. Verificar si el usuario existe
    const userResult = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT id FROM Users WHERE username = @username');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const userId = userResult.recordset[0].id;

    // 2. Verificar si ya es miembro
    const existing = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectid', sql.Int, projectid)
      .query(`
        SELECT * FROM RolesProyecto 
        WHERE userid = @userid AND projectid = @projectid
      `);

    if (existing.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'El usuario ya está en el proyecto' });
    }

    // 3. Insertar en ProjectMembers
    await pool.request()
      .input('projectid', sql.Int, projectid)
      .input('userId', sql.Int, userId)
      .input('rol', sql.VarChar, rol)
      .query(`
        INSERT INTO RolesProyecto (projectid, userid, rol)
        VALUES (@projectid, @userid, @rol)
      `);

    res.json({ success: true, message: 'Usuario agregado correctamente al proyecto' });

  } catch (err) {
    console.error("Error al agregar usuario al proyecto:", err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.delete("/api/user", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const pool = await poolPromise;
    await pool.request()
      .input('userId', sql.Int, userId)
      .query('UPDATE Users SET active = 0 WHERE id = @userId');

    res.json({ success: true, message: 'Cuenta desactivada' });
  } catch (err) {
    console.error("Error al desactivar usuario:", err);
    res.status(500).json({ success: false, message: 'Error al desactivar cuenta' });
  }
});

app.get("/api/user", authenticateUser, async (req, res) => {
  try {
    const { name, lastname, email, emergencycontact } = req.user;
    res.json({ name, lastname, email, emergencycontact });
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar el perfil' });
  }
});

app.put("/api/user/edit", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, emergencycontact, password } = req.body;

    // Validación básica
    if (!username || !email || !emergencycontact) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Email inválido' });
    }

    // Validación de formato de emergencycontact
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(emergencycontact)) {
      return res.status(400).json({ success: false, message: 'El contacto de emergencia debe ser un número válido de 8 dígitos' });
    }

    // Validación de contraseña segura
    if (password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial.' });
      }
    }

    const pool = await poolPromise;

    // Verificar si el username está en uso por otro usuario
    const usernameResult = await pool.request()
      .input('username', sql.VarChar, username)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT id FROM Users 
        WHERE LOWER(username) = LOWER(@username) AND id <> @userId
      `);

    if (usernameResult.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'El nombre de usuario ya está en uso por otro usuario.' });
    }

    // Verificar si el email está en uso por otro usuario
    const emailResult = await pool.request()
      .input('email', sql.VarChar, email)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT id FROM Users 
        WHERE LOWER(email) = LOWER(@email) AND id <> @userId
      `);

    if (emailResult.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'El email ya está asociado a otro usuario.' });
    }

    await pool.request()
      .input('id', sql.Int, userId)
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('emergencycontact', sql.VarChar, emergencycontact)
      .input('password', sql.VarChar, password || req.user.password)
      .query(`
        UPDATE Users 
        SET username = @username, email = @email, emergencycontact = @emergencycontact, password = @password
        WHERE id = @id
      `);

    res.json({ success: true, message: 'Perfil actualizado' });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
  }
});


const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`));