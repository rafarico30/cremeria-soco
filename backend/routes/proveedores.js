const express = require('express');
const router = express.Router();
const Proveedor = require('../models/Proveedor');

// Ruta para obtener proveedores (GET)
router.get('/proveedores', async (req, res) => {
  try {
    const proveedores = await Proveedor.find();
    res.json(proveedores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los proveedores' });
  }
});

module.exports = router;


