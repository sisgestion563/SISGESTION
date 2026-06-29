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
    listarGrupos,
    listarValores
} = require(
    '../controllers/catalogos.controller'
);

router.get(
    '/catalogos/grupos',
    authenticateToken,
    listarGrupos
);

router.get(
    '/catalogos/:codGrupo/:tipoGrupo',
    authenticateToken,
    listarValores
);

module.exports = router;