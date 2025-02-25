import React, { useState } from 'react';
import Modal from 'react-modal';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faTable} from '@fortawesome/free-solid-svg-icons';

const ReportsModal = ({ isOpen, onRequestClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentYear, setCurrentYear] = useState(false);
  const [includeVentas, setIncludeVentas] = useState(true);
  const [includeCompras, setIncludeCompras] = useState(true);
  const [formatXlsx, setFormatXlsx] = useState(true);
  const [formatPdf, setFormatPdf] = useState(false);

  const handleGenerateReport = async () => {
    let start = startDate;
    let end = endDate;
  
    // Validación para asegurarse de que se selecciona un rango de fechas o el checkbox del año actual
    if ((!startDate || !endDate) && !currentYear) {
      alert('Por favor, seleccione un rango de fechas o el checkbox del año actual.');
      return;
    }
  
    if (currentYear) {
      const currentYear = new Date().getFullYear();
      start = new Date(currentYear, 0, 1).toISOString().split('T')[0];
      end = new Date().toISOString().split('T')[0];
    }
  
    const reportData = {
      startDate: start,
      endDate: end,
      includeVentas,
      includeCompras,
      formatXlsx,
      formatPdf
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/generateReport', reportData, {
        responseType: 'blob'
      });
  
      const fileName = `reporte.${formatXlsx ? 'xlsx' : 'pdf'}`;
      saveAs(response.data, fileName);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Generar Reportes"
      className="modal fixed inset-0 flex items-center justify-center"
      overlayClassName="overlay fixed inset-0 bg-gray-600 bg-opacity-50"
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Generar Reportes</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-600">Fecha de inicio</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={currentYear}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-600">Fecha de fin</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={currentYear}
            />
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={currentYear}
              onChange={() => setCurrentYear(!currentYear)}
              className="mr-2"
            />
            <span>Generar reporte del año actual</span>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-600">Incluir solo</h3>
            <label className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={includeVentas}
                onChange={(e) => setIncludeVentas(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2">Ventas</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeCompras}
                onChange={(e) => setIncludeCompras(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2">Compras</span>
            </label>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-600">Formato de descarga</h3>
            <label className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={formatXlsx}
                onChange={(e) => {
                  setFormatXlsx(e.target.checked);
                  if (e.target.checked) setFormatPdf(false); // Asegura que solo un formato esté seleccionado
                }}
                className="form-checkbox"
              />
              <span className="ml-2">.xlsx  <FontAwesomeIcon icon={faTable} className="mr-3" /></span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formatPdf}
                onChange={(e) => {
                  setFormatPdf(e.target.checked);
                  if (e.target.checked) setFormatXlsx(false); // Asegura que solo un formato esté seleccionado
                }}
                className="form-checkbox"
              />
              <span className="ml-2">.pdf  <FontAwesomeIcon icon={faFilePdf} className="mr-3" /></span>
            </label>
          </div>
          <div className="flex justify-between mt-6 space-x-4">
            <button
              onClick={handleGenerateReport}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-md transition-all duration-300 ease-in-out"
            >
              Generar
            </button>
            <button
              onClick={onRequestClose}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-md transition-all duration-300 ease-in-out"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReportsModal;