const sql = require('mssql');
require('dotenv').config();

// Configuración para SQL Server
const config = {
    server: process.env.DB_SERVER, // No usar `${}` en objetos
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false, // Cambia a true si usas Azure
        trustServerCertificate: true // Corrige problemas con SSL
    },
    port: parseInt(process.env.DB_PORT) || 1433 // Valor por defecto si no está definido
};

// Crear una conexión y exportarla como una promesa
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Connected to database');
        return pool;
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
        process.exit(1); // Cerrar la app si la DB falla
    });

module.exports = {
    sql,
    poolPromise
};
