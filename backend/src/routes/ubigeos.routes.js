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
    listarDepartamentos,
    listarProvincias,
    listarDistritos
} = require(
    '../controllers/ubigeos.controller'
);

router.get(
    '/ubigeos/departamentos',
    authenticateToken,
    listarDepartamentos
);

router.get(
    '/ubigeos/provincias/:departamento',
    authenticateToken,
    listarProvincias
);

router.get(
    '/ubigeos/distritos/:departamento/:provincia',
    authenticateToken,
    listarDistritos
);

module.exports = router;