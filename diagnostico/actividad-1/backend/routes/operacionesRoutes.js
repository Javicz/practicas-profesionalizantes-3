const express = require('express');
const router = express.Router();
const operacionesController = require('../controllers/operacionesController');
const { validarCantidad, validarMaterialExistente } = require('../middleware/validaciones');

// POST /api/operaciones/comprar - Registrar compra
router.post(
    '/comprar',
    validarCantidad,
    validarMaterialExistente,
    operacionesController.registrarCompra
);

// POST /api/operaciones/vender - Registrar venta
router.post(
    '/vender',
    validarCantidad,
    validarMaterialExistente,
    operacionesController.registrarVenta
);

module.exports = router;