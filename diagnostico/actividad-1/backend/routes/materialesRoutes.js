const express = require('express');
const router = express.Router();
const materialesController = require('../controllers/materialesController');

// GET /api/materiales - Obtener todos los materiales
router.get('/', materialesController.getAllMateriales);

// POST /api/materiales - Crear nuevo material
router.post('/', materialesController.createMaterial);

module.exports = router;