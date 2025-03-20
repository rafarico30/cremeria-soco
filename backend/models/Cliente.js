const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema(
    {
        nombreCliente: { type: String, required: true },
        telefono: { type: String, required: true },
        notas: { type: String },
        fechaRegistro: { type: Date, default: Date.now }
    },
    { timestamps: true, collection: 'clientes' } // Corrección: el objeto de configuración debe estar dentro de los paréntesis del esquema
);

module.exports = mongoose.model('Cliente', ClienteSchema);