import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Inventory from './inventory';
import List from './List';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCirclePlus, faPeopleCarryBox, faMagnifyingGlass, faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const filteredProducts = products.filter((product) =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );
  

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

  

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="App flex flex-col h-screen">
      <header className="bg-greyColor p-4">
        <div className="flex justify-between items-center">
          <p className="font-lobsterTwo text-letterColor font-extrabold text-5xl">Cremería Soco</p>
          <p className="font-lobsterTwo font-semibold text-letterColor text-2xl">{date}</p>
        </div>
      </header>

      <div className='bg-white p-4'>
        <div className='flex justify-between items-center'>
          <div className='flex space-x-4'>
            <button
              onClick={openModal}
              className='bg-white font-semibold text-3xl px-8 py-5 flex items-center transition-all duration-300 hover:scale-110'
            >
              <FontAwesomeIcon icon={faCirclePlus} className="mr-2 text-4xl font-bold" />
              Nuevo Producto
            </button>

            <button className='bg-white font-semibold text-3xl px-8 py-5 flex items-center transition-all duration-300 hover:scale-110'>
              <FontAwesomeIcon icon={faPeopleCarryBox} className="mr-2 text-4xl font-bold" />
              Agregar stock
            </button>
          </div>

          <div className='flex items-center space-x-4'>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl font-bold" />
            <p className='font-semibold text-2xl'>Buscar</p>
            <input 
              type="text" 
              className='bg-greyColor rounded-md px-4 py-2' 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className='bg-white h-screen'>
        <table className='min-w-full text-m'>
          <thead>
            <tr>
              <th className='border border-black px-4 py-2 text-left'>Clave</th>
              <th className='border border-black px-4 py-2 text-left'>Nombre del producto</th>
              <th className='border border-black px-4 py-2 text-left'>Descripción del producto</th>
              <th className='border border-black px-4 py-2 text-left'>Precio</th>
              <th className='border border-black px-4 py-2 text-left'>Stock</th>
              <th className='border border-black px-4 py-2 text-left'></th>
            </tr>
          </thead>
          <tbody>
       {filteredProducts.map((product) => (
      <tr key={product._id}>
      <td className='border border-black px-4 py-2'>{product.id}</td>
      <td className='border border-black px-4 py-2'>{product.nombre}</td>
      <td className='border border-black px-4 py-2'>{product.descripcion}</td>
      <td className='border border-black px-4 py-2'>${product.precio}</td>
      <td className={`border border-black px-4 py-2 ${product.stock === 0 ? 'text-red-500 font-bold' : ''}`}>
        {product.stock}
      </td>
      <td className='border border-black px-4 py-2'>
        <button className='transition-all duration-300 hover:scale-110'>
          <FontAwesomeIcon icon={faPen} className="mr-2 text-2xl font-bold" />
        </button>
        <button className='transition-all duration-300 hover:scale-110'>
          <FontAwesomeIcon icon={faTrash} className="ml-3 text-2xl font-bold" />
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      <div className="bg-greyColor p-4 flex justify-end space-x-20">
        <button
          onClick={() => navigate('/')}
          className="bg-redColor rounded-lg font-bold px-4 py-1 mr-32 hover:bg-red-400 hover:border-red-400 transition duration-300"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2 text-xl font-bold" />
          Inicio
        </button>
      </div>

      <footer className="bg-footColor p-4">
        <div className="text-right font-bold text-black text-lg">
          {time}
        </div>
      </footer>

      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">Nuevo Producto</h2>
            <form>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="name">Nombre del producto</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="description">Descripción del producto</label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="price">Precio</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="stock">Stock</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="category">Categoría</label>
                <select
                  id="category"
                  name="category"
                  className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="carnes frias">Carnes frías</option>
                  <option value="productos bimbo">Productos Bimbo</option>
                  <option value="quesos">Quesos</option>
                  <option value="productos lacteos">Productos lácteos</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-redColor text-white px-4 py-2 rounded hover:bg-red-400"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
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
