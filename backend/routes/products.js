const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Venta = require('../models/Venta');
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

router.post('/products', async (req, res) => {
  try {
    const { claveProducto, nombre, descripcion, precio, stock, categoria, ventaPorPieza, precioProveedor } = req.body;

    let codigoFinal = claveProducto;

    // Si claveProducto está vacío, generar un número básico único
    if (!claveProducto) {
      const ultimoProducto = await Product.findOne({ claveProducto: { $regex: /^[0-9]+$/ } })
        .sort({ claveProducto: -1 })
        .exec();
      codigoFinal = ultimoProducto ? (parseInt(ultimoProducto.claveProducto) + 1).toString() : '1';
    }

    const nuevoProducto = new Product({
      claveProducto: codigoFinal,
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      ventaPorPieza,
      precioProveedor,
    });

    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (err) {
    console.error('Error al crear el producto:', err);
    res.status(500).json({ error: 'Error al crear el producto', details: err.message });
  }
});

// Ruta para obtener todos los productos (GET)
router.get('/products', async (req, res) => {
  try {
    const productos = await Product.find();
    res.json(productos);
  } catch (err) {
    console.error('Error al obtener los productos:', err);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// Ruta para actualizar un producto (PUT)
router.put('/products/:id', [
  body('claveProducto').isNumeric().withMessage('La clave del producto debe ser un número'),
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('precio').isNumeric().withMessage('El precio debe ser un número'),
  body('stock').isNumeric().withMessage('El stock debe ser un número'),
  body('categoria').notEmpty().withMessage('La categoría es requerida'),
  body('ventaPorPieza').isBoolean().withMessage('La venta por pieza debe ser un valor booleano')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { claveProducto, nombre, descripcion, precio, stock, categoria, ventaPorPieza, precioProveedor } = req.body;
    const productoActualizado = await Product.findByIdAndUpdate(req.params.id, {
      claveProducto,
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      ventaPorPieza,
      precioProveedor
    }, { new: true });

    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(productoActualizado);
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    res.status(500).json({ error: 'Error al actualizar el producto', details: err.message });
  }
});

// Ruta para eliminar un producto (DELETE)
router.delete('/products/:id', async (req, res) => {
  try {
    const productoEliminado = await Product.findByIdAndDelete(req.params.id);

    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar el producto:', err);
    res.status(500).json({ error: 'Error al eliminar el producto', details: err.message });
  }
});

// Ruta para registrar una nueva venta (POST)
router.post('/ventas', async (req, res) => {
  try {
    const { productos, total, pagoCliente, cambio } = req.body;

    // Validar campos obligatorios
    if (!productos || !total || !pagoCliente || !cambio) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Crear un nuevo objeto de Venta en la base de datos
    const nuevaVenta = new Venta({
      productos,
      total,
      pagoCliente,
      cambio,
    });

    // Guardar la venta en la base de datos
    const ventaGuardada = await nuevaVenta.save();

    // Cambia esta ruta a un directorio simple en tu proyecto para hacer pruebas
    const ticketDir = path.join(__dirname, 'tickets', 'ventas');  // Usamos el directorio local

    // Verificar si la carpeta 'tickets' existe, si no, crearla
    if (!fs.existsSync(ticketDir)) {
      console.log('La carpeta no existe, creando...');
      fs.mkdirSync(ticketDir, { recursive: true });
    } else {
      console.log('La carpeta ya existe');
    }

    // Ruta completa del archivo PDF
    const filePath = path.join(ticketDir, `ticket_venta_${ventaGuardada._id}.pdf`);
    console.log('Guardando PDF en:', filePath);

    const ventaPopulada = await Venta.findById(ventaGuardada._id).populate('productos.producto');

    // Crear el documento PDF
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);

    // Agregar contenido al PDF
    doc.pipe(writeStream);

    // Encabezado
    doc.font('Times-Bold').fontSize(35).text('Cremería Soco', { align: 'center' });
    doc.font('Times-Roman').fontSize(20).text('C. Nicolás Bravo 262, Centro histórico de Morelia', { align: 'center' });
    doc.font('Times-Roman').fontSize(20).text('4431019999', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text('---------------------------------------------------------------------', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text('RECIBO DE VENTA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text('---------------------------------------------------------------------', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Venta ID: ${ventaGuardada._id}`);
    doc.text(`Total: $${total}`);
    doc.text(`Pago del cliente: $${pagoCliente}`);
    doc.text(`Cambio: $${cambio}`);
    const fechaHoraActual = new Date().toLocaleString();
    doc.text(`Fecha: ${fechaHoraActual}`);
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

    ventaPopulada.productos.forEach((item) => {
      const y = doc.y;
      const truncatedName = truncateText(item.producto.nombre, 15); // Truncar el nombre del producto a 15 caracteres
      doc.text(truncatedName, descriptionX, y);
      doc.text(item.cantidad.toString(), quantityX, y);
      doc.text(`$${item.precioUnitario.toFixed(2)}`, priceX, y);
      doc.text(`$${(item.precioUnitario * item.cantidad).toFixed(2)}`, totalX, y);
      doc.moveDown();
    });

    doc.moveDown(2); // Baja un par de líneas para asegurarte de que no esté encima de la tabla
    doc.text('', 50, doc.y); 

    // Total de la venta
    doc.fontSize(20).text('----------------------------------------------------------------------', { align: 'center' });
    doc.fontSize(20).text(`Total de la Venta: $${total.toFixed(2)}`, 50, doc.y, { align: 'left' });

    // Agradecimiento (alineado a la izquierda)
    doc.moveDown(1);
    doc.font('Times-Bold').fontSize(20).text('¡Gracias por su compra!', 50, doc.y, { align: 'center' });

    // Finalizar el documento PDF
    doc.end();

    // Manejo de errores al escribir el archivo
    writeStream.on('finish', () => {
      console.log('PDF guardado con éxito en', filePath);
    });

    // Responder con la venta guardada
    res.status(201).json(ventaGuardada);

  } catch (err) {
    console.error('Error al procesar la venta:', err);
    res.status(500).json({ error: 'Error al guardar la venta', details: err.message });
  }
});

// Ruta para obtener las ventas (GET)
router.get('/ventas', async (req, res) => {
  try {
    const ventas = await Venta.find();
    res.json(ventas);
  } catch (err) {
    console.error('Error al obtener las ventas:', err);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
});

module.exports = router;