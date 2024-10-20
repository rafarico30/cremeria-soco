const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Ruta para obtener productos (GET)
router.get('/products', async (req, res) => {
  try {
    const { searchTerm } = req.query;

    let query = {};

    if (searchTerm) {
      const isNumeric = !isNaN(searchTerm);
      query = isNumeric
        ? { claveProducto: parseInt(searchTerm) }
        : { nombre: { $regex: searchTerm, $options: 'i' } };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// Ruta para actualizar un producto existente (PUT)
router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, categoria, ventaPorPieza } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        nombre,
        descripcion,
        precio,
        stock,
        categoria,
        ventaPorPieza,
      },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// Ruta para guardar un nuevo producto (POST)
router.post('/products', async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria, ventaPorPieza } = req.body;

  try {
    // Validación básica
    if (!nombre || !precio || !stock || !categoria || typeof ventaPorPieza === 'undefined') {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Crear un nuevo producto
    const newProduct = new Product({
      nombre,
      descripcion,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      categoria,
      ventaPorPieza: ventaPorPieza === 'pieza', // True si es 'pieza', false si es 'kilogramos'
    });

    // Guardar el producto en la base de datos
    const savedProduct = await newProduct.save();

    // Enviar el producto guardado como respuesta
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el producto', details: err.message });
  }
});

module.exports = router;
