import React, { useState } from 'react';
import Modal from 'react-modal';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileImage } from '@fortawesome/free-solid-svg-icons';

const GraphicsModal = ({ isOpen, onRequestClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentYear, setCurrentYear] = useState(false);
  const [includeVentas, setIncludeVentas] = useState(true);
  const [includeProducts, setIncludeProducts] = useState(false); // Cambiado a false
  const [formatJpg, setFormatJpg] = useState(true);
  const [formatPdf, setFormatPdf] = useState(false);
  const [rangeType, setRangeType] = useState('days'); // 'days', 'months', 'years'

  const handleGenerateReport = async () => {
    let start = startDate;
    let end = endDate;
  
    // Validación para asegurarse de que se selecciona un rango de fechas o el checkbox del año actual
    if ((!startDate || !endDate) && !currentYear) {
      alert('Por favor, seleccione un rango de fechas o el checkbox del año actual.');
      return;
    }
  
    // Validación de los años
    if (rangeType === 'years') {
      const currentYear = new Date().getFullYear();
      if (!validateYear(startDate) || !validateYear(endDate)) {
        alert('Por favor, introduzca un año válido entre 1900 y el año actual.');
        return;
      }
      if (parseInt(startDate) > parseInt(endDate)) {
        alert('El año de inicio debe ser menor o igual al año de fin.');
        return;
      }
    }
  
    // Validación de los meses
    if (rangeType === 'months') {
      if (new Date(startDate) > new Date(endDate)) {
        alert('El mes de inicio debe ser menor o igual al mes de fin.');
        return;
      }
    }
  
    // Validación de los días
    if (rangeType === 'days') {
      if (new Date(startDate) > new Date(endDate)) {
        alert('La fecha de inicio debe ser menor o igual a la fecha de fin.');
        return;
      }
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
      includeProducts,
      formatJpg,
      formatPdf,
      rangeType // Agregar el tipo de rango al objeto de datos del reporte
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/generateGraphics', reportData, {
        responseType: 'blob'
      });
  
      const fileName = `graficas.${formatJpg ? 'jpg' : 'pdf'}`;
      saveAs(response.data, fileName);
    } catch (error) {
      console.error('Error generating graphics:', error);
    }
  };

  const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear;
  };

  const handleStartYearChange = (e) => {
    const year = e.target.value;
    setStartDate(year);
  };

  const handleEndYearChange = (e) => {
    const year = e.target.value;
    setEndDate(year);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Generar Gráficas"
      className="modal fixed inset-0 flex items-center justify-center"
      overlayClassName="overlay fixed inset-0 bg-gray-600 bg-opacity-50"
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Generar Gráficas</h2>
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 ${rangeType === 'days' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-l-md`}
            onClick={() => setRangeType('days')}
          >
            Días
          </button>
          <button
            className={`px-4 py-2 ${rangeType === 'months' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setRangeType('months')}
          >
            Meses
          </button>
          <button
            className={`px-4 py-2 ${rangeType === 'years' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-r-md`}
            onClick={() => setRangeType('years')}
          >
            Años
          </button>
        </div>
        <div className="space-y-6">
          {rangeType === 'days' && (
            <>
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
            </>
          )}
          {rangeType === 'months' && (
            <>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-600">Mes de inicio</span>
                <input
                  type="month"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={currentYear}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-600">Mes de fin</span>
                <input
                  type="month"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={currentYear}
                />
              </div>
            </>
          )}
          {rangeType === 'years' && (
            <>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-600">Año de inicio</span>
                <input
                  type="number"
                  value={startDate}
                  onChange={handleStartYearChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="YYYY"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-600">Año de fin</span>
                <input
                  type="number"
                  value={endDate}
                  onChange={handleEndYearChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="YYYY"
                />
              </div>
            </>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={currentYear}
              onChange={() => setCurrentYear(!currentYear)}
              className="mr-2"
              disabled={rangeType === 'years'}
            />
            <span>Generar reporte del año actual</span>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-600">Gráficas sobre</h3>
            <label className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={includeVentas}
                onChange={(e) => {
                  setIncludeVentas(e.target.checked);
                  if (e.target.checked) setIncludeProducts(false); // Asegura que solo uno esté seleccionado
                }}
                className="form-checkbox"
              />
              <span className="ml-2">Ventas</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeProducts}
                onChange={(e) => {
                  setIncludeProducts(e.target.checked);
                  if (e.target.checked) setIncludeVentas(false); // Asegura que solo uno esté seleccionado
                }}
                className="form-checkbox"
              />
              <span className="ml-2">Productos</span>
            </label>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-600">Formato de descarga</h3>
            <label className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={formatJpg}
                onChange={(e) => {
                  setFormatJpg(e.target.checked);
                  if (e.target.checked) setFormatPdf(false); // Asegura que solo un formato esté seleccionado
                }}
                className="form-checkbox"
              />
              <span className="ml-2">.jpg  <FontAwesomeIcon icon={faFileImage} className="mr-3" /></span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formatPdf}
                onChange={(e) => {
                  setFormatPdf(e.target.checked);
                  if (e.target.checked) setFormatJpg(false); // Asegura que solo un formato esté seleccionado
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

export default GraphicsModal;