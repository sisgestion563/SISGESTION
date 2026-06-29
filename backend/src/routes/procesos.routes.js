const express =
require('express');

const router =
express.Router();

const {
    authenticateToken
} = require(
    '../middlewares/auth.middleware'
);

const {
    authorizeRole
} = require(
    '../middlewares/role.middleware'
);

const controller =
require(
    '../controllers/procesos.controller'
);

router.post(
    '/procesos/documentos/actualizar-vigencias',
    authenticateToken,
    authorizeRole([
        'ADMIN'
    ]),
    controller.actualizarDocumentos
);

module.exports = router;