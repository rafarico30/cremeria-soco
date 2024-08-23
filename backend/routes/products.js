// backend/routes/products.js

const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Importa el modelo de producto

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

module.exports = router;
