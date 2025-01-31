const mongoose = require('mongoose');

// Esquema del proveedor
const proveedorSchema = new mongoose.Schema({
  nombreProveedor: { type: String, required: true },
  productos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true }],
  telefono: { type: Number, required: true },
  infoExtra: { type: String }
});

module.exports = mongoose.model('Proveedor', proveedorSchema);