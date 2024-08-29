import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Inventory from './inventory'; 
import List from './List';
import './App.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxesStacked, faCalculator, faXmark, faSearch, faCheese, faCheck } from '@fortawesome/free-solid-svg-icons';

function MainPage() {
  
  const navigate = useNavigate(); 

  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [products, setProducts] = useState([]); // Estado para los productos
  const [filteredProducts, setFilteredProducts] = useState([]); // Productos filtrados para mostrar en la búsqueda
  const [selectedProducts, setSelectedProducts] = useState([]); // Productos seleccionados para agregar a la tabla
  const [showSearchResults, setShowSearchResults] = useState(false); // Controlar visibilidad del cuadro de búsqueda

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setShowSearchResults(term.trim() !== '');

    if (term.trim() !== '') {
      const filtered = products.filter(product =>
        product.nombre.toLowerCase().includes(term.toLowerCase()) ||
        product.id.toString().toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleCantidadChange = (e) => {
    const value = Number(e.target.value);
    if (value > 0) { 
      setCantidad(value);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProducts(prevProducts => [...prevProducts, product]);
    setSearchTerm(''); // Limpiar el término de búsqueda
    setShowSearchResults(false); // Ocultar el cuadro de búsqueda
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          params: { searchTerm }
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error al obtener los productos', error);
      }
    };

    fetchProducts();
  }, [searchTerm]); 

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString();
      setTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('es-ES', options);
    setDate(formattedDate);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F8') {
        openModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
          <div className="bg-footColor text-white text-center py-2 rounded-t-lg">
            <h1 className="text-lg font-bold text-black">Cantidad de productos</h1>
          </div>
          <div className="px-6 py-8 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Total a cobrar</h2>
              <p className="text-4xl font-bold text-green-500">$0.00 MXN</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">El cliente pagó</h2>
              <input type="number" className="w-full rounded-full border-2 text-black border-black bg-gray-200 p-2" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Cambio</h2>
              <p className="text-4xl font-bold text-red-600">$0.00 MXN</p>
            </div>
            <div className="mt-8 flex justify-between">
              <button
                className="px-4 py-2 bg-white text-black rounded-full border-red-600 border-2 transition-transform duration-300 ease-in-out transform hover:bg-red-400 hover:scale-105"
                onClick={onClose}
              >
                Cancelar
                <FontAwesomeIcon icon={faXmark} className="ml-2 text-xl font-bold" />
              </button>
              <button
                className="px-4 py-2 bg-white text-black rounded-full border-green-500 border-2 transition-transform duration-300 ease-in-out transform hover:bg-green-300 hover:scale-105"
                onClick={() => {
                  onClose();
                }}
              >
                F8 - Confirmar
                <FontAwesomeIcon icon={faCheck} className="ml-2 text-xl font-bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="App flex flex-col h-screen">
      <header className="bg-greyColor p-4">
        <div className="flex justify-between items-center">
          <p className="font-lobsterTwo text-letterColor font-extrabold text-5xl">Cremería Soco</p>
          <p className="font-lobsterTwo font-semibold text-letterColor text-2xl">{date}</p>
        </div>
      </header>

      <div className="bg-greyColor2 flex justify-center items-center space-x-8 p-4">
        <button 
          className="border-2 border-black rounded-full px-3 py-1 text-black hover:bg-gray-200 transition duration-300"
          onClick={() => navigate('/inventory')}
        >
          Inventario productos
          <FontAwesomeIcon icon={faBoxesStacked} className="ml-3 text-lg" />
        </button>

        <button className="border-2 border-black rounded-full px-16 py-1 text-black hover:bg-gray-200 transition duration-300">
          Ventas
          <FontAwesomeIcon icon={faCalculator} className="ml-4 text-lg" />
        </button>
      </div>

      <div className="bg-white border border-black p-4 flex items-center relative">
        <h2 className="font-bold ml-6">Nombre del producto:</h2>
        <div className="relative">
          <input 
            type="text" 
            className="border border-black rounded-lg p-2 ml-4 w-1/5"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FontAwesomeIcon icon={faSearch} className="ml-2 text-2xl" />

          {/* Mostrar opciones de búsqueda si `showSearchResults` es true */}
          {showSearchResults && filteredProducts.length > 0 && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 w-full max-h-60 overflow-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleProductSelect(product)}
                >
                  {product.nombre} - ${product.precio} MXN
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center ml-6">
          <h2 className="font-bold">Cantidad:</h2>
          <input 
            type="number" 
            className="border border-black rounded-lg p-2 ml-4 w-20"
            value={cantidad}
            onChange={handleCantidadChange} 
          />  

          <FontAwesomeIcon icon={faCheese} className="ml-2 text-2xl" />
        </div>
      </div>

      <div className="flex-grow bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-footColor">
                <th className="border border-black p-2">Clave</th>
                <th className="border border-black p-2">Nombre</th>
                <th className="border border-black p-2">Precio</th>
                <th className="border border-black p-2">Cantidad</th>
                <th className="border border-black p-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((product, index) => (
                <tr key={index}>
                  <td className="border border-black p-2">{product.id}</td>
                  <td className="border border-black p-2">{product.nombre}</td>
                  <td className="border border-black p-2">{product.precio}</td>
                  <td className="border border-black p-2">{cantidad}</td>
                  <td className="border border-black p-2">{(product.precio * cantidad).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-greyColor p-4 flex justify-end space-x-20"></div>

      <footer className="bg-footColor p-4">
        <div className="text-right font-bold text-black text-lg">
          {time}
        </div>
      </footer>
      <Modal isOpen={isModalOpen} onClose={closeModal} />
    </div>

    
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/list" element={<List/>} />
    </Routes>
  );
}

export default App;
