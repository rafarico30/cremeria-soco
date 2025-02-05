const mongoose = require('mongoose');

const compraSchema = new mongoose.Schema({
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    cantidad: { type: Number, required: true }
  }],
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
  fecha: { type: Date, required: true }
});

module.exports = mongoose.model('Compra', compraSchema);