import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from "./components/Header";
import Footer from "./components/Footer";
import EmpleadoModal from './components/EmpleadoModal';
import { faHome, faPeopleCarryBox, faMagnifyingGlass, faPen, faTrash, faUserPlus} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function HomePage() {
  const [empleados, setEmpleados] = useState([]);
  const [productos, setProductos] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEmpleado, setEditEmpleado] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/empleados');
        setEmpleados(response.data);
      } catch (error) {
        console.error('Error al obtener los empleados', error);
      }
    };

    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        const productosMap = response.data.reduce((acc, product) => {
          acc[product._id] = product.nombre;
          return acc;
        }, {});
        setProductos(productosMap);
      } catch (error) {
        console.error('Error al obtener los productos', error);
      }
    };

    fetchEmpleados();
    fetchProductos();
  }, [location.search]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este empleado?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/empleados/${id}`);
        setEmpleados(empleados.filter(empleado => empleado._id !== id));
      } catch (error) {
        console.error('Error al eliminar el empleado', error);
      }
    }
  };

  const handleSave = async (empleado) => {
    if (editEmpleado) {
      // Editar empleado existente
      try {
        const response = await axios.put(`http://localhost:5000/api/empleados/${editEmpleado._id}`, empleado);
        setEmpleados(empleados.map(p => p._id === editEmpleado._id ? response.data : p));
      } catch (error) {
        console.error('Error al editar el empleado', error);
      }
    } else {
      // Crear nuevo empleado
      try {
        const response = await axios.post('http://localhost:5000/api/empleados', empleado);
        setEmpleados([...empleados, response.data]);
      } catch (error) {
        console.error('Error al crear el empleado', error);
      }
    }
  };

  const openModal = () => {
    setEditEmpleado(null);
    setIsModalOpen(true);
  };

  const openEditModal = (empleado) => {
    setEditEmpleado(empleado);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditEmpleado(null);
  };
  


  const filteredEmpleados = empleados.filter(empleado => {
    const nombreString = String(empleado.nombreEmpleado).toLowerCase();
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
              Nuevo Empleado
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
              <th className='border border-black px-4 py-2 text-left'>Nombre del empleado</th>
              <th className='border border-black px-4 py-2 text-left'>Puesto</th>
              <th className='border border-black px-4 py-2 text-left'>Teléfono</th>
              <th className='border border-black px-4 py-2 text-left'>Información extra</th>
              <th className='border border-black px-4 py-2 text-left'>Fecha de ingreso</th>
              <th className='border border-black px-4 py-2 text-left'></th>
            </tr>
          </thead>
          <tbody>
            {filteredEmpleados.length > 0 ? (
              filteredEmpleados.map((empleado) => (
                <tr key={empleado._id}>
                  <td className='border border-black px-4 py-2'>{empleado.nombreEmpleado}</td>
                  <td className='border border-black px-4 py-2'>{empleado.puesto}</td>
                  <td className='border border-black px-4 py-2'>{empleado.telefono}</td>
                  <td className='border border-black px-4 py-2'>
                    {empleado.infoExtra ? empleado.infoExtra : "Sin información"}
                  </td>
                  <td className='border border-black px-4 py-2'>{new Date(empleado.fechaDeIngreso).toLocaleDateString()}</td>
                  <td className='border border-black px-4 py-2'>
                        <button 
                        onClick={() => openEditModal(empleado)}
                        className='transition-all duration-300 hover:scale-110'>
                            <FontAwesomeIcon icon={faPen} className="mr-2 text-2xl font-bold" />
                        </button>
                        <button 
                        onClick={() => handleDelete(empleado._id)}
                        className='transition-all duration-300 hover:scale-110'>
                            <FontAwesomeIcon icon={faTrash} className="ml-3 text-2xl font-bold" />
                        </button>
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">No hay empleados para mostrar</td>
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

      <EmpleadoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        empleado={editEmpleado}
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
