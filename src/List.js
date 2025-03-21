import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Inventory from './inventory';
import List from './List';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { faHome, faCirclePlus, faPeopleCarryBox, faMagnifyingGlass, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [category, setCategory] = useState('');
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromParams = queryParams.get('category');
    setCategory(categoryFromParams || '');

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error al obtener los productos', error);
      }
    };

    fetchProducts();
  }, [location.search]);

  

  const openModal = () => {
    setIsModalOpen(true);
    setEditProduct(null); // Reset edit product on opening the modal
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProduct(null);
  };

  

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        setProducts(products.filter((product) => product._id !== id));
        setConfirmationMessage('Producto eliminado correctamente');
        setTimeout(() => {
          setConfirmationMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
        setErrorMessage('Error al eliminar el producto');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
  
    const esGranel = formData.get('esGranel') === 'on'; // Verificar si es a granel
    const productData = {
      claveProducto: esGranel ? '' : formData.get('claveProducto'), // Dejar vacío si es a granel
      nombre: formData.get('name'),
      descripcion: formData.get('description'),
      precio: formData.get('price'),
      stock: formData.get('stock'),
      categoria: formData.get('category'),
      ventaPorPieza: formData.get('ventaPorPieza') === 'pieza',
      precioProveedor: formData.get('precioProveedor'),
    };
  
    try {
      if (editProduct) {
        // Editar producto existente
        await axios.put(`http://localhost:5000/api/products/${editProduct._id}`, productData);
        setProducts(products.map(product =>
          product._id === editProduct._id ? { ...product, ...productData } : product
        ));
        setConfirmationMessage('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        const response = await axios.post('http://localhost:5000/api/products', productData);
        setProducts([...products, response.data]);
        setConfirmationMessage('Producto creado correctamente');
      }
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      setErrorMessage('Error al guardar el producto');
    }
  
    closeModal();
  
    setTimeout(() => {
      setConfirmationMessage('');
    }, 3000);
  };

  const filteredProducts = products.filter(product => {
    const idString = String(product.id).toLowerCase();
    const nameString = String(product.nombre).toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearchTerm = nameString.includes(searchLower) ||
                              idString.includes(searchLower);
    const matchesCategory = category ? product.categoria.toLowerCase() === category.toLowerCase() : true;

    return matchesSearchTerm && matchesCategory;
  });
  

  return (
    <div className="App flex flex-col h-screen">
       <Header title="Cremería Soco"/>
      {confirmationMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-300">
          {confirmationMessage}
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-300">
          {errorMessage}
        </div>
      )}

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
          </div>

          <div className='flex items-center space-x-4'>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl font-bold" />
            <p className='font-semibold text-2xl'>Buscar</p>
            <input 
              type="text" 
              className='bg-greyColor rounded-md px-4 py-2' 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder='Buscar por nombre o clave'
            />
          </div>
        </div>
      </div>

      <div className='bg-white h-screen overflow-auto'>
        <table className='min-w-full text-m'>
          <thead>
            <tr>
              <th className='border border-black px-4 py-2 text-left'>Clave</th>
              <th className='border border-black px-4 py-2 text-left'>Nombre del producto</th>
              <th className='border border-black px-4 py-2 text-left'>Descripción del producto</th>
              <th className='border border-black px-4 py-2 text-left'>Precio</th>
              <th className='border border-black px-4 py-2 text-left'>Precio Proveedor</th>
              <th className='border border-black px-4 py-2 text-left'>Stock</th>
              <th className='border border-black px-4 py-2 text-left'></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td className='border border-black px-4 py-2'>{product.claveProducto}</td>
                  <td className='border border-black px-4 py-2'>{product.nombre}</td>
                  <td className='border border-black px-4 py-2'>{product.descripcion}</td>
                  <td className='border border-black px-4 py-2'>${product.precio}</td>
                  <td className='border border-black px-4 py-2'>${product.precioProveedor}</td>
                  <td className={`border border-black px-4 py-2 ${product.stock === 0 ? 'text-red-500 font-bold' : ''}`}>
                    {product.stock}
                  </td>
                  <td className='border border-black px-4 py-2'>
                    <button onClick={() => openEditModal(product)} className='transition-all duration-300 hover:scale-110'>
                      <FontAwesomeIcon icon={faPen} className="mr-2 text-2xl font-bold" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)} // Llamar a handleDelete con el _id del producto
                      className='transition-all duration-300 hover:scale-110'
                    >
                      <FontAwesomeIcon icon={faTrash} className="ml-3 text-2xl font-bold" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">No hay productos para mostrar</td>
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

     <Footer/>

     {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg w-1/2">
      <h2 className="text-2xl font-bold mb-4">{editProduct ? 'Editar Producto' : 'Agregar Producto'}</h2>
      <form onSubmit={handleSave}>
      {/* Campo para Clave del Producto */}
      <div className="mb-4">
          <label className="block text-xl font-semibold mb-2" htmlFor="claveProducto">Clave del Producto:</label>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              id="claveProducto"
              name="claveProducto"
              defaultValue={editProduct ? editProduct.claveProducto : ''}
              className="flex-1 bg-white rounded-md px-4 py-2 border border-gray-300 text-xl"
              placeholder="Ingrese la clave o deje vacío"
              disabled={document.getElementById('esGranel')?.checked} // Deshabilitar si el checkbox está marcado
            />
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                id="esGranel"
                name="esGranel"
                className="form-checkbox h-5 w-5 text-blue-600"
                onChange={(e) => {
                  const input = document.getElementById('claveProducto');
                  input.disabled = e.target.checked; // Deshabilitar el campo si el checkbox está marcado
                  if (e.target.checked) input.value = ''; // Limpiar el campo si se selecciona "A granel"
                }}
              />
              <span className="ml-2 text-gray-700">A granel</span>
            </label>
          </div>
        </div>

        {/* Campo para Nombre */}
        <div className="mb-4">
          <label className="block text-xl font-semibold mb-2" htmlFor="name">Nombre<span className="text-red-600" title="Este campo es requerido">*</span>:</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={editProduct ? editProduct.nombre : ''}
            className="w-full bg-white rounded-md px-4 py-2 border border-gray-300 text-xl"
            required
          />
        </div>

        {/* Campo para Descripción */}
        <div className="mb-4">
          <label className="block text-xl font-semibold mb-2" htmlFor="description">Descripción<span className="text-red-600" title="Este campo es requerido">*</span>:</label>
          <input
            type="text"
            id="description"
            name="description"
            defaultValue={editProduct ? editProduct.descripcion : ''}
            className="w-full rounded-md px-4 py-2 border border-gray-300 text-xl"
          />
        </div>

        {/* Campo para Precio */}
        <div className="mb-4">
          <label className="block text-xl font-semibold mb-2" htmlFor="price">Precio<span className="text-red-600" title="Este campo es requerido">*</span>:</label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            defaultValue={editProduct ? editProduct.precio : ''}
            onChange={(e) => setPrecio(Math.max(0, e.target.value))}
            className="w-full bg-white rounded-md px-4 py-2 border border-gray-300 text-xl"
            required
          />
        </div>

        {/* Campo para Precio Proveedor */}
        <div className="mb-4">
          <label className="block text-xl font-semibold mb-2" htmlFor="precioProveedor">Precio Proveedor<span className="text-red-600" title="Este campo es requerido">*</span>:</label>
          <input
            type="number"
            id="precioProveedor"
            name="precioProveedor"
            step="0.01"
            defaultValue={editProduct ? editProduct.precioProveedor : ''}
            onChange={(e) => setPrecio(Math.max(0, e.target.value))}
            className="w-full bg-white rounded-md px-4 py-2 border border-gray-300 text-xl"
            required
          />
        </div>

        {/* Campo para Stock */}
        <div className="mb-4">
          <label className="block text-xl font-semibold mb-2" htmlFor="stock">Stock<span className="text-red-600" title="Este campo es requerido">*</span>:</label>
          <input
            type="number"
            id="stock"
            name="stock"
            defaultValue={editProduct ? editProduct.stock : ''}
            className="w-full bg-white rounded-md px-4 py-2 border border-gray-300 text-xl"
          />
        </div>

        {/* Campo para Venta por Pieza */}
        <div className="mb-4">
          <label className="block text-xl font-semibold mb-2" htmlFor="ventaPorPieza">Se vende por<span className="text-red-600" title="Este campo es requerido">*</span>:</label>
          <select
            id="ventaPorPieza"
            name="ventaPorPieza"
            defaultValue={editProduct ? editProduct.ventaPorPieza : ''}
            className="w-full bg-white rounded-md px-4 py-2 border border-gray-300 text-xl"
          >
            <option value="pieza">Pieza</option>
            <option value="kilogramos">Kilogramos</option>
          </select>
        </div>

        {/* Campo para Categoría */}
        <div className="mb-4">
          <label className="block text-xl font-semibold mb-2" htmlFor="category">Categoría<span className="text-red-600" title="Este campo es requerido">*</span>:</label>
          <select
            id="category"
            name="category"
            defaultValue={editProduct ? editProduct.categoria : ''}
            className="w-full bg-white rounded-md px-4 py-2 border border-gray-300 text-xl"
            required
          >
            <option value="">Seleccionar categoría</option>
            <option value="carnes frias">Carnes frías</option>
            <option value="productos bimbo">Productos Bimbo</option>
            <option value="quesos">Quesos</option>
            <option value="productos lacteos">Productos lácteos</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Botones de Guardar y Cerrar */}
        <div className="flex justify-end space-x-4">
          <button type="submit" className="bg-green-500 text-white font-bold px-6 py-4 rounded hover:bg-green-600 text-lg">
            Guardar
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="bg-redColor text-white font-bold px-6 py-4 rounded hover:bg-red-400 text-lg"
          >
            Cerrar
          </button>
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
