const express = require('express');

const app = express();

// Middlewares...

app.get('/', (req, res) => {
    res.json({
        sistema: 'SISGESTION',
        estado: 'OK',
        version: '1.0'
    });
});

// app.use('/api/...')

module.exports = app;
