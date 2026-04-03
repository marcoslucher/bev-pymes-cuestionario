import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Cuestionario from './pages/Cuestionario.jsx'
import Gracias from './pages/Gracias.jsx'
import Admin from './pages/Admin.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta principal con código de empresa en URL */}
        <Route path="/empresa/:codigo" element={<App />} />
        {/* Ruta demo — no almacena respuestas */}
        <Route path="/demo" element={<App demo={true} />} />
        {/* Cuestionarios por versión */}
        <Route path="/d/:codigo" element={<Cuestionario version="D" />} />
        <Route path="/mi/:codigo" element={<Cuestionario version="MI" />} />
        <Route path="/eo/:codigo" element={<Cuestionario version="EO" />} />
        {/* Demo cuestionarios */}
        <Route path="/demo/d" element={<Cuestionario version="D" demo={true} />} />
        <Route path="/demo/mi" element={<Cuestionario version="MI" demo={true} />} />
        <Route path="/demo/eo" element={<Cuestionario version="EO" demo={true} />} />
        {/* Otras páginas */}
        <Route path="/gracias" element={<Gracias />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
