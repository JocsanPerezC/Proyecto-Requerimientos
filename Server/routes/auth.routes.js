const express = require("express");
const { sql, poolPromise } = require("../db");
const router = express.Router();

router.post("/register-project/:id", async (req, res) => {
  const projectId = parseInt(req.params.id);
  const {
    email, password, username, name, lastname,
    birthday, emergencycontact, rol
  } = req.body;

  try {

    const pool = await poolPromise;

    const fechaNac = new Date(birthday);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    if (hoy.getMonth() < fechaNac.getMonth() || 
        (hoy.getMonth() === fechaNac.getMonth() && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (edad < 15) {
      return res.status(400).json({ success: false, message: "Debes tener al menos 15 años." });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial."
      });
    }

    if (isNaN(emergencycontact)) {
      return res.status(400).json({ success: false, message: "El contacto de emergencia debe ser un número." });
    }

    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(emergencycontact)) {
      return res.status(400).json({ success: false, message: "El contacto debe tener 8 dígitos." });
    }

    const emailresult = await pool.request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");
    if (emailresult.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "El email ya está registrado." });
    }

    // Validar si ya existe el usuario por username o email
    const userCheck = await pool.request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .query(`
        SELECT * FROM Users 
        WHERE LOWER(username) = LOWER(@username) OR LOWER(email) = LOWER(@email)
      `);

    let userId;

    if (userCheck.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "El usuario ya existe." });
    } else {
      // Insertar nuevo usuario
      const insertUser = await pool.request()
        .input('username', sql.VarChar, username)
        .input('email', sql.VarChar, email)
        .input('password', sql.VarChar, password)
        .input('name', sql.VarChar, name)
        .input('lastname', sql.VarChar, lastname)
        .input('birthday', sql.Date, birthday)
        .input('emergencycontact', sql.VarChar, emergencycontact)
        .input('active', sql.Bit, 1)
        .query(`
          INSERT INTO Users (username, email, password, name, lastname, birthday, emergencycontact, active)
          OUTPUT INSERTED.id
          VALUES (@username, @email, @password, @name, @lastname, @birthday, @emergencycontact, @active)
        `);

      userId = insertUser.recordset[0].id;
    }

    // Insertar en ProjectMembers (si no está ya)
    const memberCheck = await pool.request()
      .input('userId', sql.Int, userId)
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT * FROM RolesProyecto WHERE userid = @userId AND projectid = @projectId
      `);

    if (memberCheck.recordset.length === 0) {
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('projectId', sql.Int, projectId)
        .input('rol', sql.VarChar, rol)
        .query(`
          INSERT INTO RolesProyecto (userid, projectid, rol)
          VALUES (@userId, @projectId, @rol)
        `);
    }

    res.json({ success: true, message: 'Usuario registrado y asignado al proyecto' });

  } catch (err) {
    console.error("Error en /api/register-project:", err);
    res.status(500).json({ success: false, message: 'Error del servidor al registrar usuario en proyecto' });
  }
});

// Registro
router.post("/register", async (req, res) => {
  const { email, password, emergencycontact, username, name, lastname, birthday } = req.body;

  try {
    const pool = await poolPromise;

    const fechaNac = new Date(birthday);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    if (hoy.getMonth() < fechaNac.getMonth() || 
        (hoy.getMonth() === fechaNac.getMonth() && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (edad < 15) {
      return res.status(400).json({ success: false, message: "Debes tener al menos 15 años." });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial."
      });
    }

    if (isNaN(emergencycontact)) {
      return res.status(400).json({ success: false, message: "El contacto de emergencia debe ser un número." });
    }

    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(emergencycontact)) {
      return res.status(400).json({ success: false, message: "El contacto debe tener 8 dígitos." });
    }

    const emailresult = await pool.request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");
    if (emailresult.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "El email ya está registrado." });
    }

    const result = await pool.request()
      .input("username", sql.VarChar, username.toLowerCase())
      .query("SELECT * FROM Users WHERE LOWER(username) = @username");
    if (result.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "El usuario ya existe." });
    }

    await pool.request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .input("email", sql.VarChar, email)
      .input("emergencycontact", sql.VarChar, emergencycontact)
      .input("name", sql.VarChar, name)
      .input("lastname", sql.VarChar, lastname)
      .input("birthday", sql.Date, birthday)
      .query(`INSERT INTO Users (name, lastname, birthday, emergencycontact, username, email, password) 
              VALUES (@name, @lastname, @birthday, @emergencycontact, @username, @email, @password)`);

    res.json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    console.error("Error al registrar el usuario:", err.message);
    res.status(500).json({ message: "Error al registrar", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM Users WHERE username = @username");

    if (result.recordset.length === 0 || result.recordset[0].Active == 0) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado o inactivo." });
    }

    const user = result.recordset[0];

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Contraseña incorrecta." });
    }

    res.json({ success: true, message: "Inicio de sesión exitoso", username: user.username, userid: user.id });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// Recuperar cuenta
router.post("/recover", async (req, res) => {
  const { username, email, password} = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("username", sql.VarChar, username)
      .input("email", sql.VarChar, email)
      .query(`SELECT * FROM Users WHERE LOWER(username) = LOWER(@username) AND LOWER(email) = LOWER(@email)`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado con ese username y email" });
    }

    const user = result.recordset[0];
    if (user.password !== password) {
      return res.status(400).json({ success: false, message: "Contraseña incorrecta" });
    }
    console.log("Usuario cargado:", user);
    console.log(user.Active);
    if (user.Active) {
      return res.status(400).json({ success: false, message: "La cuenta ya se encuentra activa" });
    }

    await pool.request()
      .input("id", sql.Int, user.id)
      .query("UPDATE Users SET Active = 1 WHERE id = @id");

    res.json({ success: true, message: "Cuenta reactivada correctamente" });
  } catch (err) {
    console.error("Error al recuperar cuenta:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

module.exports = router;
