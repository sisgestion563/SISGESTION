const express = require('express');

const router = express.Router();

const {
    authenticateToken
} = require(
    '../middlewares/auth.middleware'
);

const controller =
require(
    '../controllers/dashboard.controller'
);

/*******************************************
 RESUMEN GENERAL
********************************************/

router.get(
    '/dashboard/resumen',
    authenticateToken,
    controller.resumen
);

/*******************************************
 DOCUMENTOS POR GRUPO
********************************************/

router.get(
    '/dashboard/documentos-por-grupo',
    authenticateToken,
    controller.documentosPorGrupo
);

/*******************************************
 DOCUMENTOS POR ESTADO
********************************************/

router.get(
    '/dashboard/documentos-por-estado',
    authenticateToken,
    controller.documentosPorEstado
);

/*******************************************
 PROVEEDORES CON DOCUMENTOS VENCIDOS
********************************************/

router.get(
    '/dashboard/proveedores-vencidos',
    authenticateToken,
    controller.proveedoresVencidos
);

/*******************************************
 DOCUMENTOS PRÓXIMOS A VENCER
********************************************/

router.get(
    '/dashboard/proximos-vencer',
    authenticateToken,
    controller.proximosVencer
);

module.exports = router;