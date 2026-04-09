const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas
const materialesRoutes = require('./routes/materialesRoutes');
const operacionesRoutes = require('./routes/operacionesRoutes');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());                    // Permite peticiones desde el frontend
app.use(express.json());            // Parsear JSON en las peticiones
app.use(express.urlencoded({ extended: true })); // Parsear datos de formularios

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de la API
app.use('/api/materiales', materialesRoutes);
app.use('/api/operaciones', operacionesRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});