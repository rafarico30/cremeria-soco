const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Compra = require('../models/Compra');
const Product = require('../models/Product');
const Proveedor = require('../models/Proveedor');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Función para truncar texto
const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

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
      fecha: new Date() 
    });

    const compraGuardada = await nuevaCompra.save();

    // Actualizar el stock de cada producto
    for (const item of productos) {
      const product = await Product.findById(item.producto);
      if (product) {
        product.stock += item.cantidad;
        await product.save();
      }
    }

    // Poblar los datos del proveedor y de los productos
    const compraPopulada = await Compra.findById(compraGuardada._id)
      .populate('proveedor')
      .populate('productos.producto');

    // Generar el ticket en formato PDF
    const ticketPath = path.join(__dirname, 'tickets', 'compras', `compra_${compraGuardada._id}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(ticketPath));

    // Encabezado
    doc.font('Times-Bold').fontSize(35).text('Cremería Soco', { align: 'center' });
    doc.font('Times-Roman').fontSize(20).text('C. Nicolás Bravo 262, Centro histórico de Morelia', { align: 'center' });
    doc.font('Times-Roman').fontSize(20).text('4431019999', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text('---------------------------------------------------------------------', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text('RECIBO PARA PROVEEDOR', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text('---------------------------------------------------------------------', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Proveedor: ${compraPopulada.proveedor.nombreProveedor}`);
    doc.text(`Fecha: ${new Date(compraPopulada.fecha).toLocaleString()}`); // Mostrar la fecha correctamente formateada
    doc.moveDown();

    // Tabla de productos
    const tableTop = doc.y;
    const descriptionX = 50;
    const quantityX = 250;
    const priceX = 350;
    const totalX = 450;

    doc.font('Times-Bold');
    doc.text('Descripción', descriptionX, tableTop);
    doc.text('Cantidad', quantityX, tableTop);
    doc.text('Precio', priceX, tableTop);
    doc.text('Total', totalX, tableTop);
    doc.moveDown();
    doc.font('Times-Roman');

    compraPopulada.productos.forEach((item) => {
      const y = doc.y;
      const truncatedName = truncateText(item.producto.nombre, 15); // Truncar el nombre del producto a 15 caracteres
      doc.text(truncatedName, descriptionX, y);
      doc.text(item.cantidad.toString(), quantityX, y);
      doc.text(`$${item.producto.precioProveedor.toFixed(2)}`, priceX, y);
      doc.text(`$${(item.producto.precioProveedor * item.cantidad).toFixed(2)}`, totalX, y);
      doc.moveDown();
    });

    doc.moveDown(2); // Baja un par de líneas para asegurarte de que no esté encima de la tabla
    doc.text('', 50, doc.y); 

    // Total de la compra
    doc.fontSize(20).text('----------------------------------------------------------------------', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text(`Total de la Compra: $${compraPopulada.productos.reduce((acc, item) => acc + (item.producto.precioProveedor * item.cantidad), 0).toFixed(2)}`, 50, doc.y, { align: 'left' });


    doc.moveDown(2);
    doc.font('Times-Bold').fontSize(20).text('¡Gracias por el producto!', 50, doc.y, { align: 'center' });

    doc.end();

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