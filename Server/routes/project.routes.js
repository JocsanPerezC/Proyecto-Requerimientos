const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../db'); // ajusta el path según la estructura
const { authenticateUser } = require('../middleware/auth');
const { isAdminOfProject } = require('../utils/permissions'); // asegúrate de tener esta función

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

router.get("/project/:id/users", authenticateUser, async (req, res) => {
  try {
    const projectid = parseInt(req.params.id);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('projectid', sql.Int, projectid)
      .query(`
        SELECT u.id, u.username, u.name, u.lastname, u.email, u.emergencycontact, pm.rol
        FROM Users u
        JOIN RolesProyecto pm ON pm.userid = u.id
        WHERE pm.projectid = @projectid
      `);
    res.json({ success: true, users: result.recordset });
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
          p.id, p.name, p.description, p.date,
          pm.rol
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

router.delete("/project/:id", authenticateUser, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    // Validar que el usuario sea administrador de este proyecto
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

    // Eliminar todas las relaciones de miembros
    await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`DELETE FROM RolesProyecto WHERE projectid = @projectId`);

    // Eliminar el proyecto
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

module.exports = router;
