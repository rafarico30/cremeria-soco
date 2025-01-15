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

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
  
    const productData = {
      nombre: formData.get('name'),
      descripcion: formData.get('description'),
      precio: formData.get('price'),
      stock: formData.get('stock'),
      categoria: formData.get('category'),
      ventaPorPieza: formData.get('ventaPorPieza') === 'pieza', // Esto dependerá de tu lógica
    };
    

    const productExists = products.some(existingProduct => 
      existingProduct.nombre.toLowerCase() === productData.nombre.toLowerCase() && 
      existingProduct._id !== (editProduct ? editProduct._id : null)
    );

    if (productExists) {
      setErrorMessage('El producto ya existe.'); // Mostrar error si el producto ya está en la lista
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return; // Salir de la función para no continuar con la creación del producto
    }


    
    if (editProduct) {
      try {
        await axios.put(`http://localhost:5000/api/products/${editProduct._id}`, productData);
        setProducts(products.map(product =>
          product._id === editProduct._id ? { ...product, ...productData } : product
        ));
        setConfirmationMessage('Producto actualizado correctamente');
      } catch (error) {
        console.error('Error al actualizar el producto', error);
      }
    } else {
      // Crear nuevo producto
      try {
        const response = await axios.post('http://localhost:5000/api/products', productData);
        setProducts([...products, response.data]);
        setConfirmationMessage('Producto creado correctamente');
      } catch (error) {
        console.error('Error al agregar el producto', error);
      }
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
                  <td className={`border border-black px-4 py-2 ${product.stock === 0 ? 'text-red-500 font-bold' : ''}`}>
                    {product.stock}
                  </td>
                  <td className='border border-black px-4 py-2'>
                    <button onClick={() => openEditModal(product)} className='transition-all duration-300 hover:scale-110'>
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
            <h2 className="text-xl font-bold mb-4">{editProduct ? 'Editar Producto' : 'Agregar Producto'}</h2>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={editProduct ? editProduct.nombre : ''}
                  className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="description">Descripción</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  defaultValue={editProduct ? editProduct.descripcion : ''}
                  className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="price">Precio</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  defaultValue={editProduct ? editProduct.precio : ''}
                  onChange={(e) => setPrecio(Math.max(0, e.target.value))}
                  className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="stock">Stock</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  defaultValue={editProduct ? editProduct.stock : ''}
                  className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2" htmlFor="ventaPorPieza">Se vende por:</label>
                <select
                  id="ventaPorPieza"
                  name="ventaPorPieza"
                  defaultValue={editProduct ? editProduct.ventaPorPieza: ''}
                  className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                >
                  <option value="pieza">Pieza</option>
                  <option value="kilogramos">Kilogramos</option>
                </select>
              </div>
              
              <div className="mb-4">
                    <label className="block text-lg font-semibold mb-2" htmlFor="category">Categoría</label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={editProduct ? editProduct.categoria : ''}
                      className="w-full bg-greyColor rounded-md px-4 py-2 border border-gray-300"
                      required // Puedes hacer este campo requerido si es necesario
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
