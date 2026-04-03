import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { DIMENSIONES } from '../items'

const INSTRUCCIONES = {
  D:  'Para cada aspecto, valore la importancia que tiene para la competitividad de su empresa.',
  MI: 'Para cada aspecto, valore la importancia que tiene en el trabajo que usted desempeña en esta empresa.',
  EO: 'Para cada afirmación, valore en qué medida describe lo que ocurre en su empresa.',
}
const ANCLAJES = {
  D:  { izq: '1 — Ninguna importancia', der: '7 — Máxima importancia' },
  MI: { izq: '1 — Ninguna importancia', der: '7 — Máxima importancia' },
  EO: { izq: '1 — No describe nada mi empresa', der: '7 — Describe muy bien mi empresa' },
}
const VERSION_LABEL = {
  D: 'Versión Dirección', MI: 'Versión Mandos Intermedios', EO: 'Versión Empleados Operativos'
}
const BADGE = { D: 'badge-d', MI: 'badge-mi', EO: 'badge-eo' }
const DIM_KEYS = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']

export default function Cuestionario({ version }) {
  const { codigo } = useParams()
  const navigate = useNavigate()

  const [empresa, setEmpresa] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [paso, setPaso] = useState(0) // 0 = datos clasificación, 1-10 = dimensiones
  const [respuestas, setRespuestas] = useState({})
  const [datos, setDatos] = useState({ sector: '', empleados: '' })
  const [errorEnvio, setErrorEnvio] = useState('')

  useEffect(() => {
    const verificar = async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('codigo, nombre, estrato, sector, empleados')
        .eq('codigo', codigo.toUpperCase())
        .single()

      if (error || !data) {
        navigate('/')
        return
      }
      setEmpresa(data)
      setDatos({ sector: data.sector || '', empleados: data.empleados || '' })
      setCargando(false)
    }
    verificar()
  }, [codigo, navigate])

  if (cargando) return (
    <div className="contenedor">
      <div className="tarjeta">
        <div className="tarjeta-cuerpo cargando">
          <div className="spinner"></div>
          <p>Verificando código de empresa...</p>
        </div>
      </div>
    </div>
  )

  const dimActual = paso >= 1 ? DIM_KEYS[paso - 1] : null
  const totalPasos = 11 // 1 datos + 10 dimensiones
  const progreso = (paso / totalPasos) * 100

  const setRespuesta = (dim, idx, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [`${dim}_${idx}`]: valor
    }))
  }

  const getRespuesta = (dim, idx) => respuestas[`${dim}_${idx}`] || 0

  const dimensionCompleta = (dim) => {
    return [1,2,3,4,5,6].every(i => respuestas[`${dim}_${i}`] > 0)
  }

  const handleEnviar = async () => {
    // Verify all dimensions answered
    const incompletas = DIM_KEYS.filter(d => !dimensionCompleta(d))
    if (incompletas.length > 0) {
      setErrorEnvio(`Faltan respuestas en: ${incompletas.map(d => DIMENSIONES[d].nombre).join(', ')}`)
      return
    }

    setEnviando(true)
    setErrorEnvio('')

    // Build row object
    const fila = { empresa_codigo: codigo.toUpperCase() }
    DIM_KEYS.forEach(dim => {
      const n = dim.toLowerCase() // d1, d2...
      ;[1,2,3,4,5,6].forEach(i => {
        fila[`${n}_${i}`] = respuestas[`${dim}_${i}`]
      })
    })

    const tabla = version === 'D' ? 'respuestas_dir' : version === 'MI' ? 'respuestas_mi' : 'respuestas_eo'

    const { error } = await supabase.from(tabla).insert([fila])

    if (error) {
      setErrorEnvio('Error al enviar. Por favor, inténtelo de nuevo.')
      setEnviando(false)
      return
    }

    navigate('/gracias', { state: { version, empresa: empresa.nombre } })
  }

  // ── PASO 0: Datos de clasificación ─────────────────────────────────────────
  if (paso === 0) return (
    <div className="contenedor">
      <div className="tarjeta">
        <div className="cabecera">
          <h1>Estudio BEV — PYMEs Españolas</h1>
          <p>UEMC · {empresa.nombre || codigo}</p>
        </div>
        <div className="tarjeta-cuerpo">
          <span className={`version-badge ${BADGE[version]}`}>{VERSION_LABEL[version]}</span>

          <p style={{ marginBottom: 20, fontSize: '0.92rem', color: '#555e7a' }}>
            Antes de comenzar, confirme o complete los siguientes datos.
            No hay respuestas correctas ni incorrectas.
          </p>

          <div className="datos-form">
            <div className="campo-grupo">
              <label className="campo-label">Sector de actividad</label>
              <input
                type="text"
                className="campo-input"
                value={datos.sector}
                onChange={e => setDatos(p => ({ ...p, sector: e.target.value }))}
                placeholder="Ej: Tecnología, Hostelería, Industria..."
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Número aproximado de empleados</label>
              <input
                type="number"
                className="campo-input"
                value={datos.empleados}
                onChange={e => setDatos(p => ({ ...p, empleados: e.target.value }))}
                placeholder="Ej: 12"
                min="1" max="249"
              />
            </div>
          </div>

          <div style={{
            padding: '12px 16px', background: '#eef3fb',
            borderRadius: 8, fontSize: '0.83rem', color: '#555e7a', marginBottom: 24
          }}>
            El cuestionario tiene <strong>10 secciones</strong> con 6 afirmaciones cada una.
            Tiempo estimado: <strong>
              {version === 'EO' ? '8–12' : '10–14'} minutos
            </strong>.
            Puede pausar y continuar si es necesario.
          </div>

          <div className="botones-nav">
            <button className="btn btn-primario" onClick={() => setPaso(1)}>
              Comenzar cuestionario →
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── PASOS 1–10: Dimensiones ─────────────────────────────────────────────────
  const dim = DIM_KEYS[paso - 1]
  const dimData = DIMENSIONES[dim]
  const items = dimData[version]
  const esUltima = paso === 10

  return (
    <div className="contenedor">
      <div className="tarjeta">
        <div className="cabecera">
          <h1>Estudio BEV — PYMEs Españolas</h1>
          <p>UEMC · {empresa.nombre || codigo} · {VERSION_LABEL[version]}</p>
        </div>
        <div className="tarjeta-cuerpo">
          {/* Progreso */}
          <div className="progreso-texto">Sección {paso} de 10</div>
          <div className="barra-progreso">
            <div className="barra-progreso-inner" style={{ width: `${progreso}%` }}></div>
          </div>

          {/* Título dimensión */}
          <div className="dimension-titulo">{paso}. {dimData.nombre.toUpperCase()}</div>
          <div className="dimension-instruccion">{INSTRUCCIONES[version]}</div>

          {/* Nota D10 */}
          {dim === 'D10' && (
            <div className="nota-dimension">
              Nota: Si su empresa no tiene actividad internacional actual, valore la importancia
              que la internacionalización tiene o debería tener como objetivo estratégico.
            </div>
          )}

          {/* Ítems */}
          {items.map((texto, idx) => {
            const n = idx + 1
            const val = getRespuesta(dim, n)
            return (
              <div key={n} className="item-bloque">
                <div className="item-texto">
                  <span className="item-numero">{n}.</span>{texto}
                </div>
                <div className="likert">
                  {[1,2,3,4,5,6,7].map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`likert-btn ${val === v ? 'seleccionado' : ''}`}
                      onClick={() => setRespuesta(dim, n, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="likert-anclajes">
                  <span>{ANCLAJES[version].izq}</span>
                  <span>{ANCLAJES[version].der}</span>
                </div>
              </div>
            )
          })}

          {errorEnvio && (
            <div style={{ color: '#e53e3e', fontSize: '0.88rem', marginTop: 12 }}>
              ⚠ {errorEnvio}
            </div>
          )}

          {/* Navegación */}
          <div className="botones-nav">
            <button
              className="btn btn-secundario"
              onClick={() => setPaso(p => p - 1)}
            >
              ← Anterior
            </button>
            {!esUltima ? (
              <button
                className="btn btn-primario"
                onClick={() => setPaso(p => p + 1)}
                disabled={!dimensionCompleta(dim)}
              >
                Siguiente →
              </button>
            ) : (
              <button
                className="btn btn-primario"
                onClick={handleEnviar}
                disabled={!dimensionCompleta(dim) || enviando}
                style={{ background: enviando ? '#d1d9e6' : '#1a7a4a' }}
              >
                {enviando ? 'Enviando...' : '✓ Enviar respuestas'}
              </button>
            )}
          </div>

          {!dimensionCompleta(dim) && (
            <p style={{ fontSize: '0.78rem', color: '#555e7a', marginTop: 10, textAlign: 'center' }}>
              Responde todas las afirmaciones de esta sección para continuar.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
