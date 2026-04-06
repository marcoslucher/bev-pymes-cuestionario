import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { DIMENSIONES } from '../items'
import DatosClasificacion from './DatosClasificacion'

const INSTRUCCIONES = {
  D:  'Para cada aspecto, valore la importancia que tiene para la competitividad de su empresa.',
  MI: 'Para cada aspecto, valore la importancia que tiene en el trabajo que usted desempeña en esta empresa.',
  EO: 'Para cada afirmación, valore en qué medida describe lo que ocurre en su empresa.',
}
const ANCLAJES = {
  D:  { izq: 'Ninguna importancia', der: 'Máxima importancia' },
  MI: { izq: 'Ninguna importancia', der: 'Máxima importancia' },
  EO: { izq: 'No describe nada mi empresa', der: 'Describe muy bien mi empresa' },
}
const VERSION_LABEL = {
  D: 'Versión Dirección', MI: 'Versión Mandos Intermedios', EO: 'Versión Empleados Operativos'
}
const BADGE = { D: 'badge-d', MI: 'badge-mi', EO: 'badge-eo' }
const DIM_KEYS = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']

const DEMO_EMPRESA = {
  codigo: 'DEMO', nombre: 'Empresa de demostración',
  estrato: 'B', sector: 'Tecnología e informática', empresa_familiar: 'No'
}

// D10 filter question per version
const D10_FILTER = {
  D:  '¿Su empresa opera únicamente en el mercado local, regional o nacional, sin presencia ni vocación internacional?',
  MI: '¿Su empresa opera únicamente en el mercado local, regional o nacional, sin presencia ni vocación internacional?',
  EO: '¿Su empresa trabaja únicamente con clientes del mercado local, regional o nacional, sin actividad en el exterior?',
}

export default function Cuestionario({ version, demo = false }) {
  const { codigo } = useParams()
  const navigate = useNavigate()

  const [empresa, setEmpresa] = useState(demo ? DEMO_EMPRESA : null)
  const [cargando, setCargando] = useState(!demo)
  const [enviando, setEnviando] = useState(false)
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [nsnc, setNsnc] = useState({})             // NS/NC per item key
  const [d10NoAplica, setD10NoAplica] = useState(null)  // null=no respondido, true/false
  const [datosClasif, setDatosClasif] = useState(null)
  const [disponibilidad, setDisponibilidad] = useState(null)
  const [emailContacto, setEmailContacto] = useState('')
  const [errorEnvio, setErrorEnvio] = useState('')

  useEffect(() => {
    if (demo) return
    const verificar = async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('codigo, nombre, estrato, sector, empleados, empresa_familiar')
        .eq('codigo', codigo.toUpperCase())
        .single()
      if (error || !data) { navigate('/'); return }
      setEmpresa(data)
      setCargando(false)
    }
    verificar()
  }, [codigo, navigate, demo])

  if (cargando) return (
    <div className="contenedor">
      <div className="tarjeta">
        <div className="tarjeta-cuerpo cargando">
          <div className="spinner"></div>
          <p>Cargando cuestionario...</p>
        </div>
      </div>
    </div>
  )

  const setRespuesta = (dim, idx, valor) => {
    setRespuestas(prev => ({ ...prev, [`${dim}_${idx}`]: valor }))
    // clear nsnc if they select a value
    setNsnc(prev => { const n = {...prev}; delete n[`${dim}_${idx}`]; return n })
  }

  const toggleNsnc = (dim, idx) => {
    const key = `${dim}_${idx}`
    setNsnc(prev => {
      const n = {...prev}
      if (n[key]) { delete n[key]; return n }
      else { n[key] = true; return n }
    })
    // clear likert value if NS/NC selected
    if (!nsnc[`${dim}_${idx}`]) {
      setRespuestas(prev => { const r = {...prev}; delete r[`${dim}_${idx}`]; return r })
    }
  }

  const getRespuesta = (dim, idx) => respuestas[`${dim}_${idx}`] || 0
  const isNsnc = (dim, idx) => !!nsnc[`${dim}_${idx}`]

  const itemRespondido = (dim, idx) =>
    respuestas[`${dim}_${idx}`] > 0 || (version !== 'D' && nsnc[`${dim}_${idx}`])

  const dimensionCompleta = (dim) => {
    if (dim === 'D10' && d10NoAplica === true) return true
    if (dim === 'D10' && d10NoAplica === null) return false
    return [1,2,3,4,5,6].every(i => itemRespondido(dim, i))
  }

  const handleDatosComplete = async (datos) => {
    setDatosClasif(datos)
    if (!demo && version === 'D' && !empresa.sector && datos.sector) {
      const estrato = datos.empleados?.includes('2 a 9') ? 'A'
                    : datos.empleados?.includes('10 a 49') ? 'B' : 'C'
      await supabase.from('empresas').update({
        nombre: datos.nombre, sector: datos.sector,
        estrato, empresa_familiar: datos.empresa_familiar,
      }).eq('codigo', codigo.toUpperCase())
    }
    setPaso(1)
  }

  const handleEnviar = async () => {
    if (!disponibilidad) { setErrorEnvio('Por favor, responde la pregunta final.'); return }
    if (demo) {
      navigate('/gracias', { state: { version, empresa: empresa.nombre, demo: true } })
      return
    }
    setEnviando(true); setErrorEnvio('')

    // Validación: evitar respuesta duplicada
    const tabla = version === 'D' ? 'respuestas_dir' : version === 'MI' ? 'respuestas_mi' : 'respuestas_eo'
    const { data: existente } = await supabase
      .from(tabla)
      .select('id')
      .eq('empresa_codigo', codigo.toUpperCase())
      .limit(1)
    if (existente && existente.length > 0) {
      setErrorEnvio('Ya existe una respuesta registrada para este perfil en esta empresa. Si crees que es un error, contacta con el investigador.')
      setEnviando(false)
      return
    }

    const fila = { empresa_codigo: codigo.toUpperCase() }
    DIM_KEYS.forEach(dim => {
      const n = dim.toLowerCase()
      if (dim === 'D10' && d10NoAplica) {
        // D10 no aplica → all null (excluded from BEV)
        ;[1,2,3,4,5,6].forEach(i => { fila[`${n}_${i}`] = null })
        fila['d10_no_aplica'] = true
      } else {
        ;[1,2,3,4,5,6].forEach(i => {
          fila[`${n}_${i}`] = nsnc[`${dim}_${i}`] ? null : (respuestas[`${dim}_${i}`] || null)
        })
      }
    })
    if (datosClasif) {
      fila.antiguedad_respondente = datosClasif.antiguedad_respondente
      if (version !== 'D') {
        fila.area_funcional = datosClasif.area_funcional
        fila.tipo_contrato = datosClasif.tipo_contrato
        if (version === 'MI') fila.personas_cargo = datosClasif.personas_cargo
        if (version === 'EO') fila.jornada = datosClasif.jornada
      }
    }
    fila.disponibilidad_ampliacion = disponibilidad
    if (emailContacto.trim()) fila.email_contacto = emailContacto.trim()

    const { error } = await supabase.from(tabla).insert([fila])
    if (error) { setErrorEnvio('Error al enviar. Por favor, inténtelo de nuevo.'); setEnviando(false); return }
    navigate('/gracias', { state: { version, empresa: empresa.nombre } })
  }

  const cabecera = (
    <div className="cabecera">
      <h1>Brecha Estratégica Vertical en PYMEs Españolas</h1>
      <p>{empresa?.nombre || codigo} ·{' '}
        <span className={`version-badge ${BADGE[version]}`}>{VERSION_LABEL[version]}</span>
        {demo && <span style={{ marginLeft: 8, fontSize: '0.75rem', background: '#fef9c3',
          color: '#854d0e', padding: '2px 8px', borderRadius: 10 }}>DEMO</span>}
      </p>
    </div>
  )

  // ── PASO 0 ────────────────────────────────────────────────────────────────
  if (paso === 0) return (
    <div className="contenedor">
      <div className="tarjeta">
        {cabecera}
        <div className="tarjeta-cuerpo">
          {demo && (
            <div style={{ background: '#fef9c3', border: '1.5px solid #f0b429',
              borderRadius: 8, padding: '10px 16px', marginBottom: 20,
              fontSize: '0.85rem', color: '#854d0e', fontWeight: 500 }}>
              🔍 Modo demostración — Las respuestas no se almacenarán
            </div>
          )}
          <DatosClasificacion version={version} empresa={empresa}
            onComplete={handleDatosComplete} demo={demo} />
        </div>
      </div>
    </div>
  )

  const dim = paso <= 10 ? DIM_KEYS[paso - 1] : null
  const dimData = dim ? DIMENSIONES[dim] : null
  const items = dim ? dimData[version] : null
  const progreso = (paso / 11) * 100
  const esD10 = dim === 'D10'

  // ── PASOS 1–10 ───────────────────────────────────────────────────────────
  if (paso <= 10) return (
    <div className="contenedor">
      <div className="tarjeta">
        {cabecera}
        <div className="tarjeta-cuerpo">
          <div className="progreso-texto">Sección {paso} de 10</div>
          <div className="barra-progreso">
            <div className="barra-progreso-inner" style={{ width: `${progreso}%` }}></div>
          </div>

          {/* Escala explanation — solo paso 1 */}
          {paso === 1 && (
            <div className="escala-explicacion">
              <div className="escala-titulo">📊 Cómo responder</div>
              <p>Cada afirmación se valora en una escala del <strong>1 al 7</strong>:</p>
              <div className="escala-visual">
                {[1,2,3,4,5,6,7].map(n => (
                  <div key={n} className="escala-celda">
                    <div className="escala-num"
                      style={{ background: `hsl(${215 + n*8}, 60%, ${70 - n*6}%)` }}>{n}</div>
                    <div className="escala-desc">
                      {n === 1 ? 'Mínimo' : n === 4 ? 'Intermedio' : n === 7 ? 'Máximo' : ''}
                    </div>
                  </div>
                ))}
              </div>
              {version !== 'D' && (
                <p style={{ fontSize: '0.82rem', color: '#555e7a', marginTop: 10,
                  padding: '8px 12px', background: '#f5f7fa', borderRadius: 6,
                  borderLeft: '3px solid #d1d9e6' }}>
                  <strong>NS/NC</strong> — Si genuinamente no conoce la posición de la empresa
                  en un aspecto concreto, puede marcar <strong>NS/NC</strong> (No sé / No contesto).
                  Se registra como dato ausente y no afecta al resto de sus respuestas.
                </p>
              )}
              <p style={{ fontSize: '0.82rem', color: '#555e7a', marginTop: 8 }}>
                No deje ninguna afirmación sin responder.
              </p>
            </div>
          )}

          <div className="dimension-titulo">{paso}. {dimData.nombre.toUpperCase()}</div>
          <div className="dimension-instruccion">{INSTRUCCIONES[version]}</div>

          {/* D10 filter question */}
          {esD10 && (
            <div className="d10-filtro">
              <div className="d10-filtro-pregunta">
                {D10_FILTER[version]}
              </div>
              <div className="d10-filtro-opciones">
                <button type="button"
                  className={`d10-btn ${d10NoAplica === true ? 'd10-btn-sel' : ''}`}
                  onClick={() => setD10NoAplica(true)}>
                  Sí, solo mercado local/nacional
                </button>
                <button type="button"
                  className={`d10-btn ${d10NoAplica === false ? 'd10-btn-sel' : ''}`}
                  onClick={() => setD10NoAplica(false)}>
                  No, hay o se prevé actividad internacional
                </button>
              </div>
              {d10NoAplica === true && (
                <div style={{ padding: '10px 14px', background: '#f0fdf4',
                  border: '1px solid #86efac', borderRadius: 8,
                  fontSize: '0.85rem', color: '#15803d', marginTop: 8 }}>
                  ✓ Esta dimensión se registrará como <strong>No aplicable</strong> y quedará
                  excluida del cálculo del diagnóstico de alineamiento.
                </div>
              )}
            </div>
          )}

          {/* Items — hidden if D10 no aplica */}
          {!(esD10 && d10NoAplica === true) && items.map((texto, idx) => {
            const n = idx + 1
            const val = getRespuesta(dim, n)
            const nsncActive = isNsnc(dim, n)
            return (
              <div key={n} className="item-bloque">
                <div className="item-texto">
                  <span className="item-numero">{n}.</span>{texto}
                </div>
                <div className="likert-row">
                  <div className="likert">
                    {[1,2,3,4,5,6,7].map(v => (
                      <button key={v} type="button"
                        className={`likert-btn ${val === v && !nsncActive ? 'seleccionado' : ''} ${nsncActive ? 'likert-disabled' : ''}`}
                        onClick={() => !nsncActive && setRespuesta(dim, n, v)}
                      >{v}</button>
                    ))}
                  </div>
                  {version !== 'D' && (
                    <button type="button"
                      className={`nsnc-btn ${nsncActive ? 'nsnc-btn-sel' : ''}`}
                      onClick={() => toggleNsnc(dim, n)}>
                      NS/NC
                    </button>
                  )}
                </div>
                <div className="likert-anclajes">
                  <span>1 — {ANCLAJES[version].izq}</span>
                  <span>7 — {ANCLAJES[version].der}</span>
                </div>
              </div>
            )
          })}

          <div className="botones-nav">
            <button className="btn btn-secundario" onClick={() => setPaso(p => p - 1)}>
              ← Anterior
            </button>
            <button className="btn btn-primario"
              onClick={() => setPaso(p => p + 1)}
              disabled={!dimensionCompleta(dim)}>
              {paso === 10 ? 'Última pregunta →' : 'Siguiente →'}
            </button>
          </div>
          {!dimensionCompleta(dim) && (
            <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 10, textAlign: 'center' }}>
              {esD10 && d10NoAplica === null
                ? 'Indica primero si tu empresa tiene actividad internacional.'
                : 'Responde todas las afirmaciones para continuar.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  // ── PASO 11: Pregunta final ───────────────────────────────────────────────
  return (
    <div className="contenedor">
      <div className="tarjeta">
        {cabecera}
        <div className="tarjeta-cuerpo">
          <div className="barra-progreso">
            <div className="barra-progreso-inner" style={{ width: '100%' }}></div>
          </div>
          <div className="dimension-titulo" style={{ marginBottom: 16 }}>Una última pregunta</div>
          <p style={{ fontSize: '0.95rem', marginBottom: 24 }}>
            ¿Estaría dispuesto/a a participar en una posible ampliación de este mismo estudio?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { id: 'si', label: 'Sí, con gusto', emoji: '✅' },
              { id: 'posible', label: 'Posiblemente', emoji: '🤔' },
              { id: 'no', label: 'No por el momento', emoji: '❌' },
            ].map(op => (
              <button key={op.id} type="button" onClick={() => setDisponibilidad(op.id)}
                style={{
                  padding: '14px 20px', borderRadius: 8, cursor: 'pointer',
                  border: `2px solid ${disponibilidad === op.id ? '#1e3a5f' : '#d1d9e6'}`,
                  background: disponibilidad === op.id ? '#eef3fb' : '#fff',
                  textAlign: 'left', fontSize: '0.95rem',
                  fontWeight: disponibilidad === op.id ? 700 : 400,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                <span>{op.emoji}</span><span>{op.label}</span>
              </button>
            ))}
          </div>
          {(disponibilidad === 'si' || disponibilidad === 'posible') && (
            <div style={{ marginTop: 20 }}>
              <label className="campo-label">
                Email de contacto <span style={{ fontWeight: 400, color: '#888' }}>(opcional)</span>
              </label>
              <input type="email" className="campo-input" placeholder="su@email.com"
                value={emailContacto} onChange={e => setEmailContacto(e.target.value)} />
              <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 6 }}>
                Solo se usará para contactarle sobre posibles ampliaciones del estudio.
              </p>
            </div>
          )}
          {errorEnvio && (
            <div style={{ color: '#e53e3e', fontSize: '0.88rem', margin: '16px 0' }}>
              ⚠ {errorEnvio}
            </div>
          )}
          <div className="botones-nav">
            <button className="btn btn-secundario" onClick={() => setPaso(10)}>← Anterior</button>
            <button className="btn btn-primario" onClick={handleEnviar}
              disabled={!disponibilidad || enviando}
              style={{ background: !disponibilidad || enviando ? '#d1d9e6' : '#1a7a4a',
                       color: !disponibilidad || enviando ? '#888' : 'white' }}>
              {enviando ? 'Enviando...' : demo ? '✓ Finalizar demostración' : '✓ Enviar respuestas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
