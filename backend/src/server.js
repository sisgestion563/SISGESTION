require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor ejecutándose en puerto ${PORT}`
  );
  
});
  app.get('/', (req, res) => {
    res.json({
      sistema: 'SISGESTION',
      estado: 'OK',
      version: '1.0'
    });
  });
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sisgestion-kohl.vercel.app/",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);