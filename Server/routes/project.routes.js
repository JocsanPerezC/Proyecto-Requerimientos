const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../db'); // ajusta el path según la estructura
const { authenticateUser } = require('../middleware/auth');
const { isAdminOfProject } = require('../utils/permissions'); // asegúrate de tener esta función
const multer = require("multer");
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024}, // 2GB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png", "image/jpeg", "image/jpg",
      "video/mp4", "video/webm",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Tipo de archivo no permitido"));
  }
});

router.patch("/tasks/attachment/:id/alt", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { alt_text } = req.body;
  console.log(alt_text);
  try {
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, parseInt(id))
      .input("alt_text", sql.VarChar, alt_text)
      .query(`UPDATE TaskAttachments SET alt_text = @alt_text WHERE id = @id`);

    res.json({ success: true, message: "Texto alternativo actualizado." });
  } catch (err) {
    console.error("Error al actualizar alt text:", err);
    res.status(500).json({ success: false, message: "Error al actualizar el texto alternativo." });
  }
});


router.post("/tasks/upload", authenticateUser, upload.single("file"), async (req, res) => {
  const taskId = parseInt(req.body.taskId);
  const filePath = req.file.path;
  const altText = req.body.altText || null;

  try {
    const pool = await poolPromise;

    // Obtener la fecha límite de la tarea
    const result = await pool.request()
      .input("taskId", sql.Int, taskId)
      .query(`SELECT date FROM Tasks WHERE id = @taskId`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Tarea no encontrada" });
    }

    const { DateTime } = require('luxon');
    const now = DateTime.now().setZone('America/Costa_Rica');
    const deadline = DateTime.fromISO(taskId.date, { zone: 'America/Costa_Rica' }); // deadlineRaw = la fecha de la DB
    console.log("Fecha límite de la tarea:", deadline.toISO(), "Fecha actual:", now.toISO());

    if (deadline < now) {
      return res.status(400).json({ success: false, message: "La fecha límite para entregar esta tarea ha expirado." });
    }

    // Insertar el archivo
    await pool.request()
    .input("taskId", sql.Int, taskId)
    .input("path", sql.VarChar, filePath)
    .input("altText", sql.VarChar, altText)
    .query(`
      INSERT INTO TaskAttachments (taskid, filepath, alt_text)
      VALUES (@taskId, @path, @altText)
    `);

    res.json({ success: true, message: "Archivo subido correctamente." });
  } catch (err) {
    console.error("Error al subir archivo:", err);
    res.status(500).json({ success: false, message: "Error al subir el archivo." });
  }
});

// Obtener los attachments de una tarea específica
router.get("/task/:id/attachments", authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("taskId", sql.Int, parseInt(id))
      .query(`
        SELECT id, taskid, filepath, alt_text
        FROM TaskAttachments
        WHERE taskid = @taskId
      `);

    res.json({ success: true, attachments: result.recordset });
  } catch (err) {
    console.error("Error al obtener los attachments:", err);
    res.status(500).json({ success: false, message: "Error al obtener los archivos adjuntos." });
  }
});


router.post("/project/:id/add-user", authenticateUser, async (req, res) => {
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

    const userResult = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT id FROM Users WHERE username = @username');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const userId = userResult.recordset[0].id;

    const existing = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectid', sql.Int, projectid)
      .query(`
        SELECT * FROM RolesProyecto 
        WHERE userid = @userId AND projectid = @projectid
      `);

    if (existing.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'El usuario ya está en el proyecto' });
    }

    await pool.request()
      .input('projectid', sql.Int, projectid)
      .input('userId', sql.Int, userId)
      .input('rol', sql.VarChar, rol)
      .query(`
        INSERT INTO RolesProyecto (projectid, userid, rol)
        VALUES (@projectid, @userId, @rol)
      `);

    res.json({ success: true, message: 'Usuario agregado correctamente al proyecto' });
  } catch (err) {
    console.error("Error al agregar usuario al proyecto:", err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

router.delete("/user", authenticateUser, async (req, res) => {
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

router.get("/user", authenticateUser, async (req, res) => {
  try {
    const { name, lastname, email, emergencycontact } = req.user;
    res.json({ name, lastname, email, emergencycontact });
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar el perfil' });
  }
});

router.put("/user/edit", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, emergencycontact, password } = req.body;

    if (!username || !email || !emergencycontact) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Email inválido' });
    }

    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(emergencycontact)) {
      return res.status(400).json({ success: false, message: 'El contacto de emergencia debe ser un número válido de 8 dígitos' });
    }

    if (password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial.' });
      }
    }

    const pool = await poolPromise;

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

// Obtener todos los usuarios de un proyecto

router.get("/project/:id/users", authenticateUser, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT u.id, u.username, u.name, u.lastname, u.email, u.emergencycontact, pm.rol, pm.projectid
        FROM Users u
        JOIN RolesProyecto pm ON pm.userid = u.id
        WHERE pm.projectid = @projectId
      `);

    const rolResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT rol FROM RolesProyecto
        WHERE userid = @userId AND projectid = @projectId
      `);

    const rolActual = rolResult.recordset[0]?.rol || null;
        
     const projectResult = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
      SELECT completed FROM Projects WHERE id = @projectId
      `);

    const completed = projectResult.recordset[0]?.completed || null;

    res.json({ 
      success: true, 
      users: result.recordset, 
      rolActual,
      completed
     });
  } catch (err) {
    console.error("Error al obtener usuarios del proyecto:", err);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});

router.delete("/project/:id/users/:userId", authenticateUser, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const userIdToRemove = parseInt(req.params.userId);
  const currentUserId = req.user.id;

  try {
    const pool = await poolPromise;

    const roleResult = await pool.request()
      .input('userId', sql.Int, currentUserId)
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT rol FROM RolesProyecto 
        WHERE userid = @userId AND projectid = @projectId
      `);

    if (
      roleResult.recordset.length === 0 ||
      roleResult.recordset[0].rol !== 'Administrador de Proyecto'
    ) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    if (userIdToRemove === currentUserId) {
      return res.status(400).json({ success: false, message: 'No puedes eliminarte a ti mismo del proyecto.' });
    }

    await pool.request()
      .input('userId', sql.Int, userIdToRemove)
      .input('projectId', sql.Int, projectId)
      .query(`
        DELETE FROM RolesProyecto 
        WHERE userid = @userId AND projectid = @projectId
      `);

    res.json({ success: true, message: 'Usuario eliminado del proyecto' });
  } catch (err) {
    console.error("Error al eliminar usuario del proyecto:", err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

router.put("/project/:id/users/:userid/role", authenticateUser, async (req, res) => {
  try {
    const { userid, id } = req.params;
    const { rol } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('userid', sql.Int, userid)
      .input('projectid', sql.Int, id)
      .input('rol', sql.VarChar, rol)
      .query(`
        UPDATE RolesProyecto 
        SET rol = @rol 
        WHERE userid = @userid AND projectid = @projectid
      `);

    res.json({ success: true, message: 'Rol actualizado', userid });
  } catch (err) {
    console.error("Error al actualizar rol:", err);
    res.status(500).json({ success: false, message: 'Error al actualizar rol' });
  }
});


// Obtener todos los proyectos del usuario
router.get("/projects", authenticateUser, async (req, res) => {
  console.log("estoy dentro de projects");
  try {
    const userId = req.user.id;
    const pool = await poolPromise;
    
    // Obtenemos proyectos donde el usuario es miembro
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          p.id, p.name, p.description, p.date, p.completed,
          pm.rol, p.type
        FROM Projects p
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
router.post("/create-project", authenticateUser, async (req, res) => {
  try {
    const { name, description, date, type} = req.body;
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
        .input('type', sql.VarChar, type) 
        .query(`
          INSERT INTO Projects (name, description, date, creator, type)
          OUTPUT INSERTED.id
          VALUES (@name, @description, @date, @creator, @type)
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

router.delete("/project/:id", authenticateUser, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    // Validar que el usuario sea administrador del proyecto
    const roleResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT rol FROM RolesProyecto 
        WHERE userid = @userId AND projectid = @projectId
      `);

    if (roleResult.recordset.length === 0 || roleResult.recordset[0].rol !== 'Administrador de Proyecto') {
      return res.status(403).json({ success: false, message: 'Solo los administradores pueden eliminar proyectos' });
    }

    // 1. Obtener todos los archivos de tareas relacionados
    const filesResult = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT ta.filepath FROM TaskAttachments ta
        INNER JOIN Tasks t ON ta.taskid = t.id
        INNER JOIN Activities a ON t.activityid = a.id
        WHERE a.projectid = @projectId
      `);

    const archivos = filesResult.recordset;

    // 2. Eliminar los archivos del sistema de archivos
    archivos.forEach(file => {
      const fullPath = path.join(__dirname, '..', file.filepath);
      fs.unlink(fullPath, (err) => {
        if (err) console.error("Error al eliminar archivo:", fullPath, err);
      });
    });

    // 3. Eliminar los attachments
    await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        DELETE ta FROM TaskAttachments ta
        INNER JOIN Tasks t ON ta.taskid = t.id
        INNER JOIN Activities a ON t.activityid = a.id
        WHERE a.projectid = @projectId
      `);

    // 4. Eliminar tareas
    await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        DELETE t FROM Tasks t
        INNER JOIN Activities a ON t.activityid = a.id
        WHERE a.projectid = @projectId
      `);

    // 5. Eliminar actividades
    await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`DELETE FROM Activities WHERE projectid = @projectId`);

    // 6. Eliminar requerimientos
    await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`DELETE FROM Requerimientos WHERE projectid = @projectId`);

    // 7. Eliminar roles del proyecto
    await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`DELETE FROM RolesProyecto WHERE projectid = @projectId`);

    // 8. Finalmente, eliminar el proyecto
    await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`DELETE FROM Projects WHERE id = @projectId`);

    res.json({ success: true, message: 'Proyecto eliminado exitosamente' });

  } catch (err) {
    console.error("Error al eliminar proyecto:", err);
    res.status(500).json({ success: false, message: 'Error al eliminar el proyecto' });
  }
});

router.get("/project/:id", authenticateUser, async (req, res) => {
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
    console.log("Rol del usuario:", rol);
    res.json({ success: true, project: projectResult.recordset[0], rol });
  } catch (err) {
    console.error("Error al obtener proyecto:", err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

router.put("/project/:id", authenticateUser, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const { name, description, date } = req.body;
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    // Validar si es administrador
    const roleResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT rol FROM RolesProyecto 
        WHERE userid = @userId AND projectid = @projectId
      `);

    if (roleResult.recordset.length === 0 || roleResult.recordset[0].rol !== 'Administrador de Proyecto') {
      return res.status(403).json({ success: false, message: 'Solo los administradores pueden editar el proyecto' });
    }

    await pool.request()
      .input('projectId', sql.Int, projectId)
      .input('name', sql.VarChar, name)
      .input('description', sql.VarChar, description)
      .input('date', sql.Date, date)
      .query(`
        UPDATE Projects 
        SET name = @name, description = @description, date = @date 
        WHERE id = @projectId
      `);

    res.json({ success: true, message: 'Proyecto actualizado' });

  } catch (err) {
    console.error("Error al actualizar proyecto:", err);
    res.status(500).json({ success: false, message: 'Error al actualizar proyecto' });
  }
});

router.post("/project/:id/add-user", authenticateUser, async (req, res) => {
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


// PARA LAS ACTIVIDADES DEL PROYECTO

// Crear una actividad de un proyecto
router.post("/create-activity", authenticateUser, async (req, res) => {
  try {
    const { name, description, projectid } = req.body;
    const userId = req.user.userId; // Puede usarse para trazabilidad si lo necesitas

    if (!name || !projectid) {
      return res.status(400).json({ success: false, message: "Faltan campos obligatorios: name o projectid." });
    }

    const pool = await poolPromise;
    
    const request = pool.request();
    await request
      .input("name", sql.NVarChar, name)
      .input("description", sql.NVarChar, description || null)
      .input("projectid", sql.Int, projectid)
      .query(`
        INSERT INTO Activities (name, description, projectid)
        VALUES (@name, @description, @projectid)
      `);

    res.json({ success: true, message: "Actividad creada correctamente." });
  } catch (error) {
    console.error("Error al crear la actividad:", error.message);
    res.status(500).json({ success: false, message: "Error al crear la actividad." });
  }
});

// Obtener actividades de un proyecto (solo si el usuario tiene acceso)
router.get('/project/:id/activities', authenticateUser, async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    // Verificar que el usuario tiene rol en el proyecto
    const userHasAccess = await pool.request()
      .input('projectId', sql.Int, projectId)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 1 
        FROM RolesProyecto 
        WHERE projectid = @projectId AND userid = @userId
      `);

    if (userHasAccess.recordset.length === 0) {
      return res.status(403).json({ success: false, message: 'No tienes acceso a este proyecto' });
    }

    // Obtener actividades del proyecto
    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT id, name, description, projectid, fatherid
        FROM Activities
        WHERE projectid = @projectId
      `);

    res.json({ success: true, activities: result.recordset });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ success: false, message: 'Error al obtener actividades' });
  }
});

// Obtener una actividad por su ID
router.get("/activity/:id", authenticateUser, async (req, res) => {
  const activityId = req.params.id;
  console.log("ID de actividad:", activityId);
  try {

    const pool = await poolPromise;
    const result = await pool.request()
      .input('activityId', sql.Int, activityId)
      .query(`
        SELECT id, name, description, projectid
        FROM Activities
        WHERE id = @activityId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
    }

    const activity = result.recordset[0];
    res.json({ success: true, activity });
  } catch (err) {
    console.error("Error al obtener la actividad:", err);
    res.status(500).json({ success: false, message: 'Error al obtener la actividad' });
  }
});

// Actualizar una actividad
// Solo los administradores de proyecto pueden editar actividades
router.put("/activity/:id", authenticateUser, async (req, res) => {
  const activityId = parseInt(req.params.id);
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('activityId', sql.Int, activityId)
      .query(`SELECT projectid FROM Activities WHERE id = @activityId`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
    }

    const projectId = result.recordset[0].projectid;

    const roleResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectId', sql.Int, projectId)
      .query(`SELECT rol FROM RolesProyecto WHERE userid = @userId AND projectid = @projectId`);

    const rol = roleResult.recordset[0]?.rol;
    if (!rol || (rol !== 'Administrador de Proyecto' && rol !== 'Lider de Proyecto')) {
      return res.status(403).json({ success: false, message: 'No autorizado para editar esta actividad' });
    }

    await pool.request()
      .input('activityId', sql.Int, activityId)
      .input('name', sql.VarChar, name)
      .input('description', sql.VarChar, description)
      .query(`
        UPDATE Activities
        SET name = @name, description = @description
        WHERE id = @activityId
      `);

    res.json({ success: true, message: 'Actividad actualizada' });

  } catch (err) {
    console.error("Error al actualizar actividad:", err);
    res.status(500).json({ success: false, message: 'Error al actualizar actividad' });
  }
});


// Eliminar una actividad
router.delete('/activity/:id', authenticateUser, async (req, res) => {
  const activityId = req.params.id;

  try {
    const pool = await poolPromise;

    // 1. Eliminar tareas asociadas a la actividad
    await pool.request()
      .input('activityId', sql.Int, activityId)
      .query('DELETE FROM Tasks WHERE activityid = @activityId');

    // 2. Eliminar la actividad
    await pool.request()
      .input('activityId', sql.Int, activityId)
      .query('DELETE FROM Activities WHERE id = @activityId');

    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar actividad y sus tareas asociadas:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar la actividad' });
  }
});


// REQUERIMIENTOS

// Obtener requerimientos de un proyecto
router.get('/project/:id/requirements', authenticateUser, async (req, res) => {
  const projectId = req.params.id;  
  const userId = req.user.id;
  try {
    const pool = await poolPromise;
    // Verificar que el usuario tiene rol en el proyecto
    // Obtener requerimientos del proyecto
    const requirementsResult = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT id, code, description, type, status, projectid, creator, date
        FROM Requerimientos
        WHERE projectid = @projectId
      `);
    res.json({ success: true, requirements: requirementsResult.recordset });
  } catch (err) {
    console.error('Error al obtener requerimientos:', err);
    res.status(500).json({ success: false, message: 'Error al obtener requerimientos' });
  }
});

// Crear un requerimiento
router.post('/create-requirement', authenticateUser, async (req, res) => {
  try {
    const { code, description, type, status, projectid, date } = req.body;
    const creator = req.user.id; // ← Obtener ID del usuario autenticado

    const pool = await poolPromise;

    // Validar si ya existe un requerimiento con ese código en el mismo proyecto
    const duplicateCheck = await pool.request()
      .input('code', sql.VarChar(50), code)
      .input('projectid', sql.Int, projectid)
      .query(`
        SELECT id FROM Requerimientos 
        WHERE code = @code AND projectid = @projectid
      `);

    if (duplicateCheck.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un requerimiento con ese código en este proyecto.'
      });
    }

    // Validar fecha
    let parsedDate = null;
    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Fecha no válida' });
      }
    }

    await pool.request()
      .input('code', sql.VarChar(50), code)
      .input('description', sql.Text, description)
      .input('type', sql.VarChar(50), type)
      .input('status', sql.VarChar(50), status)
      .input('projectid', sql.Int, projectid)
      .input('creator', sql.Int, creator) // ← Guardar como entero
      .input('date', sql.DateTime, parsedDate || new Date()) // usar fecha actual si no viene
      .query(`
        INSERT INTO Requerimientos (code, description, type, status, projectid, creator, date)
        VALUES (@code, @description, @type, @status, @projectid, @creator, @date)
      `);

    res.json({ success: true, message: 'Requerimiento creado exitosamente' });
  } catch (err) {
    console.error('Error al crear requerimiento:', err);
    res.status(500).json({ success: false, message: 'Error al crear requerimiento' });
  }
});

// Obtener un requerimiento por ID
router.get("/requirement/:id", authenticateUser, async (req, res) => {
  const requirementId = parseInt(req.params.id);
  const userId = req.user.id;

  console.log("ID de requerimiento:", requirementId);

  try {
    const pool = await poolPromise;

    // Obtener el requerimiento
    const result = await pool.request()
      .input('requirementId', sql.Int, requirementId)
      .query(`
        SELECT id, code, description, projectid, type, status
        FROM Requerimientos 
        WHERE id = @requirementId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Requerimiento no encontrado' });
    }

    const requirement = result.recordset[0];

    // Verificar permisos del usuario
    const roleResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectId', sql.Int, requirement.projectid)
      .query(`
        SELECT rol FROM RolesProyecto 
        WHERE userid = @userId AND projectid = @projectId
      `);
        console.log("Rol del usuario:", roleResult.recordset[0].rol);
    const rol = roleResult.recordset[0]?.rol;
    if (!rol || (rol !== 'Administrador de Proyecto' && rol !== 'Lider de Proyecto')) {
        console.log("No autorizado");
      res.status(403).json({ success: false, message: 'No autorizado para ver este requerimiento' });
    }

    res.json({ success: true, requirement });

  } catch (err) {
    console.error("Error al obtener requerimiento:", err);
    res.status(500).json({ success: false, message: 'Error al obtener requerimiento' });
  }
});

// Editar un requerimiento
// Solo los administradores de proyecto pueden editar requerimientos
router.put("/requirement/:id", authenticateUser, async (req, res) => {
  const requirementId = parseInt(req.params.id);
  const { code, description, status, type } = req.body;
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    // Obtener el proyecto asociado al requerimiento
    const result = await pool.request()
      .input('requirementId', sql.Int, requirementId)
      .query(`SELECT projectid FROM Requerimientos WHERE id = @requirementId`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Requerimiento no encontrado' });
    }

    const projectId = result.recordset[0].projectid;

    // Verificar el rol del usuario en el proyecto
    const roleResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT rol 
        FROM RolesProyecto 
        WHERE userid = @userId AND projectid = @projectId
      `);

    const rol = roleResult.recordset[0]?.rol;
    if (!rol || (rol !== 'Administrador de Proyecto' && rol !== 'Lider de Proyecto')) {
      return res.status(403).json({ success: false, message: 'No autorizado para editar este requerimiento' });
    }

    // Verificar si ya existe otro requerimiento con el mismo código EN EL MISMO PROYECTO (y distinto id)
    const codeCheck = await pool.request()
      .input('code', sql.VarChar, code)
      .input('requirementId', sql.Int, requirementId)
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT id FROM Requerimientos 
        WHERE code = @code AND id <> @requirementId AND projectid = @projectId
      `);

    if (codeCheck.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe un requerimiento con ese código en este proyecto' });
    }

    // Actualizar el requerimiento
    await pool.request()
      .input('requirementId', sql.Int, requirementId)
      .input('code', sql.VarChar, code)
      .input('description', sql.VarChar, description)
      .input('status', sql.VarChar, status)
      .input('type', sql.VarChar, type)
      .query(`
        UPDATE Requerimientos
        SET 
          code = @code, 
          description = @description, 
          status = @status, 
          type = @type
        WHERE id = @requirementId
      `);

    res.json({ success: true, message: 'Requerimiento actualizado' });

  } catch (err) {
    console.error("Error al actualizar requerimiento:", err);
    res.status(500).json({ success: false, message: 'Error al actualizar requerimiento' });
  }
});

// Eliminar un requerimiento
router.delete('/requirement/:id', authenticateUser, async (req, res) => {
  const requirementId = req.params.id;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('requirementId', sql.Int, requirementId)
      .query('DELETE FROM Requerimientos WHERE id = @requirementId');  // Cambiar a Requerimientos

    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar requerimiento:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar el requerimiento' });
  }
});

// TAREAS

// Obtener tareas de una actividad
router.get('/activity/:id/tasks', authenticateUser, async (req, res) => {
  const activityId = parseInt(req.params.id);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('activityid', sql.Int, activityId)
      .query(`
        SELECT t.id, t.title, t.description, t.date, t.status, t.assigned, u.username AS assignedUsername
        FROM Tasks t
        LEFT JOIN Users u ON t.assigned = u.id
        WHERE t.activityid = @activityid
      `);

    res.json({ success: true, tasks: result.recordset });
  } catch (err) {
    console.error("Error al obtener tareas:", err);
    res.status(500).json({ success: false, message: 'Error al obtener tareas' });
  }
});

//Crear una tarea
router.post("/create-task", authenticateUser, async (req, res) => {
  try {
    const { name, description, date, status, assigned, activityid } = req.body;
    const userId = req.user.userId;

    if (!name || !activityid) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios: name o activityid."
      });
    }

    const pool = await poolPromise;
    const request = pool.request();

    await request
      .input("title", sql.NVarChar, name) // map 'name' to 'title' in DB
      .input("description", sql.NVarChar, description || null)
      .input("date", sql.Date, date || null)
      .input("status", sql.NVarChar, status || 'Pendiente')
      .input("assigned", sql.Int, assigned ? parseInt(assigned) : null)
      .input("activityid", sql.Int, parseInt(activityid))
      .query(`
        INSERT INTO Tasks (title, description, date, status, assigned, activityid)
        VALUES (@title, @description, @date, @status, @assigned, @activityid)
      `);

    res.json({ success: true, message: "Tarea creada correctamente." });
  } catch (error) {
    console.error("Error al crear la tarea:", error.message);
    res.status(500).json({ success: false, message: "Error al crear la tarea." });
  }
});

// Obtener una tarea por ID
router.get("/task/:id", authenticateUser, async (req, res) => {
  const taskId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('taskId', sql.Int, taskId)
      .query(`
        SELECT T.*, A.projectid 
        FROM Tasks T
        INNER JOIN Activities A ON T.activityid = A.id
        WHERE T.id = @taskId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    const task = result.recordset[0];
    const projectId = task.projectid;

    const roleResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT rol 
        FROM RolesProyecto 
        WHERE userid = @userId AND projectid = @projectId
      `);

    const role = roleResult.recordset.length > 0 ? roleResult.recordset[0].rol : null;

    res.json({ success: true, task, role });

  } catch (err) {
    console.error("Error al obtener tarea:", err);
    res.status(500).json({ success: false, message: 'Error al obtener tarea' });
  }
});


// Editar una tarea
router.put("/task/:id", authenticateUser, async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, date, status, assigned } = req.body;
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    // Obtener la actividad y el proyecto asociados a la tarea
    const result = await pool.request()
      .input('taskId', sql.Int, taskId)
      .query(`
        SELECT A.projectid
        FROM Tasks T
        INNER JOIN Activities A ON T.activityid = A.id
        WHERE T.id = @taskId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    const projectId = result.recordset[0].projectid;

    // Verificar rol del usuario
    const roleResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT rol FROM RolesProyecto 
        WHERE userid = @userId AND projectid = @projectId
      `);

    const rol = roleResult.recordset[0]?.rol;
    if (!rol || (rol !== 'Administrador de Proyecto' && rol !== 'Lider de Proyecto')) {
      return res.status(403).json({ success: false, message: 'No autorizado para editar esta tarea' });
    }

    // Actualizar la tarea
    await pool.request()
      .input('taskId', sql.Int, taskId)
      .input('title', sql.VarChar, title)
      .input('description', sql.VarChar, description || '')
      .input('date', sql.Date, date || null)
      .input('status', sql.VarChar, status)
      .input('assigned', sql.Int, assigned ? parseInt(assigned) : null)
      .query(`
        UPDATE Tasks
        SET 
          title = @title,
          description = @description,
          date = @date,
          status = @status,
          assigned = @assigned
        WHERE id = @taskId
      `);

    res.json({ success: true, message: 'Tarea actualizada correctamente' });

  } catch (err) {
    console.error("Error al actualizar tarea:", err);
    res.status(500).json({ success: false, message: 'Error al actualizar tarea' });
  }
});


// Eliminar una tarea
router.delete('/task/:id', authenticateUser, async (req, res) => {
  const taskid = req.params.id;

  try {
    const pool = await poolPromise;

    // Obtener los documentos asociados a la tarea antes de eliminarlos
    const result = await pool.request()
      .input('taskid', sql.Int, taskid)
      .query('SELECT filepath FROM TaskAttachments WHERE taskid = @taskid');

    const documentos = result.recordset;

    // Eliminar los documentos de la base de datos
    await pool.request()
      .input('taskid', sql.Int, taskid)
      .query('DELETE FROM TaskAttachments WHERE taskid = @taskid');

    // Eliminar los archivos físicamente
    documentos.forEach(doc => {
      const fullPath = path.join(__dirname, '..', doc.filepath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error(`No se pudo eliminar el archivo: ${fullPath}`, err);
        }
      });
    });

    // Finalmente, eliminar la tarea
    await pool.request()
      .input('taskid', sql.Int, taskid)
      .query('DELETE FROM Tasks WHERE id = @taskid');

    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar tarea y sus archivos:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar la tarea y sus archivos' });
  }
});

router.put("/project/:id/entregar", authenticateUser, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    // Verificar si es administrador del proyecto
    const roleCheck = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT rol FROM RolesProyecto
        WHERE userid = @userId AND projectid = @projectId
      `);

    const role = roleCheck.recordset[0]?.rol;
    if (role !== 'Administrador de Proyecto') {
      return res.status(403).json({ message: 'Solo administradores pueden entregar el proyecto' });
    }

    // Actualizar la fecha de entrega al día actual
    await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        UPDATE Projects
        SET completed = GETDATE()
        WHERE id = @projectId
      `);

    res.json({ success: true, message: 'Proyecto entregado correctamente' });

  } catch (err) {
    console.error("Error entregando proyecto:", err);
    res.status(500).json({ message: 'Error al entregar el proyecto' });
  }
});

module.exports = router;
