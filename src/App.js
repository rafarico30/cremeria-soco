import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Inventory from './inventory'; 
import Empleados from './empleados';
import List from './List';
import Ventas from './ventas'
import Proveedores from './proveedores'
import Reportes from './reportes'
import './App.css';
import axios from 'axios';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxesStacked, faCalculator, faXmark, faSearch, faCheese, faCheck, faPeopleCarryBox, faUserTie, faMoneyBillWave} from '@fortawesome/free-solid-svg-icons';

function MainPage() {
  
  const navigate = useNavigate(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(-1);   
  const [searchTerm, setSearchTerm] = useState(''); 
  const [products, setProducts] = useState([]); // Estado para los productos
  const [filteredProducts, setFilteredProducts] = useState([]); // Productos filtrados para mostrar en la búsqueda
  const [selectedProducts, setSelectedProducts] = useState([]); // Productos seleccionados para agregar a la tabla
  const [showSearchResults, setShowSearchResults] = useState(false); // Controlar visibilidad del cuadro de búsqueda
  const [pagoCliente, setPagoCliente] = useState(0);
  const total = selectedProducts.reduce((acc, product) => acc + product.precio * product.cantidad, 0);
  const [cambio, setCambio] = useState(0);
  

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1); // Eliminar el producto del array
    setSelectedProducts(updatedProducts); // Actualizar el estado
  };
  

  const handleEditCantidad = (index, newCantidad) => {
    const cantidad = Number(newCantidad);
    const product = selectedProducts[index];
    const isDecimalAllowed = !product.ventaPorPieza;
  
    if (cantidad > 0 && (isDecimalAllowed || Number.isInteger(cantidad))) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[index].cantidad = cantidad;
      setSelectedProducts(updatedProducts);
    }
  };

  const handleConfirmSale = async () => {
    try {
      // Datos de la venta a enviar al backend
      const saleData = {
        productos: selectedProducts.map(product => ({
          producto: product._id,          // Asegúrate de enviar el ID del producto
          cantidad: product.cantidad,     // Cantidad del producto
          precioUnitario: product.precio, // Asegúrate de enviar el precioUnitario
        })),
        total,
        pagoCliente,
        cambio,
      };
  
      // Llamada a la API para registrar la venta
      const response = await axios.post('http://localhost:5000/api/ventas', saleData);
  
      if (response.status === 201) {
        // Si la venta fue exitosa, limpiar el carrito y otros estados
        
        setSelectedProducts([]);  // Limpiar productos seleccionados
        setPagoCliente(0);        // Limpiar el pago del cliente
        setCambio(0);             // Limpiar el cambio
        alert('Venta realizada con éxito');
      }
    } catch (error) {
      console.error('Error al realizar la venta', error);
      alert('Hubo un problema al procesar la venta');
    }
  };
  
  
  
  const handleCancelSale = () => {
    const confirmCancel = window.confirm("¿Estás seguro de que deseas cancelar la venta?");
  
    if (confirmCancel) {
      setSelectedProducts([]); // Vaciar la lista de productos seleccionados
      setPagoCliente(0); // Restablecer el pago del cliente
      setCambio(0); // Restablecer el cambio
    }
  };

  const handleKeyDown = (e) => {
    if (showSearchResults && filteredProducts.length > 0) {
      if (e.key === 'ArrowDown') {
        setSelectedIndex((prevIndex) => 
          prevIndex < filteredProducts.length - 1 ? prevIndex + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : filteredProducts.length - 1
        );
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        handleProductSelect(filteredProducts[selectedIndex]);
      }
    }
  };
  
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setShowSearchResults(term.trim() !== '');

    if (term.trim() !== '') {
      const filtered = products.filter(product =>
        product.nombre.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleCantidadChange = (e) => {
    const value = e.target.value;
    const isDecimalAllowed = selectedProducts.length > 0 ? !selectedProducts[0].ventaPorPieza : false; // Suponiendo que `ventaPorPieza` es el mismo para todos los productos seleccionados
  
    if (isDecimalAllowed) {
      if (value >= 0) {
        setCantidad(value);
      }
    } else {
      if (Number.isInteger(Number(value)) && value >= 0) {
        setCantidad(value);
      }
    }
  };

  useEffect(() => {
    if (pagoCliente >= total) {
      setCambio(pagoCliente - total);
    } else {
      setCambio(0);
      
    }
  }, [pagoCliente, total]);
  
  const handlePagoClienteChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value.trim() !== '') {
      setPagoCliente(Number(value));
    } else {
      setPagoCliente(0);
    }
  };
  

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredProducts, selectedIndex]);

    
    const handleProductSelect = (product) => {
      const existingProductIndex = selectedProducts.findIndex(p => p._id === product._id);
      const isDecimalAllowed = !product.ventaPorPieza;
    
      if (existingProductIndex !== -1) {
        const updatedProducts = [...selectedProducts];
        const currentProduct = updatedProducts[existingProductIndex];
    
        if (isDecimalAllowed || Number.isInteger(currentProduct.cantidad + cantidad)) {
          currentProduct.cantidad += cantidad;
          setSelectedProducts(updatedProducts);
        }
      } else {
        if (isDecimalAllowed || Number.isInteger(cantidad)) {
          const productWithQuantity = { ...product, cantidad: cantidad };
          setSelectedProducts(prevProducts => [...prevProducts, productWithQuantity]);
        }
      }
    
      setSearchTerm('');
      setShowSearchResults(false);
      setCantidad(product.ventaPorPieza ? 1 : 1.0);
      setSelectedIndex(-1);
    };
    
  


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          params: { searchTerm }
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error al obtener los productos', error);
        alert('Hubo un error al obtener los productos.');
      }
    };

    fetchProducts();
  }, [searchTerm]); 

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F8') {
        openModal();
      } else if (event.key === 'Enter' && isModalOpen) {
        closeModal();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);
  

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null; // Si el modal no está abierto, no se renderiza nada
  
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
          <div className="bg-footColor text-white text-center py-2 rounded-t-lg">
            <h1 className="text-lg font-bold text-black">Cantidad de productos</h1>
          </div>
          <div className="px-6 py-8 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Total a cobrar</h2>
              <p className="text-4xl font-bold text-green-500">${total.toFixed(2)} MXN</p>
              <h2 className="text-xl font-bold">El cliente pagó</h2>
              <input
                type="text"
                className="w-full rounded-full border-2 text-black border-black bg-gray-200 p-2"
                value={pagoCliente}
                onChange={handlePagoClienteChange}
                autoFocus // Opcional: Hace que el input tenga el foco automáticamente al abrir el modal
              />
              <h2 className="text-xl font-bold">Cambio</h2>
              <p className="text-4xl font-bold text-red-600">${cambio.toFixed(2)} MXN</p>
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
                onClick={handleConfirmSale}
              >
                Enter - Confirmar
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
        <Header title="Cremería Soco" />
      <div className="bg-greyColor2 flex justify-center items-center space-x-8 p-4">
        <button 
          className="border-2 border-black rounded-full px-3 py-1 text-black hover:bg-gray-200 transition duration-300 text-lg font-bold"
          onClick={() => navigate('/inventory')}
        >
          Inventario productos
          <FontAwesomeIcon icon={faBoxesStacked} className="ml-3 text-xl" />
        </button>

        <button className="border-2 border-black rounded-full px-16 py-1 text-black hover:bg-gray-200 transition duration-300 text-lg font-bold"
        onClick={() => navigate('/ventas')}
        >
          Ventas
          <FontAwesomeIcon icon={faCalculator} className="ml-4 text-xl" />
        </button>

        <button className="border-2 border-black rounded-full px-16 py-1 text-black hover:bg-gray-200 transition duration-300 text-lg font-bold"
        onClick={() => navigate('/proveedores')}
        >
          Proveedores
          <FontAwesomeIcon icon={faPeopleCarryBox} className="ml-4 text-xl" />
        </button>
        <button className="border-2 border-black rounded-full px-16 py-1 text-black hover:bg-gray-200 transition duration-300 text-lg font-bold"
        onClick={() => navigate('/empleados')}
        >
          Empleados
          <FontAwesomeIcon icon={faUserTie} className="ml-4 text-xl"/>
        </button>
        <button className="border-2 border-black rounded-full px-16 py-1 text-black hover:bg-gray-200 transition duration-300 text-lg font-bold"
        onClick={() => navigate('/reportes')}
        >
          Reportes
          <FontAwesomeIcon icon={faMoneyBillWave} className="ml-4 text-xl" />
        </button>
      </div>

      

      <div className="bg-white border border-black p-4 flex items-center relative">

      <div className="flex items-center ml-6">
        <h2 className="font-bold text-xl">Cantidad:</h2>
        <input 
          type="number" 
          className="border border-black rounded-lg p-2 ml-4 w-20"
          value={cantidad}
          onChange={handleCantidadChange} 
          min="1" 
          step="1"
        />


          <FontAwesomeIcon icon={faCheese} className="ml-2 text-2xl" />
        </div>
        
        <h2 className="font-bold ml-6 text-xl">Nombre del producto:</h2>
        <div className="relative">
          <input 
            type="text" 
            className="border border-black rounded-lg p-2 ml-4"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FontAwesomeIcon icon={faSearch} className="ml-2 text-2xl" />

          {showSearchResults && filteredProducts.length > 0 && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto text-xl">
             {filteredProducts.map((product, index) => (
               <div
               key={product._id}
                className={`p-2 cursor-pointer hover:bg-gray-200 ${selectedIndex === index ? 'bg-gray-300' : ''}`}
                onClick={() => handleProductSelect(product)}
              >
                {product.nombre} - ${product.precio} MXN
              </div>
            ))}

            </div>
          )}
        </div>
      </div>

      <div className="flex-grow bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-xl">
            <thead>
              <tr className="bg-footColor">
                <th className="border border-black p-2">Clave</th>
                <th className="border border-black p-2">Nombre</th>
                <th className="border border-black p-2">Precio</th>
                <th className="border border-black p-2">Cantidad</th>
                <th className="border border-black p-2">Subtotal</th>
              </tr>
            </thead>
                    <tbody>
          {selectedProducts.map((product, index) => (
            <tr key={index}>
              <td className="border border-black p-2">{product.claveProducto}</td>
              <td className="border border-black p-2">{product.nombre}</td>
              <td className="border border-black p-2">${product.precio}</td>

              <td className="border border-black p-2">
                <input
                  type={selectedProducts[0] && !selectedProducts[0].ventaPorPieza ? 'number' : 'number'}
                  step={selectedProducts[0] && !selectedProducts[0].ventaPorPieza ? '0.01' : '1'} 
                  value={product.cantidad}
                  onChange={(e) => handleEditCantidad(index, e.target.value)}
                  min={0}
                />
              </td>

            <td className="border border-black p-2">
            <div className="flex justify-between items-center">
              <span>${(product.precio * product.cantidad).toFixed(2)}</span>
              <button onClick={() => handleRemoveProduct(index)}>
                <FontAwesomeIcon icon={faXmark} className="text-red-600 text-2xl ml-2 transition-transform duration-200 hover:text-red-800 hover:scale-110"  />
              </button>
            </div>
          </td>

          
            </tr>
          ))}
        </tbody>



          </table>
        </div>
      </div>

      
      <div className="bg-greyColor p-4 flex justify-around space-x-20">
      <button
        className="border-2 border-redColor rounded-full px-5 bg-redColor text-black font-bold hover:bg-red-400 hover:border-red-400 transition duration-300"
        onClick={handleCancelSale} 
      >
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
           <p className="font-extrabold text-black text-2xl">${total.toFixed(2)} MXN</p>
          </div>

        </div>
      </div>

    <Footer/>

  
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
      <Route path="/ventas" element={<Ventas/>} />
      <Route path="/proveedores" element={<Proveedores/>} />
      <Route path="/empleados" element={<Empleados/>} />
      <Route path="/reportes" element={<Reportes/>} />
    </Routes>
  );
}

export default App;
