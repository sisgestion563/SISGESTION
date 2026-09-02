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

/*******************************************
 CUMPLIMIENTO POR GESTIÓN
********************************************/

router.get(
    '/dashboard/cumplimiento-gestion/:proveedorId',
    authenticateToken,
    controller.cumplimientoPorGestion
);

/*******************************************
 ESTADO DE MI EXPEDIENTE
********************************************/

router.get(
    '/dashboard/estado-expediente/:proveedorId',
    authenticateToken,
    controller.estadoExpediente
);

/*******************************************
 CALIFICACIÓN DEL PROVEEDOR
********************************************/

router.get(
    '/dashboard/calificacion-proveedor/:proveedorId',
    authenticateToken,
    controller.calificacionProveedor
);

/*******************************************
 CUMPLIMIENTO GLOBAL DE PROVEEDORES (CONSULTOR / ADMIN)
********************************************/

router.get(
    '/dashboard/proveedores-cumplimiento',
    authenticateToken,
    controller.proveedoresCumplimiento
);

/*******************************************
 CUMPLIMIENTO GLOBAL POR GESTIÓN (CONSULTOR)
********************************************/

router.get(
    '/dashboard/cumplimiento-global-gestion',
    authenticateToken,
    controller.cumplimientoGlobalGestion
);

/*******************************************
 RANKING DE PROVEEDORES (CONSULTOR)
********************************************/

router.get(
    '/dashboard/consultor-ranking',
    authenticateToken,
    controller.rankingProveedores
);

/*******************************************
 ALERTAS / ATENCIÓN (CONSULTOR)
********************************************/

router.get(
    '/dashboard/consultor-alertas',
    authenticateToken,
    controller.alertasConsultor
);

module.exports = router;