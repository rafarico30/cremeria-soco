const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productsRoutes = require('./routes/products');
const proveedoresRoutes = require('./routes/proveedores');
const empleadosRoutes = require('./routes/empleados');
const comprasRoutes = require('./routes/compras');
const reportRoutes = require('./routes/report');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/cremeriaSoco', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a la base de datos MongoDB');
}).catch(err => {
  console.error('Error al conectar a la base de datos', err);
});

// Usar las rutas de productos con el prefijo /api
app.use('/api', productsRoutes);
app.use('/api', proveedoresRoutes);
app.use('/api', empleadosRoutes);
app.use('/api', comprasRoutes);
app.use('/api', reportRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});