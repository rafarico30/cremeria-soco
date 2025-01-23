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

// Ruta para crear un nuevo proveedor (POST)
router.post('/proveedores', async (req, res) => {
  const { nombreProveedor, productos, telefono, infoExtra } = req.body;

  try {
    const nuevoProveedor = new Proveedor({
      nombreProveedor,
      productos,
      telefono,
      infoExtra
    });

    const proveedorGuardado = await nuevoProveedor.save();
    res.status(201).json(proveedorGuardado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el proveedor' });
  }
});

// Ruta para actualizar un proveedor existente (PUT)
router.put('/proveedores/:id', async (req, res) => {
  const { id } = req.params;
  const { nombreProveedor, productos, telefono, infoExtra } = req.body;

  try {
    const proveedorActualizado = await Proveedor.findByIdAndUpdate(
      id,
      { nombreProveedor, productos, telefono, infoExtra },
      { new: true }
    );
    res.json(proveedorActualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el proveedor' });
  }
});

// Ruta para eliminar un proveedor (DELETE)
router.delete('/proveedores/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Proveedor.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el proveedor' });
  }
});

module.exports = router;