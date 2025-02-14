import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCheese } from '@fortawesome/free-solid-svg-icons';

Modal.setAppElement('#root');

const FilterModal = ({ isOpen, onRequestClose, applyFilters, clearFilters }) => {
  const [today, setToday] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');

  const handleApplyFilters = () => {
    applyFilters({
      startDate: startDate || '',  // Asegura que siempre tenga un valor
      endDate: endDate || '',
      filterToday: today,
      startTime: startHour ? `${startHour}:00` : '',
      endTime: endHour ? `${endHour}:59` : ''
    });
    onRequestClose();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setToday(false);
    setStartHour('');
    setEndHour('');
    if (typeof clearFilters === 'function') {
      clearFilters();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Filter Modal"
      className="modal fixed inset-0 flex items-center justify-center"
      overlayClassName="overlay fixed inset-0 bg-gray-600 bg-opacity-50"
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Filtrar por</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-600">Fecha desde</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={today}
            />
          </div>
          {/* Checkbox Hoy */}
          <div className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={today}
              onChange={() => setToday(!today)}
              className="mr-2"
            />
            <span>Hoy</span>
          </div>
          {/* Hasta el */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-600">Hasta el</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={today}
            />
          </div>
          {/* Hora */}
          <div className="space-y-4">
            <span className="font-semibold text-gray-600 text-xl">Hora</span>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-600">Desde:</span>
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecciona</option>
                {[...Array(24).keys()].map(h => (
                  <option key={h} value={h}>{`${h}:00`}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-600">Hasta:</span>
              <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecciona</option>
                {[...Array(24).keys()].map(h => (
                  <option key={h} value={h}>{`${h}:59`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-between mt-6 space-x-4">
            <button 
              onClick={handleApplyFilters} 
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-md transition-all duration-300 ease-in-out"
            >
              <FontAwesomeIcon icon={faClock} className="mr-2" />
              Guardar cambios
            </button>
            <button 
              onClick={handleClearFilters} 
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-md transition-all duration-300 ease-in-out"
            >
              Eliminar filtros
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

export default FilterModal;
