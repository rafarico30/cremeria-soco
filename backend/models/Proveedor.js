const mongoose = require('mongoose');

// Esquema del proveedor
const proveedorSchema = new mongoose.Schema({
  idProveedor: { type: Number, required: true, unique: true },
  nombreProveedor: { type: String, required: true },
  productos: { type: String, required: true },
  telefono: { type: Number, required: true },
  infoExtra: { type: String }
});

module.exports = mongoose.model('Proveedor', proveedorSchema);
