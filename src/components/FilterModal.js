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
  const [hour, setHour] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productInput, setProductInput] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error al obtener los productos', error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    if (productInput && !selectedProducts.includes(productInput)) {
      setSelectedProducts([...selectedProducts, productInput]);
      setProductInput('');
    }
  };

  const handleRemoveProduct = (product) => {
    setSelectedProducts(selectedProducts.filter(p => p !== product));
  };

  const handleApplyFilters = () => {
    applyFilters({
      startDate,
      endDate,
      filterToday: today,
      hour,
      selectedProducts
    });
    onRequestClose();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setToday(false);
    setHour('');
    setSelectedProducts([]);
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
        <h2 className="text-2xl font-bold mb-4">Filtrar por</h2>
        <div className="space-y-4">
          {/* Fecha desde */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={today}
            />
          </div>
          {/* Checkbox Hoy */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={today}
              onChange={() => setToday(!today)}
              className="mr-2"
            />
            <span>Hoy</span>
          </div>
          {/* Hasta el */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={today}
            />
          </div>
          {/* Hora */}
          <div className="flex items-center gap-2">
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Seleccione una hora</option>
              {[...Array(24).keys()].map(h => (
                <option key={h} value={h}>{`${h}:00`}</option>
              ))}
            </select>
            <span><FontAwesomeIcon icon={faClock} className="mr-2 text-xl font-bold" /></span>
          </div>
          {/* Productos */}
          <div className="flex items-center gap-2">
            <select
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Seleccione un producto</option>
              {products.map((product) => (
                <option key={product._id} value={product.nombre}>
                  {product.nombre}
                </option>
              ))}
            </select>
            <span><FontAwesomeIcon icon={faCheese} className="mr-2 text-xl font-bold" /></span>
            <button onClick={handleAddProduct} className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">Agregar</button>
          </div>
          <div className="selected-products mt-2">
            {selectedProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
                <span>{product}</span>
                <button onClick={() => handleRemoveProduct(product)} className="text-red-500 hover:text-red-700">x</button>
              </div>
            ))}
          </div>
          {/* Botones */}
          <div className="flex justify-between mt-4">
            <button onClick={handleApplyFilters} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">Guardar cambios</button>
            <button onClick={handleClearFilters} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md">Eliminar Filtros</button>
            <button onClick={onRequestClose} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Cancelar</button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;