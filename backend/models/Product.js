const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  claveProducto: { type: Number, unique: true },
  nombre: { type: String, required: true },
  descripcion: String,
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  categoria: { type: String, required: true },
  ventaPorPieza: { type: Boolean, required: true }
});

productSchema.pre('save', async function(next) {
  const product = this;
  
  if (product.isNew) {
    const lastProduct = await mongoose.model('Product').findOne().sort({ claveProducto: -1 });
    product.claveProducto = lastProduct ? lastProduct.claveProducto + 1 : 1;
  }
  
  next();
});

module.exports = mongoose.model('Product', productSchema);
