const express = require('express');

const router = express.Router();

const controller =
require('../controllers/documentos.controller');

const {
    authenticateToken
} = require('../middlewares/auth.middleware');

router.get(
    '/documentos/proveedor/:proveedorId',
    authenticateToken,
    controller.listarPorProveedor
);

router.get(
    '/documentos/:id',
    authenticateToken,
    controller.obtenerPorId
);

router.post(
    '/documentos',
    authenticateToken,
    controller.crear
);

router.put(
    '/documentos/:id',
    authenticateToken,
    controller.actualizar
);

router.get(
    '/documentos/proveedor/:proveedorId/grupo/:grupo',
    authenticateToken,
    controller.listarPorGrupo
);

module.exports = router;