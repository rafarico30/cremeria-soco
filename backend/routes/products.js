// backend/routes/products.js

const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); 

router.get('/products', async (req, res) => {
  try {
    const { searchTerm } = req.query; // Capturar el término de búsqueda de la consulta

    const query = searchTerm
      ? {
          $or: [
            { nombre: { $regex: searchTerm, $options: 'i' } }, // Filtra por nombre
            { id: { $regex: searchTerm, $options: 'i' } } // Filtra por id
          ]
        }
      : {};

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});



module.exports = router;
