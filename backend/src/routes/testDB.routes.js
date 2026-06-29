const express = require('express');
const router = express.Router();

const pool = require('../config/db');

router.get('/test-db', async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT NOW()'
        );

        res.json({
            success: true,
            fecha: result.rows[0]
        });

    } catch(error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

module.exports = router;