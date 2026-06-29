const express =
require('express');

const router =
express.Router();

const {
    login,me
} = require(
    '../controllers/auth.controller'
);

const {
    authenticateToken
} = require(
    '../middlewares/auth.middleware'
);

router.post(
    '/auth/login',
    login
);

router.get(
    '/auth/me',
    authenticateToken,
    me
);

module.exports = router;