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
        <Route path="/" element={<App />} />
        <Route path="/d/:codigo" element={<Cuestionario version="D" />} />
        <Route path="/mi/:codigo" element={<Cuestionario version="MI" />} />
        <Route path="/eo/:codigo" element={<Cuestionario version="EO" />} />
        <Route path="/gracias" element={<Gracias />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
