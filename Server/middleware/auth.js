const { sql, poolPromise } = require('../db');

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

    req.user = result.recordset[0];
    next();
  } catch (err) {
    console.error('Error de autenticación:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = { authenticateUser };
