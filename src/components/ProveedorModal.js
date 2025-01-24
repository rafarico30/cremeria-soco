import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const ProveedorModal = ({ isOpen, onClose, onSave, proveedor }) => {
  const [nombreProveedor, setNombreProveedor] = useState('');
  const [productos, setProductos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [infoExtra, setInfoExtra] = useState('');
  const [allProductos, setAllProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setAllProductos(response.data.map(product => ({ value: product._id, label: product.nombre })));
      } catch (error) {
        console.error('Error al obtener los productos', error);
      }
    };

    fetchProductos();
  }, []);

  useEffect(() => {
    if (proveedor) {
      setNombreProveedor(proveedor.nombreProveedor);
      setProductos(proveedor.productos.map(product => ({ value: product._id, label: product.nombre })));
      setTelefono(proveedor.telefono);
      setInfoExtra(proveedor.infoExtra);
    } else {
      setNombreProveedor('');
      setProductos([]);
      setTelefono('');
      setInfoExtra('');
    }
  }, [proveedor]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newProveedor = {
        nombreProveedor,
        productos: productos.map(product => product.value), // Enviar solo los IDs
        telefono,
        infoExtra
      };
    await onSave(newProveedor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6">{proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xl font-medium text-gray-700">Nombre
            <span className='text-red-600' title='Este campo es requerido'>*</span>:</label>
            <input
              type="text"
              value={nombreProveedor}
              onChange={(e) => setNombreProveedor(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
            />
          </div>
          <div>
            <label className="block text-xl font-medium text-gray-700">Productos
            <span className='text-red-600' title='Este campo es requerido'>*</span>:</label>
            <Select
              isMulti
              value={productos}
              onChange={setProductos}
              options={allProductos}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
            />
          </div>
          <div>
            <label className="block text-xl font-medium text-gray-700">Teléfono
            <span className='text-red-600' title='Este campo es requerido'>*</span>:</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
            />
          </div>
          <div>
            <label className="block text-xl font-medium text-gray-700">Información Extra (Opcional):</label>
            <input
              type="text"
              value={infoExtra}
              onChange={(e) => setInfoExtra(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="bg-green-500 text-white font-bold px-6 py-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-xl"
            >
              {proveedor ? 'Guardar Cambios' : 'Crear Proveedor'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white font-bold px-6 py-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-xl"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProveedorModal;