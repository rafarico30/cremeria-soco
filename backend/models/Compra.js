const mongoose = require('mongoose');

const compraSchema = new mongoose.Schema({
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    cantidad: { type: Number, required: true }
  }],
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
  fecha: { type: Date, required: true },
  total: { type: Number, required: true, default: 0 } // Nuevo campo total
});

// Middleware para calcular el total antes de guardar
compraSchema.pre('save', async function(next) {
  const compra = this;
  let total = 0;

  for (const item of compra.productos) {
    const producto = await mongoose.model('Product').findById(item.producto);
    total += item.cantidad * producto.precioProveedor; 
  }

  compra.total = total;
  next();
});

module.exports = mongoose.model('Compra', compraSchema);