const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productsRoutes = require('./routes/products'); // Importa las rutas de productos

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

// Usa las rutas de productos
app.use('/api', productsRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
