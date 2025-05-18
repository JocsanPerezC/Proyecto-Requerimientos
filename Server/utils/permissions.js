const { sql, poolPromise } = require("../db");

const isAdminOfProject = async (userId, projectId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("userid", sql.Int, userId)
    .input("projectid", sql.Int, projectId)
    .query(`
      SELECT * FROM RolesProyecto 
      WHERE userid = @userid AND projectid = @projectid AND 
      (rol = 'Administrador de Proyecto' OR rol = 'Lider de Proyecto')
    `);

  return result.recordset.length > 0;
};

module.exports = { isAdminOfProject };
