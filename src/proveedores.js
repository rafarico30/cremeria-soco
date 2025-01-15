import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { faHome, faPeopleCarryBox, faMagnifyingGlass, faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function HomePage() {
  const [proveedores, setProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/proveedores');
        setProveedores(response.data);
      } catch (error) {
        console.error('Error al obtener los proveedores', error);
      }
    };

    fetchProveedores();
  }, [location.search]);

  const filteredProveedores = proveedores.filter(proveedor => {
    const nombreString = String(proveedor.nombreProveedor).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return nombreString.includes(searchLower);
  });

  return (
    <div className="App flex flex-col h-screen">
      <Header title="Cremería Soco" />

      <div className='bg-white p-4'>
        <div className='flex justify-between items-center'>
          <div className='flex space-x-4'>
            <button
              onClick={() => {}}
              className='bg-white font-semibold text-3xl px-8 py-5 flex items-center transition-all duration-300 hover:scale-110'
            >
              <FontAwesomeIcon icon={faPeopleCarryBox} className="mr-2 text-4xl font-bold" />
              Nuevo Proveedor
            </button>
          </div>

          <div className='flex items-center space-x-4'>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl font-bold" />
            <p className='font-semibold text-2xl'>Buscar</p>
            <input 
              type="text" 
              className='bg-greyColor rounded-md px-4 py-2' 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder='Buscar por nombre'
            />
          </div>
        </div>
      </div>

      <div className='bg-white h-screen overflow-auto'>
        <table className='min-w-full text-m'>
          <thead>
            <tr>
              <th className='border border-black px-4 py-2 text-left'>Nombre del proveedor</th>
              <th className='border border-black px-4 py-2 text-left'>Producto(s)</th>
              <th className='border border-black px-4 py-2 text-left'>Teléfono</th>
              <th className='border border-black px-4 py-2 text-left'>Información extra</th>
              <th className='border border-black px-4 py-2 text-left'></th>
            </tr>
          </thead>
          <tbody>
            {filteredProveedores.length > 0 ? (
              filteredProveedores.map((proveedor) => (
                <tr key={proveedor._id}>
                  <td className='border border-black px-4 py-2'>{proveedor.nombreProveedor}</td>
                  <td className='border border-black px-4 py-2'>{proveedor.productos}</td>
                  <td className='border border-black px-4 py-2'>{proveedor.telefono}</td>
                  <td className='border border-black px-4 py-2'>{proveedor.infoExtra}</td>
                  <td className='border border-black px-4 py-2'>
                        <button className='transition-all duration-300 hover:scale-110'>
                            <FontAwesomeIcon icon={faPen} className="mr-2 text-2xl font-bold" />
                        </button>
                        <button className='transition-all duration-300 hover:scale-110'>
                            <FontAwesomeIcon icon={faTrash} className="ml-3 text-2xl font-bold" />
                        </button>
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">No hay proveedores para mostrar</td>
              </tr>
            )}
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

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

export default App;
