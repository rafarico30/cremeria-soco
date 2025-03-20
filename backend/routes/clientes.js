const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');
const { body, validationResult } = require('express-validator');

// Crear un nuevo cliente
router.post('/clientes', [
  body('nombreCliente').notEmpty().withMessage('El nombre del cliente es requerido'),
  body('telefono').isMobilePhone().withMessage('El teléfono debe ser un número válido'),
  body('notas').optional(),
  body('fechaRegistro').optional().isISO8601().withMessage('La fecha debe ser válida')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { nombreCliente, telefono, notas, fechaRegistro } = req.body;
    const nuevoCliente = new Cliente({
      nombreCliente,
      telefono,
      notas,
      fechaRegistro
    });

    const clienteGuardado = await nuevoCliente.save();
    res.status(201).json(clienteGuardado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
});

// Obtener todos los clientes
router.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
});

// Actualizar un cliente por ID
router.put('/clientes/:id', async (req, res) => {
  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!clienteActualizado) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json(clienteActualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
});

// Eliminar un cliente por ID
router.delete('/clientes/:id', async (req, res) => {
  try {
    const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!clienteEliminado) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
});

module.exports = router;