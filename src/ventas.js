  import React, { useState, useEffect } from 'react';
  import { Routes, Route, useNavigate } from 'react-router-dom';
  import './App.css';

  function HomePage() {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
      const fetchVentas = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/ventas'); // Cambia a tu endpoint
          const data = await response.json();
          setVentas(data);
        } catch (err) {
          console.error('Error al obtener las ventas:', err);
        }
      };

      fetchVentas();
    }, []);

    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString();
        setTime(formattedTime);
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      const now = new Date();
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = now.toLocaleDateString('es-ES', options);
      setDate(formattedDate);
    }, []);

    return (
      <div className="App flex flex-col h-screen">
      <header className="fixed top-0 w-full bg-greyColor p-4 z-10"> 
          <div className="flex justify-between items-center">
            <button onClick={() => navigate('/')}>
              <p className="font-lobsterTwo text-letterColor font-extrabold text-5xl">Cremería Soco</p>
            </button>
            <p className="font-lobsterTwo font-semibold text-letterColor text-2xl">{date}</p>
          </div>
        </header>
        
        <div className="bg-white p-4 flex flex-col space-y-4">
          <h2 className="text-redColor text-2xl font-bold">Historial de Ventas</h2>
          {ventas.length === 0 ? (
            <p className="text-greyColor2">No hay ventas registradas.</p>
          ) : (
            <ul className="space-y-2">
              {ventas.map((venta) => (
                <li
                  key={venta._id}
                  className="p-4 bg-greyColor2 rounded-lg shadow-md flex justify-between items-center"
                >
                  <div>
                    <p className="text-letterColor font-bold">Venta ID: {venta._id}</p>
                    <p>Total: <span className="text-priceColor">${venta.total.toFixed(2)}</span></p>
                    <p>Cambio: ${venta.cambio.toFixed(2)}</p>
                    <p>Productos:</p>
                    <ul className="pl-4 list-disc">
                      {venta.productos.map((p, idx) => (
                        <li key={idx}>
                        {p.producto?.nombre || 'Producto desconocido'} - Cantidad: {p.cantidad}
                      </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-black font-bold text-sm">
                    {new Date(venta.fecha).toLocaleString('es-ES')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-greyColor p-4 flex justify-around space-x-20"></div>

            <footer className="fixed bottom-0 w-full bg-footColor p-4">
        <div className="text-right font-bold text-black text-lg">
          {time}
        </div>
      </footer>

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
