import React, { useState, useEffect } from 'react';

const EmpleadoModal = ({ isOpen, onClose, onSave, empleado }) => {
  const [nombreEmpleado, setNombreEmpleado] = useState('');
  const [puesto, setPuesto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [infoExtra, setInfoExtra] = useState('');
  const [fechaDeIngreso, setFechaDeIngreso] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (empleado) {
      setNombreEmpleado(empleado.nombreEmpleado);
      setPuesto(empleado.puesto);
      setTelefono(empleado.telefono);
      setInfoExtra(empleado.infoExtra);
      setFechaDeIngreso(empleado.fechaDeIngreso ? empleado.fechaDeIngreso.split('T')[0] : '');
    } else {
      setNombreEmpleado('');
      setPuesto('');
      setTelefono('');
      setInfoExtra('');
      setFechaDeIngreso('');
    }
  }, [empleado]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(telefono)) {
      setErrorMessage('El número de teléfono debe tener 10 dígitos.');
      return;
    }
    const newEmpleado = {
      nombreEmpleado,
      puesto,
      telefono,
      infoExtra,
      fechaDeIngreso
    };
    try {
      await onSave(newEmpleado);
      setConfirmationMessage(empleado ? 'Empleado editado satisfactoriamente' : 'Empleado creado satisfactoriamente');
      setTimeout(() => {
        setConfirmationMessage('');
        onClose();
      }, 800); // Ocultar el mensaje después de 3 segundos
    } catch (error) {
      setErrorMessage('Error al guardar el empleado.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6">{empleado ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xl font-medium text-gray-700">Nombre
            <span className='text-red-600' title='Este campo es requerido'>*</span>:</label>
            <input
              type="text"
              value={nombreEmpleado}
              onChange={(e) => setNombreEmpleado(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
            />
          </div>
          <div>
            <label className="block text-xl font-medium text-gray-700">Puesto
            <span className='text-red-600' title='Este campo es requerido'>*</span>:</label>
            <input
              type="text"
              value={puesto}
              onChange={(e) => setPuesto(e.target.value)}
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
            <label className="block text-xl font-medium text-gray-700">Fecha de Ingreso
            <span className='text-red-600' title='Este campo es requerido'>*</span>:</label>
            <input
              type="date"
              value={fechaDeIngreso}
              onChange={(e) => setFechaDeIngreso(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xl"
            />
          </div>
          <div>
            <label className="block text-xl font-medium text-gray-700">Información Extra:</label>
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
              className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {empleado ? 'Guardar Cambios' : 'Crear Empleado'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpleadoModal;