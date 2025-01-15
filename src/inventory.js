import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Inventory from './inventory';
import List from './List';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faList } from '@fortawesome/free-solid-svg-icons';
import Header from "./components/Header";
import Footer from "./components/Footer";
import jamon from './assets/images/jamon.png';
import queso from './assets/images/queso.png';
import trigo from './assets/images/trigo.png';
import yogur from './assets/images/yogur.png';

function HomePage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCategoryClick = (category) => {
    navigate(`/list?category=${category}`);
  };

  return (
    <div className="App flex flex-col h-screen">
       <Header title="Cremería Soco" />
      <div className="bg-white h-screen flex flex-wrap">
        <button onClick={() => handleCategoryClick('carnes frias')} className="font-lobsterTwo text-letterColor font-extrabold text-5xl w-1/2 p-4 border-black border-4 flex items-center shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-lg hover:shadow-gray-800">
          <img src={jamon} alt="jamon" className="w-48 h-48 mr-32 ml-8" />
          Carnes frías
        </button>
        <button onClick={() => handleCategoryClick('productos bimbo')} className="font-lobsterTwo text-letterColor font-extrabold text-5xl w-1/2 p-4 border-black border-4 flex items-center shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-lg hover:shadow-gray-800">
          <img src={trigo} alt="trigo" className="w-48 h-48 mr-32 ml-8" />
          Productos Bimbo
        </button>
        <button onClick={() => handleCategoryClick('quesos')} className="font-lobsterTwo text-letterColor font-extrabold text-5xl w-1/2 p-4 border-black border-4 flex items-center shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-2xl hover:shadow-gray-900">
          <img src={queso} alt="queso" className="w-48 h-48 mr-32 ml-8" />
          Quesos
        </button>
        <button onClick={() => handleCategoryClick('productos lacteos')} className="font-lobsterTwo text-letterColor font-extrabold text-5xl w-1/2 p-4 border-black border-4 flex items-center shadow-none transition-shadow duration-400 cursor-pointer hover:shadow-2xl hover:shadow-gray-900">
          <img src={yogur} alt="yogur" className="w-48 h-48 mr-32 ml-8" />
          Productos lácteos
        </button>
      </div>

      <div className="bg-white h-24 flex justify-between items-center px-24">
        <button onClick={() => navigate('/')} className="bg-redColor rounded-lg font-bold px-4 py-1 hover:bg-red-400 hover:border-red-400 transition duration-300">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 text-xl font-bold" />
          Atrás
        </button>
        <button onClick={() => navigate('/list')} className="bg-footColor rounded-lg font-bold px-4 py-1 hover:bg-red-400 hover:border-red-400 transition duration-300">
          <FontAwesomeIcon icon={faList} className="mr-2 text-xl font-bold" />
          Ver todos los productos
        </button>
      </div>

      <div className="bg-greyColor p-4 flex justify-around space-x-20"></div>
      <Footer />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">Nuevo Producto</h2>
            <form>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="name">Nombre del producto</label>
                <input type="text" id="name" name="name" className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300" />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="description">Descripción del producto</label>
                <textarea id="description" name="description" className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300" rows="3" />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="price">Precio</label>
                <input type="number" id="price" name="price" className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300" />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="stock">Stock</label>
                <input type="number" id="stock" name="stock" className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300" />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="category">Categoría</label>
                <select id="category" name="category" className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300">
                  <option value="">Seleccionar categoría</option>
                  <option value="carnes frias">Carnes frias</option>
                  <option value="productos bimbo">Productos Bimbo</option>
                  <option value="quesos">Quesos</option>
                  <option value="productos lacteos">Productos lacteos</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Guardar</button>
                <button type="button" onClick={closeModal} className="bg-redColor text-white px-4 py-2 rounded hover:bg-red-400">Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/list" element={<List />} />
    </Routes>
  );
}

export default App;
