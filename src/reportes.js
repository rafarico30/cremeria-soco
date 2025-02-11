import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDownload, faMagnifyingGlass, faArrowTrendUp, faFilter } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import FilterModal from './components/FilterModal';

function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [productos, setProductos] = useState({});
  const [proveedores, setProveedores] = useState({});
  const [showVentas, setShowVentas] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    filterToday: false,
    startTime: '',
    endTime: '',
    selectedProducts: []
  });

  useEffect(() => {
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

    const fetchProveedores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/proveedores');
        const proveedoresMap = response.data.reduce((acc, proveedor) => {
          acc[proveedor._id] = proveedor.nombreProveedor;
          return acc;
        }, {});
        setProveedores(proveedoresMap);
      } catch (error) {
        console.error('Error al obtener los proveedores', error);
      }
    };

    const fetchVentas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ventas');
        const sortedVentas = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setVentas(sortedVentas);
      } catch (error) {
        console.error('Error al obtener las ventas', error);
      }
    };

    const fetchCompras = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/compras');
        const sortedCompras = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setCompras(sortedCompras);
        console.log('Compras:', sortedCompras); // Agregar console.log para verificar los datos de las compras
      } catch (error) {
        console.error('Error al obtener las compras', error);
      }
    };

    fetchProductos();
    fetchProveedores();
    fetchVentas();
    fetchCompras();
  }, []);

  const applyFilters = (filters) => {
    setFilters(filters);
  };

  const filteredVentas = ventas.filter(venta => {
    const nombreString = venta.productos.map(p => productos[p.producto]).join(' ').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = nombreString.includes(searchLower);

    const matchesDate = !filters.startDate || !filters.endDate || (new Date(venta.fecha) >= new Date(filters.startDate) && new Date(venta.fecha) <= new Date(filters.endDate));
    const matchesToday = !filters.filterToday || (new Date(venta.fecha).toDateString() === new Date().toDateString());
    const matchesTime = (!filters.startTime || new Date(venta.fecha).getHours() >= new Date(`1970-01-01T${filters.startTime}:00`).getHours()) &&
                        (!filters.endTime || new Date(venta.fecha).getHours() <= new Date(`1970-01-01T${filters.endTime}:00`).getHours());
    const matchesProducts = filters.selectedProducts.length === 0 || filters.selectedProducts.some(product => venta.productos.some(p => productos[p.producto] === product));

    return matchesSearch && matchesDate && matchesToday && matchesTime && matchesProducts;
  });

  const filteredCompras = compras.filter(compra => {
    const nombreString = compra.productos.map(p => productos[p.producto._id]).join(' ').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = nombreString.includes(searchLower);

    const matchesDate = !filters.startDate || !filters.endDate || (new Date(compra.fecha) >= new Date(filters.startDate) && new Date(compra.fecha) <= new Date(filters.endDate));
    const matchesToday = !filters.filterToday || (new Date(compra.fecha).toDateString() === new Date().toDateString());
    const matchesTime = (!filters.startTime || new Date(compra.fecha).getHours() >= new Date(`1970-01-01T${filters.startTime}:00`).getHours()) &&
                        (!filters.endTime || new Date(compra.fecha).getHours() <= new Date(`1970-01-01T${filters.endTime}:00`).getHours());
    const matchesProducts = filters.selectedProducts.length === 0 || filters.selectedProducts.some(product => compra.productos.some(p => productos[p.producto._id] === product));

    return matchesSearch && matchesDate && matchesToday && matchesTime && matchesProducts;
  });

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="App flex flex-col h-screen">
      <Header title="Cremería Soco" />
      <div className="bg-white p-6 flex justify-between items-center">
        <div className="flex items-center bg-gray-300 rounded-full overflow-hidden p-1">
          <button
            className={`px-6 py-2 text-xl font-semibold transition-all duration-300 rounded-full ${
              showVentas ? 'bg-redColor text-white' : 'text-gray-700'
            }`}
            onClick={() => setShowVentas(true)}
          >
            Ventas
          </button>
          <button
            className={`px-6 py-2 text-xl font-semibold transition-all duration-300 rounded-full ${
              !showVentas ? 'bg-redColor text-white' : 'text-gray-700'
            }`}
            onClick={() => setShowVentas(false)}
          >
            Compras
          </button>
        </div>

        <div className="flex space-x-12">
          <button className="flex items-center text-2xl font-semibold hover:scale-105 transition">
            <FontAwesomeIcon icon={faDownload} className="mr-3 text-3xl" />
            Descargar reportes
          </button>
          <button className="flex items-center text-2xl font-semibold hover:scale-105 transition">
            <FontAwesomeIcon icon={faArrowTrendUp} className="mr-3 text-3xl" />
            Revisar gráficas
          </button>
          <button className="flex items-center text-2xl font-semibold hover:scale-105 transition" onClick={() => setIsFilterModalOpen(true)}>
            <FontAwesomeIcon icon={faFilter} className="mr-3 text-3xl" />
            Filtrar por
          </button>
        </div>
      </div>

      <div className='bg-white h-screen overflow-auto'>
        {showVentas ? (
          <table className='min-w-full text-m'>
            <thead>
              <tr>
                <th className='border border-black px-4 py-2 text-left'>ID de Venta</th>
                <th className='border border-black px-4 py-2 text-left'>Productos</th>
                <th className='border border-black px-4 py-2 text-left'>Total</th>
                <th className='border border-black px-4 py-2 text-left'>Pago del Cliente</th>
                <th className='border border-black px-4 py-2 text-left'>Fecha y hora</th>
              </tr>
            </thead>
            <tbody>
              {filteredVentas.length > 0 ? (
                filteredVentas.map((venta) => (
                  <tr key={venta._id}>
                    <td className='border border-black px-4 py-2'>{venta._id}</td>
                    <td className='border border-black px-4 py-2'>
                      {venta.productos.map(p => {
                        const nombreProducto = productos[p.producto];
                        return p.cantidad > 1 ? `${nombreProducto} (${p.cantidad})` : nombreProducto;
                      }).join(', ')}
                    </td>
                    <td className='border border-black px-4 py-2'>${venta.total ? venta.total.toFixed(2) : 'N/A'}</td>
                    <td className='border border-black px-4 py-2'>${venta.pagoCliente ? venta.pagoCliente.toFixed(2) : 'N/A'}</td>
                    <td className='border border-black px-4 py-2'>{formatDate(venta.fecha)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">No hay ventas para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className='min-w-full text-m'>
            <thead>
              <tr>
                <th className='border border-black px-4 py-2 text-left'>Clave</th>
                <th className='border border-black px-4 py-2 text-left'>Productos</th>
                <th className='border border-black px-4 py-2 text-left'>Total</th>
                <th className='border border-black px-4 py-2 text-left'>Proveedor</th>
                <th className='border border-black px-4 py-2 text-left'>Fecha y hora</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompras.length > 0 ? (
                filteredCompras.map((compra) => (
                  <tr key={compra._id}>
                    <td className='border border-black px-4 py-2'>{compra._id}</td>
                    <td className='border border-black px-4 py-2'>
                      {compra.productos.map(p => {
                        const nombreProducto = productos[p.producto._id];
                        return p.cantidad > 1 ? `${nombreProducto} (${p.cantidad})` : nombreProducto;
                      }).join(', ')}
                    </td>
                    <td className='border border-black px-4 py-2'>${compra.productos.reduce((acc, p) => acc + (p.producto.precioProveedor * p.cantidad), 0).toFixed(2)}</td>
                    <td className='border border-black px-4 py-2'>{proveedores[compra.proveedor._id]}</td>
                    <td className='border border-black px-4 py-2'>{formatDate(compra.fecha)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">No hay compras para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
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
      <FilterModal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        applyFilters={applyFilters}
      />
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