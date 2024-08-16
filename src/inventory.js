// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Inventory from './inventory'; // Asegúrate de que la ruta sea correcta
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faList} from '@fortawesome/free-solid-svg-icons';
import jamon from './assets/images/jamon.png';
import queso from './assets/images/queso.png';
import trigo from './assets/images/trigo.png';
import yogur from './assets/images/yogur.png';

function MainPage() {
  const navigate = useNavigate(); // Usa el hook aquí

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

  
  };

  return (
    <div className="App flex flex-col h-screen">
      <header className="bg-greyColor p-4">
        <div className="flex justify-between items-center">
          <p className="font-lobsterTwo text-letterColor font-extrabold text-5xl">Cremería Soco</p>
          <p className="font-lobsterTwo font-semibold text-letterColor text-2xl">{date}</p>
        </div>
      </header>

    
      <div className="bg-white h-screen flex flex-wrap">
  <button className="font-lobsterTwo text-letterColor font-extrabold text-5xl w-1/2 p-4 border-black border-4 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg relative overflow-hidden">
    <img src={jamon} alt="jamon" className="w-48 h-48 mr-32 ml-8" />
    Carnes frías
  </button>
  <button className="font-lobsterTwo text-letterColor font-extrabold text-5xl w-1/2 p-4 border-black border-4 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg relative overflow-hidden">
    <img src={trigo} alt="trigo" className="w-48 h-48 mr-32 ml-8" />
    Productos Bimbo
  </button>
  <button className="font-lobsterTwo text-letterColor font-extrabold text-5xl w-1/2 p-4 border-black border-4 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg relative overflow-hidden">
    <img src={queso} alt="queso" className="w-48 h-48 mr-32 ml-8" />
    Quesos
  </button>
  <button className="font-lobsterTwo text-letterColor font-extrabold text-5xl w-1/2 p-4 border-black border-4 flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg relative overflow-hidden">
    <img src={yogur} alt="yogur" className="w-48 h-48 mr-32 ml-8" />
    Productos lácteos
  </button>
</div>


      <div className="bg-white h-24 flex justify-between items-center px-24">
  <button className="bg-redColor rounded-lg font-bold px-4 py-1 hover:bg-red-400 hover:border-red-400 transition duration-300">
    <FontAwesomeIcon icon={faArrowLeft} className="mr-2 text-xl font-bold" />
    Atrás
  </button>
  <button className="bg-footColor rounded-lg font-bold px-4 py-1 hover:bg-red-400 hover:border-red-400 transition duration-300">
    <FontAwesomeIcon icon={faList} className="mr-2 text-xl font-bold" />
    Ver todos los productos
  </button>
</div>


      <div className="bg-greyColor p-4 flex justify-around space-x-20">
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
    </Routes>
  );
}

export default App;
