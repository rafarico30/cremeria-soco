import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProveedorModal from './components/ProveedorModal';
import CompraModal from './components/CompraModal';
import { faHome, faPeopleCarryBox, faMagnifyingGlass, faPen, faTrash, faCartPlus} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function HomePage() {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProveedor, setEditProveedor] = useState(null);
  const [editCompra, setEditCompra] = useState(null);
  const [isCompraModalOpen, setIsCompraModalOpen] = useState(false);
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

    fetchProveedores();
    fetchProductos();
  }, [location.search]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este proveedor?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/proveedores/${id}`);
        setProveedores(proveedores.filter(proveedor => proveedor._id !== id));
      } catch (error) {
        console.error('Error al eliminar el proveedor', error);
      }
    }
  };

  const handleSaveCompra = async (compra) => {
    // Lógica para guardar la compra
    try {
      const response = await axios.post('http://localhost:5000/api/compras', compra);
      // Aquí puedes actualizar el estado de compras si lo necesitas
      console.log('Compra guardada:', response.data);
    } catch (error) {
      console.error('Error al guardar la compra', error);
    }
  };

  const handleSave = async (proveedor) => {
    if (editProveedor) {
      // Editar proveedor existente
      try {
        const response = await axios.put(`http://localhost:5000/api/proveedores/${editProveedor._id}`, proveedor);
        setProveedores(proveedores.map(p => p._id === editProveedor._id ? response.data : p));
      } catch (error) {
        console.error('Error al editar el proveedor', error);
      }
    } else {
      // Crear nuevo proveedor
      try {
        const response = await axios.post('http://localhost:5000/api/proveedores', proveedor);
        setProveedores([...proveedores, response.data]);
      } catch (error) {
        console.error('Error al crear el proveedor', error);
      }
    }
  };

  const openModal = () => {
    setEditProveedor(null);
    setIsModalOpen(true);
  };

  const openEditModal = (proveedor) => {
    setEditProveedor(proveedor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProveedor(null);
  };
  
  const openCompraModal = () => {
    setEditCompra(null);
    setIsCompraModalOpen(true);
  };

  const closeCompraModal = () => {
    setIsCompraModalOpen(false);
  };

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
        onClick={openModal}
        className='bg-white font-semibold text-3xl px-8 py-5 flex items-center transition-all duration-300 hover:scale-110'
      >
        <FontAwesomeIcon icon={faPeopleCarryBox} className="mr-2 text-4xl font-bold" />
        Nuevo Proveedor
      </button>
      <button
        onClick={openCompraModal}
        className='bg-white font-semibold text-3xl px-8 py-5 flex items-center transition-all duration-300 hover:scale-110'
      >
        <FontAwesomeIcon icon={faCartPlus} className="mr-2 text-4xl font-bold" />
        Agregar producto
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
                  <td className='border border-black px-4 py-2'>
                    {(proveedor.productos || []).map(productId => productos[productId]).join(', ')}
                  </td>
                  <td className='border border-black px-4 py-2'>{proveedor.telefono}</td>
                  <td className='border border-black px-4 py-2'>
                    {proveedor.infoExtra ? proveedor.infoExtra : "Sin información"}
                  </td>
                  <td className='border border-black px-4 py-2'>
                        <button 
                        onClick={() => openEditModal(proveedor)}
                        className='transition-all duration-300 hover:scale-110'>
                            <FontAwesomeIcon icon={faPen} className="mr-2 text-2xl font-bold" />
                        </button>
                        <button 
                        onClick={() => handleDelete(proveedor._id)}
                        className='transition-all duration-300 hover:scale-110'>
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

      <ProveedorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        proveedor={editProveedor}
      />

      <CompraModal
        isOpen={isCompraModalOpen}
        onClose={closeCompraModal}
        onSave={handleSaveCompra}
        compra={editCompra}
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