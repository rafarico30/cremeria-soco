// backend/models/Product.js

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  ventaPorPieza: { type: Boolean, required: true },
  categoria: { type: String, required: true },
}, { collection: 'productos' }); // Asegúrate de que el nombre de la colección sea correcto

module.exports = mongoose.model('Product', ProductSchema);
