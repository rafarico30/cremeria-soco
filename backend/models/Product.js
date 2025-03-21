const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  claveProducto: { type: String, unique: true},
  nombre: { type: String, required: true },
  descripcion: String,
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  categoria: { type: String, required: true },
  ventaPorPieza: { type: Boolean, required: true },
  precioProveedor: { type: Number, default: 0, required: true }
});

module.exports = mongoose.model('Product', productSchema);
