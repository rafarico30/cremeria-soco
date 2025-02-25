const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Venta = require('../models/Venta');
const Compra = require('../models/Compra');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
require('moment/locale/es');

const width = 800; // width of the chart
const height = 600; // height of the chart
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

const groupByDateTime = (items, rangeType) => {
  return items.reduce((acc, item) => {
    let date;
    if (rangeType === 'days') {
      date = moment(item.fecha).format('LL'); // Agrupar por día
    } else if (rangeType === 'months') {
      date = moment(item.fecha).format('MMMM YYYY'); // Agrupar por mes
    } else if (rangeType === 'years') {
      date = moment(item.fecha).format('YYYY'); // Agrupar por año
    }
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});
};

router.post('/generateReport', async (req, res) => {
  const { startDate, endDate, includeVentas, includeCompras, formatXlsx, formatPdf } = req.body;

  // Validar que las fechas y los checkboxes estén presentes
  if (!startDate || !endDate || (!includeVentas && !includeCompras)) {
    return res.status(400).json({ error: 'Por favor, seleccione un rango de fechas y al menos una opción de reporte (ventas o compras).' });
  }

  // Límite de caracteres para los nombres de los productos
  const maxLength = 24;

  // Función para truncar texto y agregar puntos suspensivos si excede el límite
  const truncateText = (text) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  try {
    const startDateStr = moment(startDate).format('YYYY-MM-DD');
    const endDateStr = moment(endDate).format('YYYY-MM-DD');

    const start = new Date(`${startDateStr}T00:00:00.000Z`);
    const end = new Date(`${endDateStr}T23:59:59.999Z`);

    end.setHours(23, 59, 59, 999);

    let ventas = [];
    let compras = [];

    if (includeVentas) {
      ventas = await Venta.find({ fecha: { $gte: start, $lte: end } }).populate('productos.producto');
    }

    if (includeCompras) {
      compras = await Compra.find({ fecha: { $gte: start, $lte: end } }).populate('productos.producto');
    }

    const groupByDateTime = (items) => {
      return items.reduce((acc, item) => {
        const date = moment(item.fecha).format('LL'); // Cambiar a solo fecha
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {});
    };

    const ventasPorFechaHora = groupByDateTime(ventas);
    const comprasPorFechaHora = groupByDateTime(compras);

    if (formatXlsx) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte');

      // Estilos de encabezados
      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0000FF' } },
        alignment: { horizontal: 'center' }
      };

      // Estilos de subtotales
      const subtotalStyle = {
        font: { bold: true, color: { argb: 'FF000000' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } },
        alignment: { horizontal: 'right' }
      };

      // Encabezados de la hoja
      worksheet.columns = [
        { header: 'Tipo', key: 'tipo', width: 10 },
        { header: 'Fecha', key: 'fecha', width: 20 },
        { header: 'Producto', key: 'producto', width: 30 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Precio Unitario', key: 'precioUnitario', width: 15 },
        { header: 'Total', key: 'total', width: 15 }
      ];

      let totalVentas = 0;
      let totalCompras = 0;

      // Sección de Ventas
      worksheet.addRow(['Ventas']).font = { bold: true, size: 16 };
      for (const [fecha, ventas] of Object.entries(ventasPorFechaHora)) {
        worksheet.addRow([`Fecha: ${fecha}`]).font = { bold: true, size: 14 }; // Usar solo fecha
        let totalVentaDia = 0;
        ventas.forEach(venta => {
          worksheet.addRow({
            tipo: 'Venta',
            fecha: moment(venta.fecha).format('LLL'), // Usar fecha y hora
            producto: '',
            cantidad: '',
            precioUnitario: '',
            total: '',
            proveedorCliente: ''
          }).font = { bold: true };
          venta.productos.forEach(producto => {
            const totalProducto = producto.cantidad * producto.precioUnitario;
            totalVentaDia += totalProducto;
            worksheet.addRow({
              tipo: '',
              fecha: '',
              producto: producto.producto.nombre,
              cantidad: producto.cantidad,
              precioUnitario: producto.precioUnitario,
              total: totalProducto,
              proveedorCliente: 'Cliente'
            });
          });
        });
        totalVentas += totalVentaDia;
        worksheet.addRow(['', '', '', '', 'Total Venta del Día:', totalVentaDia]).font = subtotalStyle.font;
        worksheet.addRow([]); // Agregar un espacio entre fechas
      }

      worksheet.addRow([]); // Agregar espacio entre ventas y compras

      // Sección de Compras
      worksheet.addRow(['Compras']).font = { bold: true, size: 16 };
      for (const [fecha, compras] of Object.entries(comprasPorFechaHora)) {
        worksheet.addRow([`Fecha: ${fecha}`]).font = { bold: true, size: 14 }; // Usar solo fecha
        let totalCompraDia = 0;
        compras.forEach(compra => {
          worksheet.addRow({
            tipo: 'Compra',
            fecha: moment(compra.fecha).format('LLL'), // Usar fecha y hora
            producto: '',
            cantidad: '',
            precioUnitario: '',
            total: '',
            proveedorCliente: ''
          }).font = { bold: true };
          compra.productos.forEach(producto => {
            const totalProducto = producto.cantidad * producto.producto.precioProveedor;
            totalCompraDia += totalProducto;
            worksheet.addRow({
              tipo: '',
              fecha: '',
              producto: producto.producto.nombre,
              cantidad: producto.cantidad,
              precioUnitario: producto.producto.precioProveedor,
              total: totalProducto,
              proveedorCliente: compra.proveedor.nombreProveedor
            });
          });
        });
        totalCompras += totalCompraDia;
        worksheet.addRow(['', '', '', '', 'Total Compra del Día:', totalCompraDia]).font = subtotalStyle.font;
        worksheet.addRow([]); // Agregar un espacio entre fechas
      }

      worksheet.addRow([]); // Espacio para separar compras y totales
      worksheet.addRow(['', '', '', '', 'Total Ventas:', totalVentas]).font = subtotalStyle.font;
      worksheet.addRow(['', '', '', '', 'Total Compras:', totalCompras]).font = subtotalStyle.font;
      worksheet.addRow(['', '', '', '', 'Ganancia:', totalVentas - totalCompras]).font = subtotalStyle.font;

      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Disposition', `attachment; filename=reporte.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }

    if (formatPdf) {
      const doc = new PDFDocument({ margin: 50 });
      
      const formattedStartDate = moment(start).add(1, 'days').format('LL'); 
      const formattedEndDate = moment(end).format('LL');

      doc.fontSize(18).text('Reporte de Ventas y Compras', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Reporte generado de ${formattedStartDate} - ${formattedEndDate}`, { align: 'center' });
      doc.moveDown(2);

      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Disposition', `attachment; filename=reporte.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfData);
      });

      // Título
      doc.fontSize(18).text('Reporte de Ventas y Compras', { align: 'center' });
      doc.moveDown();

      let totalVentas = 0;
      let totalCompras = 0;

      // Sección de Ventas
      doc.fontSize(16).text('Ventas', { underline: true });
      for (const [fecha, ventas] of Object.entries(ventasPorFechaHora)) {
        doc.font('Helvetica-Bold').fillColor('black').fontSize(14).text(`Fecha: ${fecha}`, { underline: true });
        let totalVentaDia = 0;
        ventas.forEach(venta => {
          doc.font('Helvetica-Bold').fillColor('green').fontSize(12).text(`Total de la venta: $${venta.total}`, { align: 'right' });
          doc.moveDown(0.5);
          venta.productos.forEach(producto => {
            const totalProducto = producto.cantidad * producto.precioUnitario;
            totalVentaDia += totalProducto;
            doc.font('Helvetica').fillColor('black').text(`Producto: ${truncateText(producto.producto.nombre, 30)} | Cantidad vendida: ${producto.cantidad}`, { indent: 20 });
          });
          doc.moveDown();
          doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Línea separadora
          doc.moveDown();
        });
        totalVentas += totalVentaDia;
        doc.font('Helvetica-Bold').fillColor('black').fontSize(12).text(`Total Venta del Día: ${totalVentaDia}`);
        doc.moveDown();
        doc.moveDown(); // Agregar espacio entre fechas
      }

      // Sección de Compras
      doc.addPage();
      doc.fontSize(16).text('Compras', { underline: true });
      for (const [fecha, compras] of Object.entries(comprasPorFechaHora)) {
        doc.font('Helvetica-Bold').fillColor('black').fontSize(14).text(`Fecha: ${fecha}`, { underline: true });
        let totalCompraDia = 0;
        compras.forEach(compra => {
          doc.font('Helvetica-Bold').fillColor('red').fontSize(12).text(`Total de la compra: $${compra.total}`, { align: 'right' });
          doc.moveDown(0.5);
          doc.moveDown(0.5);
          compra.productos.forEach(producto => {
            const totalProducto = producto.cantidad * producto.producto.precioProveedor;
            totalCompraDia += totalProducto;
            doc.font('Helvetica').fillColor('black').text(`Producto: ${truncateText(producto.producto.nombre, 30)}  | Cantidad comprada: ${producto.cantidad}`, { indent: 20 });
          });
          doc.moveDown();
          doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Línea separadora
          doc.moveDown();
        });
        totalCompras += totalCompraDia;
        doc.font('Helvetica-Bold').fillColor('black').fontSize(12).text(`Total Compra del Día: $${totalCompraDia}`);
        doc.moveDown();
        doc.moveDown(); // Agregar espacio entre fechas
      }

      // Totales generales
      doc.font('Helvetica-Bold').fontSize(14).text(`Total Ventas: $${totalVentas}`);
      doc.font('Helvetica-Bold').fontSize(14).text(`Total Compras: $${totalCompras}`);
      doc.font('Helvetica-Bold').fontSize(14).text(`Ganancia: $${totalVentas - totalCompras}`);


      doc.moveDown(2); // Espacio antes del pie de página
      doc.font('Helvetica').fontSize(10).text('Cremería Soco - Reporte generado automáticamente', { align: 'center' });
      doc.font('Helvetica').fontSize(10).text(`Fecha de generación: ${moment().format('LLL')}`, { align: 'center' });
            
      doc.end();


    }
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send('Error generating report');
  }
});

router.post('/generateGraphics', async (req, res) => {
  const { startDate, endDate, includeVentas, includeProducts, formatJpg, formatPdf, rangeType } = req.body;

  // Validar que las fechas y los checkboxes estén presentes
  if (!startDate || !endDate || (!includeVentas && !includeProducts)) {
    return res.status(400).json({ error: 'Por favor, seleccione un rango de fechas y al menos una opción de reporte (ventas o productos).' });
  }

  try {
    const startDateStr = moment(startDate).format('YYYY-MM-DD');
    let endDateStr = moment(endDate).format('YYYY-MM-DD');

    // Ajustar la fecha de finalización para incluir el último día del año si el rango es por años
    if (rangeType === 'years') {
      endDateStr = moment(endDate).endOf('year').format('YYYY-MM-DD');
    }

    const start = new Date(`${startDateStr}T00:00:00.000Z`);
    const end = new Date(`${endDateStr}T23:59:59.999Z`);

    end.setHours(23, 59, 59, 999);

    let ventas = [];
    let productosVendidos = {};
    let ventasPorFecha = {};

    if (includeVentas) {
      ventas = await Venta.find({ fecha: { $gte: start, $lte: end } }).populate('productos.producto');
      ventasPorFecha = ventas.reduce((acc, venta) => {
        const fecha = moment(venta.fecha).format('YYYY-MM-DD');
        if (!acc[fecha]) {
          acc[fecha] = 0;
        }
        acc[fecha] += venta.total;
        return acc;
      }, {});
    }

    if (includeProducts) {
      ventas = await Venta.find({ fecha: { $gte: start, $lte: end } }).populate('productos.producto');
      productosVendidos = ventas.reduce((acc, venta) => {
        venta.productos.forEach(({ producto, cantidad }) => {
          if (!acc[producto.nombre]) {
            acc[producto.nombre] = 0;
          }
          acc[producto.nombre] += cantidad;
        });
        return acc;
      }, {});
    }

    const generateChart = async (data, title) => {
      const colors = [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ];
    
      const borderColors = [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ];
    
      const configuration = {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: title,
            data: Object.values(data),
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 24,
                weight: 'bold'
              }
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: {
                  size: 14,
                  weight: 'bold'
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.raw}`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Producto',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              },
              ticks: {
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            },
            y: {
              title: {
                display: true,
                text: 'Cantidad Vendida',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              },
              ticks: {
                beginAtZero: true,
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            }
          }
        }
      };
      return await chartJSNodeCanvas.renderToBuffer(configuration, 'image/jpeg');
    };

    if (formatPdf) {
      const doc = new PDFDocument({ margin: 50 });
      
      const formattedStartDate = moment(start).add(1, 'days').format('LL'); 
      const formattedEndDate = moment(end).format('LL');

      doc.fontSize(18).text('Cremeria Soco', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Reporte generado de ${formattedStartDate} - ${formattedEndDate}`, { align: 'center' });
      doc.moveDown(2);

      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Disposition', `attachment; filename=reporte.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfData);
      });

      if (includeVentas) {
        const ventasChart = await generateChart(ventasPorFecha, 'Ventas');
        doc.image(ventasChart, { fit: [500, 300], align: 'center' });
      }

      if (includeProducts) {
        const productosChart = await generateChart(productosVendidos, 'Productos Vendidos');
        doc.image(productosChart, { fit: [500, 300], align: 'center' });
      }

      doc.end();
    }

    if (formatJpg) {
      if (includeVentas) {
        const ventasChart = await generateChart(ventasPorFecha, 'Ventas');
        res.setHeader('Content-Disposition', 'attachment; filename="ventas.jpg"');
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(ventasChart);
      }

      if (includeProducts) {
        const productosChart = await generateChart(productosVendidos, 'Productos Vendidos');
        res.setHeader('Content-Disposition', 'attachment; filename="productos_vendidos.jpg"');
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(productosChart);
      }
    }
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send('Error generating report');
  }
});

module.exports = router;
