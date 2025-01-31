const express = require('express');
const router = express.Router();
const Empleado = require('../models/Empleado');
const { body, validationResult } = require('express-validator');

// Ruta para crear un nuevo empleado (POST)
router.post('/empleados', [
  body('nombreEmpleado').notEmpty().withMessage('El nombre del empleado es requerido'),
  body('puesto').notEmpty().withMessage('El puesto es requerido'),
  body('telefono').isNumeric().withMessage('El teléfono debe ser un número'),
  body('fechaDeIngreso').isISO8601().withMessage('La fecha de ingreso es requerida y debe ser una fecha válida')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { nombreEmpleado, puesto, telefono, infoExtra, fechaDeIngreso } = req.body;
    const nuevoEmpleado = new Empleado({
      nombreEmpleado,
      puesto,
      telefono,
      infoExtra,
      fechaDeIngreso
    });

    const empleadoGuardado = await nuevoEmpleado.save();
    res.status(201).json(empleadoGuardado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el empleado' });
  }
});

// Ruta para actualizar un empleado existente (PUT)
router.put('/empleados/:id', [
  body('nombreEmpleado').notEmpty().withMessage('El nombre del empleado es requerido'),
  body('puesto').notEmpty().withMessage('El puesto es requerido'),
  body('telefono').isNumeric().withMessage('El teléfono debe ser un número'),
  body('fechaDeIngreso').isISO8601().withMessage('La fecha de ingreso es requerida y debe ser una fecha válida')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { nombreEmpleado, puesto, telefono, infoExtra, fechaDeIngreso } = req.body;
    const empleadoActualizado = await Empleado.findByIdAndUpdate(
      req.params.id,
      { nombreEmpleado, puesto, telefono, infoExtra, fechaDeIngreso },
      { new: true }
    );
    res.status(200).json(empleadoActualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el empleado' });
  }
});

// Ruta para obtener todos los empleados (GET)
router.get('/empleados', async (req, res) => {
  try {
    const empleados = await Empleado.find();
    res.status(200).json(empleados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los empleados' });
  }
});

// Ruta para obtener un empleado por ID (GET)
router.get('/empleados/:id', async (req, res) => {
  try {
    const empleado = await Empleado.findById(req.params.id);
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.status(200).json(empleado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el empleado' });
  }
});

// Ruta para eliminar un empleado (DELETE)
router.delete('/empleados/:id', async (req, res) => {
  try {
    const empleadoEliminado = await Empleado.findByIdAndDelete(req.params.id);
    if (!empleadoEliminado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.status(200).json({ message: 'Empleado eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el empleado' });
  }
});

module.exports = router;