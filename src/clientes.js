import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from "./components/Header";
import Footer from "./components/Footer";
import ClienteModal from './components/ClienteModal'; // Cambia el nombre del modal si es necesario
import { faHome, faMagnifyingGlass, faPen, faTrash, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function HomePage() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCliente, setEditCliente] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/clientes');
        setClientes(response.data);
      } catch (error) {
        console.error('Error al obtener los clientes', error);
      }
    };

    fetchClientes();
  }, [location.search]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este cliente?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/clientes/${id}`);
        setClientes(clientes.filter(cliente => cliente._id !== id));
      } catch (error) {
        console.error('Error al eliminar el cliente', error);
      }
    }
  };

  const handleSave = async (cliente) => {
    if (editCliente) {
      // Editar cliente existente
      try {
        const response = await axios.put(`http://localhost:5000/api/clientes/${editCliente._id}`, cliente);
        setClientes(clientes.map(c => c._id === editCliente._id ? response.data : c));
      } catch (error) {
        console.error('Error al editar el cliente', error);
      }
    } else {
      // Crear nuevo cliente
      try {
        const response = await axios.post('http://localhost:5000/api/clientes', cliente);
        setClientes([...clientes, response.data]);
      } catch (error) {
        console.error('Error al crear el cliente', error);
      }
    }
  };

  const openModal = () => {
    setEditCliente(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cliente) => {
    setEditCliente(cliente);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditCliente(null);
  };

  const filteredClientes = clientes.filter(cliente => {
    const nombreString = String(cliente.nombre).toLowerCase();
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
              onClick={openModal}
              className='bg-white font-semibold text-3xl px-8 py-5 flex items-center transition-all duration-300 hover:scale-110'
            >
              <FontAwesomeIcon icon={faUserPlus} className="mr-2 text-4xl font-bold" />
              Nuevo Cliente
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
              <th className='border border-black px-4 py-2 text-left'>Nombre</th>
              <th className='border border-black px-4 py-2 text-left'>Teléfono</th>
              <th className='border border-black px-4 py-2 text-left'>Notas</th>
              <th className='border border-black px-4 py-2 text-left'>Fecha de Registro</th>
              <th className='border border-black px-4 py-2 text-left'></th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => (
                <tr key={cliente._id}>
                  <td className='border border-black px-4 py-2'>{cliente.nombreCliente}</td>
                  <td className='border border-black px-4 py-2'>{cliente.telefono}</td>
                  <td className='border border-black px-4 py-2'>{cliente.notas || "Sin notas"}</td>
                  <td className='border border-black px-4 py-2'>{new Date(cliente.fechaRegistro).toLocaleDateString()}</td>
                  <td className='border border-black px-4 py-2'>
                    <button 
                      onClick={() => openEditModal(cliente)}
                      className='transition-all duration-300 hover:scale-110'>
                      <FontAwesomeIcon icon={faPen} className="mr-2 text-2xl font-bold" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cliente._id)}
                      className='transition-all duration-300 hover:scale-110'>
                      <FontAwesomeIcon icon={faTrash} className="ml-3 text-2xl font-bold" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">No hay clientes para mostrar</td>
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

      <ClienteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        cliente={editCliente}
      />

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