const mongoose = require('mongoose');

// Esquema de la venta
const ventaSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    cantidad: { type: Number, required: true },
    precioUnitario: { type: Number, required: true }
  }],
  total: { type: Number, required: true },  // Total a pagar
  pagoCliente: { type: Number, required: true },  // Cantidad que pagó el cliente
  cambio: { type: Number, required: true },  // Cambio devuelto al cliente
});

module.exports = mongoose.model('Venta', ventaSchema);
