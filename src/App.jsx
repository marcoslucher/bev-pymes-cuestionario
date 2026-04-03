import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

const VERSION_LABELS = {
  D:  { label: 'Versión Dirección',           badge: 'badge-d',  desc: 'Para directivo-propietario o gerente' },
  MI: { label: 'Versión Mandos Intermedios',   badge: 'badge-mi', desc: 'Para responsable de área o jefe de equipo' },
  EO: { label: 'Versión Empleados Operativos', badge: 'badge-eo', desc: 'Para empleados sin responsabilidades directivas' },
}

export default function App() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [version, setVersion] = useState('D')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cod = codigo.trim().toUpperCase()
    if (!cod) { setError('Introduce el código de tu empresa.'); return }

    setCargando(true)
    setError('')

    const { data, error: err } = await supabase
      .from('empresas')
      .select('codigo, estrato')
      .eq('codigo', cod)
      .single()

    setCargando(false)

    if (err || !data) {
      setError('Código no encontrado. Compruébalo e inténtalo de nuevo.')
      return
    }

    const ruta = version === 'D' ? `/d/${cod}` : version === 'MI' ? `/mi/${cod}` : `/eo/${cod}`
    navigate(ruta)
  }

  return (
    <div className="contenedor">
      <div className="tarjeta">
        <div className="cabecera">
          <h1>Estudio sobre alineamiento estratégico en PYMEs españolas</h1>
          <p>Universidad Europea Miguel de Cervantes (UEMC) · TFG Ingeniería de Organización Industrial</p>
        </div>
        <div className="tarjeta-cuerpo">
          <div className="inicio-hero">
            <h2>Bienvenido/a al cuestionario</h2>
            <p>
              Para comenzar, selecciona qué versión del cuestionario te corresponde
              e introduce el código de empresa que te ha facilitado el investigador.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Selector de versión */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, textAlign: 'left' }}>
                {Object.entries(VERSION_LABELS).map(([v, info]) => (
                  <label key={v} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                    border: `2px solid ${version === v ? '#1e3a5f' : '#d1d9e6'}`,
                    background: version === v ? '#eef3fb' : '#fff',
                    transition: 'all 0.15s'
                  }}>
                    <input
                      type="radio" name="version" value={v}
                      checked={version === v}
                      onChange={() => setVersion(v)}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{info.label}</div>
                      <div style={{ fontSize: '0.80rem', color: '#555e7a' }}>{info.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Código empresa */}
              <div style={{ marginBottom: 8 }}>
                <label className="campo-label" style={{ textAlign: 'left', display: 'block', marginBottom: 8 }}>
                  Código de empresa
                </label>
                <input
                  type="text"
                  className={`input-codigo ${error ? 'error' : ''}`}
                  value={codigo}
                  onChange={e => { setCodigo(e.target.value.toUpperCase()); setError('') }}
                  placeholder="Ej: GES001"
                  maxLength={10}
                  autoComplete="off"
                />
              </div>
              <div className="error-msg">{error}</div>

              <button
                type="submit"
                className="btn btn-primario"
                disabled={cargando}
                style={{ width: '100%', maxWidth: 280 }}
              >
                {cargando ? 'Verificando...' : 'Comenzar cuestionario →'}
              </button>
            </form>

            <div style={{
              marginTop: 32, padding: '16px 20px',
              background: '#f5f7fa', borderRadius: 8,
              fontSize: '0.82rem', color: '#555e7a', textAlign: 'left'
            }}>
              <strong>Confidencialidad:</strong> Sus respuestas son anónimas y se tratarán de forma
              agregada con arreglo al RGPD (UE) 2016/679. El tiempo estimado es de 8–14 minutos.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
