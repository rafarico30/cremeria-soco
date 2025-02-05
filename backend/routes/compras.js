const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Compra = require('../models/Compra');
const Product = require('../models/Product');

// Ruta para crear una nueva compra (POST)
router.post('/compras', [
  body('productos').isArray().withMessage('Los productos son requeridos y deben ser un array'),
  body('productos.*.producto').notEmpty().withMessage('El producto es requerido'),
  body('productos.*.cantidad').isNumeric().withMessage('La cantidad debe ser un número'),
  body('proveedor').notEmpty().withMessage('El proveedor es requerido'),
  body('fecha').isISO8601().withMessage('La fecha es requerida y debe ser una fecha válida')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productos, proveedor, fecha } = req.body;
    const nuevaCompra = new Compra({
      productos,
      proveedor,
      fecha
    });

    const compraGuardada = await nuevaCompra.save();

    // Actualizar el stock de cada producto
    for (const item of productos) {
      const product = await Product.findById(item.producto);
      if (product) {
        product.stock += item.cantidad; // Sumar la cantidad al stock existente
        await product.save();
      }
    }

    res.status(201).json(compraGuardada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la compra' });
  }
});

// Ruta para obtener todas las compras (GET)
router.get('/compras', async (req, res) => {
  try {
    const compras = await Compra.find().populate('productos.producto').populate('proveedor');
    res.status(200).json(compras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las compras' });
  }
});

module.exports = router;