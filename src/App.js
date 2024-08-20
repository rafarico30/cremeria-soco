import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Inventory from './inventory'; 
import List from './List';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxesStacked, faCalculator, faXmark, faSearch, faCheese, faCheck } from '@fortawesome/free-solid-svg-icons';

function MainPage() {
  const navigate = useNavigate(); 

  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      <div className="bg-white border border-black p-4 flex items-center">
        <h2 className="font-bold ml-6">Nombre del producto:</h2>
        <input 
          type="text" 
          className="border border-black rounded-lg p-2 ml-4 w-1/5"
          placeholder="Buscar producto..."
        />
        <FontAwesomeIcon icon={faSearch} className="ml-2 text-2xl" />
        
        <div className="flex items-center ml-6">
          <h2 className="font-bold">Cantidad:</h2>
          <input 
            type="number" 
            className="border border-black rounded-lg p-2 ml-4 w-20" 
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
                <th className="border border-black p-2">Nombre del producto</th>
                <th className="border border-black p-2">Cantidad</th>
                <th className="border border-black p-2">Precio unitario</th>
              </tr>
            </thead>
            <tbody>
              {/* Aquí puedes agregar filas de datos */}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-greyColor p-4 flex justify-around space-x-20">
        <button className="border-2 border-redColor rounded-full px-5 bg-redColor text-black font-bold hover:bg-red-400 hover:border-red-400 transition duration-300">
          Cancelar venta
          <FontAwesomeIcon icon={faXmark} className="ml-2 text-xl font-bold" />
        </button>

        <div className="flex items-center space-x-4">
          <button
            className="border-2 border-redColor rounded-lg px-5 py-2 bg-redColor text-black font-extrabold text-xl hover:bg-red-400 hover:border-red-400 transition duration-300"
            onClick={openModal}
          >
            F8 - Cobrar
          </button>

          <div className="border border-priceColor rounded-xl p-4 bg-priceColor">
            <p className="font-extrabold text-black text-2xl">$0.00 MXN</p>
          </div>
        </div>
      </div>

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
