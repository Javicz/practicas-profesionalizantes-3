// Importamos mysql2/promise para usar async/await
const mysql = require('mysql2/promise');

// Configuración de la conexión
const pool = mysql.createPool({
    host: 'localhost',           // Servidor MySQL
    user: 'root',                // Tu usuario de MySQL
    password: '0743',                // Tu contraseña (déjala vacía si no tienes)
    database: 'planta_reciclaje',
    waitForConnections: true,
    connectionLimit: 10,         // Máximo de conexiones simultáneas
    queueLimit: 0
});

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL correctamente');
        connection.release();
    } catch (error) {
        console.error('❌ Error al conectar a MySQL:', error.message);
        process.exit(1);
    }
}

testConnection();

module.exports = pool;