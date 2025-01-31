const mongoose = require('mongoose');

// Esquema del empleado
const empleadoSchema = new mongoose.Schema({
  nombreEmpleado: { type: String, required: true },
  puesto: { type: String, required: true },
  telefono: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v); // Ejemplo de validación para un número de 10 dígitos
      },
      message: props => `${props.value} no es un número de teléfono válido!`
    }
  },
  infoExtra: { type: String },
  fechaDeIngreso: { type: Date, required: true } // Campo de fecha de ingreso
}, { timestamps: true, collection: 'employees' }); // Especificar el nombre de la colección

module.exports = mongoose.model('Empleado', empleadoSchema);