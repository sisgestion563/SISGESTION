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
    '../controllers/reportes.controller'
);


router.post(
    '/reportes/documentos',
    authenticateToken,
    authorizeRole([
        'ADMIN'
    ]),
    controller.obtenerReporteDocumentos
);


module.exports = router;