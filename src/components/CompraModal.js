import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';

const CompraModal = ({ isOpen, onClose, onSave, compra }) => {
  const [productos, setProductos] = useState([{ producto: null, cantidad: '' }, { producto: null, cantidad: '' }]);
  const [proveedor, setProveedor] = useState(null);
  const [fecha, setFecha] = useState('');
  const [allProductos, setAllProductos] = useState([]);
  const [allProveedores, setAllProveedores] = useState([]);
  const [totalCompra, setTotalCompra] = useState(0);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setAllProductos(response.data.map(product => ({ value: product._id, label: product.nombre, precioProveedor: product.precioProveedor })));
      } catch (error) {
        console.error('Error al obtener los productos', error);
      }
    };

    const fetchProveedores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/proveedores');
        setAllProveedores(response.data.map(proveedor => ({ value: proveedor._id, label: proveedor.nombreProveedor })));
      } catch (error) {
        console.error('Error al obtener los proveedores', error);
      }
    };

    fetchProductos();
    fetchProveedores();
  }, []);

  useEffect(() => {
    if (compra) {
      setProductos(compra.productos.map(p => ({
        producto: allProductos.find(prod => prod.value === p.producto),
        cantidad: p.cantidad
      })));
      setProveedor(allProveedores.find(p => p.value === compra.proveedor));
      setFecha(compra.fecha.split('T')[0]);
      calculateTotal(compra.productos);
    } else {
      setProductos([{ producto: null, cantidad: '' }, { producto: null, cantidad: '' }]);
      setProveedor(null);
      setFecha(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
      setTotalCompra(0);
    }
  }, [compra, allProductos, allProveedores]);

  useEffect(() => {
    if (!compra && isOpen) {
      setProductos([{ producto: null, cantidad: '' }, { producto: null, cantidad: '' }]);
      setProveedor(null);
      setFecha(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
      setTotalCompra(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleProductoChange = (index, selectedProducto) => {
    const newProductos = [...productos];
    newProductos[index].producto = selectedProducto;
    setProductos(newProductos);
    calculateTotal(newProductos);
  };

  const handleCantidadChange = (index, cantidad) => {
    const newProductos = [...productos];
    newProductos[index].cantidad = cantidad;
    setProductos(newProductos);
    calculateTotal(newProductos);
  };

  const addProducto = () => {
    setProductos([...productos, { producto: null, cantidad: '' }]);
  };

  const removeProducto = (index) => {
    const newProductos = productos.filter((_, i) => i !== index);
    setProductos(newProductos);
    calculateTotal(newProductos);
  };

  const calculateTotal = (productos) => {
    const total = productos.reduce((acc, p) => {
      const precio = p.producto ? p.producto.precioProveedor : 0;
      return acc + (precio * p.cantidad);
    }, 0);
    setTotalCompra(total);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newCompra = {
      productos: productos.map(p => ({ producto: p.producto.value, cantidad: p.cantidad })),
      proveedor: proveedor.value,
      fecha
    };
    try {
      await axios.post('http://localhost:5000/api/compras', newCompra);
      setConfirmationMessage(compra ? 'Compra editada satisfactoriamente' : 'Compra creada satisfactoriamente');
      setTimeout(() => {
        setConfirmationMessage('');
        onClose();
      }, 900); // Ocultar el mensaje después de 3 segundos
    } catch (error) {
      console.error('Error al guardar la compra', error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '300px', // Ancho mínimo del Select
    }),
    menu: (provided) => ({
      ...provided,
      minWidth: '300px', // Ancho mínimo del menú desplegable
    }),
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex="-1"
      ref={modalRef}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl h-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">{compra ? 'Editar Compra' : 'Nueva Compra'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xl font-medium text-gray-700" htmlFor="proveedor-select">Proveedor</label>
              <Select
                id="proveedor-select"
                value={proveedor}
                onChange={setProveedor}
                options={allProveedores}
                placeholder="Buscar proveedor"
                className="mt-1"
                classNamePrefix="react-select"
                isClearable
                styles={customStyles}
                aria-label="Seleccionar proveedor"
              />
            </div>
            <div>
              <label className="block text-xl font-medium text-gray-700" htmlFor="fecha-input">Fecha</label>
              <input
                id="fecha-input"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
                aria-label="Seleccionar fecha"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((p, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={p.producto}
                        onChange={(selectedProducto) => handleProductoChange(index, selectedProducto)}
                        options={allProductos}
                        placeholder="Buscar producto"
                        className="mt-1"
                        classNamePrefix="react-select"
                        isClearable
                        styles={customStyles}
                        aria-label={`Seleccionar producto ${index + 1}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={p.cantidad}
                        onChange={(e) => handleCantidadChange(index, Math.max(0, e.target.value))}
                        required
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
                        aria-label={`Cantidad del producto ${index + 1}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.producto ? `$${p.producto.precioProveedor.toFixed(2)}` : '$0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.producto ? `$${(p.producto.precioProveedor * p.cantidad).toFixed(2)}` : '$0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => removeProducto(index)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        aria-label={`Eliminar producto ${index + 1}`}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addProducto}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-8"
            aria-label="Añadir producto"
          >
            Añadir Producto
          </button>
          <div>
            <label className="block text-xl font-medium text-gray-700" htmlFor="total-compra">Total de la Compra</label>
            <input
              id="total-compra"
              type="text"
              value={`$${totalCompra.toFixed(2)}`}
              readOnly
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl bg-gray-100"
              aria-label="Total de la compra"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              aria-label={compra ? 'Guardar cambios' : 'Crear compra'}
            >
              {compra ? 'Guardar Cambios' : 'Crear Compra'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
          </div>
        </form>
        {confirmationMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
            {confirmationMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompraModal;