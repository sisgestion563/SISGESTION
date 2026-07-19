const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRoutes = require('./routes/healthRoutes');

const app = express();
const testDbRoutes = require('./routes/testDB.routes');
const authRoutes = require('./routes/auth.routes');
const catalogosRoutes = require('./routes/catalogos.routes');
const ubigeosRoutes = require('./routes/ubigeos.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const documentosRoutes = require('./routes/documentos.routes');
const procesosRoutes = require('./routes/procesos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const usuariosRoutes = require('./routes/usuarios.routes');


app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use(express.json());

app.use('/api',healthRoutes);
app.use('/api',testDbRoutes);

app.use('/api',authRoutes);
app.use('/api',catalogosRoutes);
app.use('/api',ubigeosRoutes);
app.use('/api',proveedoresRoutes);
app.use('/api',documentosRoutes);
app.use('/api',procesosRoutes);
app.use('/api',dashboardRoutes);
app.use('/api',usuariosRoutes);

module.exports = app;




