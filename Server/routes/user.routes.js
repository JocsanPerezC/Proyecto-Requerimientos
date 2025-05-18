const express = require("express");
const router = express.Router();
const { poolPromise, sql } = require("../db");
const bcrypt = require("bcryptjs");
const { authenticateUser } = require("../middleware/auth");

router.get("/user", authenticateUser, async (req, res) => {
  const { name, lastname, email, emergencycontact } = req.user;
  res.json({ name, lastname, email, emergencycontact });
});

router.put("/user/edit", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, emergencycontact, password } = req.body;

    if (!username || !email || !emergencycontact) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    const pool = await poolPromise;

    const usernameCheck = await pool.request()
      .input("username", sql.VarChar, username)
      .input("userId", sql.Int, userId)
      .query("SELECT id FROM Users WHERE LOWER(username) = LOWER(@username) AND id <> @userId");

    if (usernameCheck.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "El nombre de usuario ya está en uso" });
    }

    const emailCheck = await pool.request()
      .input("email", sql.VarChar, email)
      .input("userId", sql.Int, userId)
      .query("SELECT id FROM Users WHERE LOWER(email) = LOWER(@email) AND id <> @userId");

    if (emailCheck.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "El email ya está en uso" });
    }

    const finalPassword = password ? await bcrypt.hash(password, 10) : req.user.password;

    await pool.request()
      .input("id", sql.Int, userId)
      .input("username", sql.VarChar, username)
      .input("email", sql.VarChar, email)
      .input("emergencycontact", sql.VarChar, emergencycontact)
      .input("password", sql.VarChar, finalPassword)
      .query(`
        UPDATE Users
        SET username = @username, email = @email, emergencycontact = @emergencycontact, password = @password
        WHERE id = @id
      `);

    res.json({ success: true, message: "Perfil actualizado" });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.delete("/user", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await poolPromise;

    await pool.request()
      .input("userId", sql.Int, userId)
      .query("UPDATE Users SET active = 0 WHERE id = @userId");

    res.json({ success: true, message: "Cuenta desactivada" });
  } catch (err) {
    console.error("Error al desactivar cuenta:", err);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

module.exports = authenticateUser;
