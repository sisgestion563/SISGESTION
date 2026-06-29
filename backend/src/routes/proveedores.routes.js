const express =
require('express');

const router =
express.Router();

const {
    authenticateToken
} = require(
    '../middlewares/auth.middleware'
);

const controller =
require(
    '../controllers/proveedores.controller'
);

const {
    authorizeRole
} = require('../middlewares/role.middleware');


router.get(
    '/proveedores',
    authenticateToken,
    controller.listar
);

router.get(
    '/proveedores/:id',
    authenticateToken,
    controller.obtenerPorId
);

router.post(
    '/proveedores',
    authenticateToken,
    controller.crear
);

router.put(
    '/proveedores/:id',
    authenticateToken,
    controller.actualizar
);

router.get(
    '/proveedores/mis-datos',
    authenticateToken,
    authorizeRole([
        'PROVEEDOR'
    ]),
    controller.misDatos
);

router.get(
    '/proveedores/busqueda/:tipo/:valor',
    authenticateToken,
    controller.buscarProveedor
);

module.exports = router;