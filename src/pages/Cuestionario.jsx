import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { DIMENSIONES } from '../items'
import DatosClasificacion from './DatosClasificacion'

const INSTRUCCIONES = {
  D:  'Para cada aspecto, valore la importancia que tiene para la competitividad de su empresa.',
  MI: 'Para cada aspecto, valore la importancia que tiene en el trabajo que usted desempeña en esta empresa.',
  EO: 'Para cada aspecto, valore la importancia que le da su empresa en el trabajo diario.',
}
const ANCLAJES = {
  D:  { izq: 'Ninguna importancia', der: 'Máxima importancia' },
  MI: { izq: 'Ninguna importancia', der: 'Máxima importancia' },
  EO: { izq: 'Ninguna importancia', der: 'Máxima importancia' },
}
const VERSION_LABEL = {
  D: 'Versión Dirección', MI: 'Versión Mandos Intermedios', EO: 'Versión Empleados Operativos'
}
const BADGE = { D: 'badge-d', MI: 'badge-mi', EO: 'badge-eo' }
const DIM_KEYS = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']

// Valor especial para NS/NC (no sabe / no contesta)
const NSNC = -1

// Dominios genéricos que no identifican empresa
const DOMINIOS_GENERICOS = new Set([
  'gmail.com','googlemail.com','hotmail.com','hotmail.es','outlook.com','outlook.es',
  'live.com','live.es','yahoo.com','yahoo.es','icloud.com','me.com','mac.com',
  'protonmail.com','proton.me','tutanota.com','aol.com','msn.com','terra.es',
  'telefonica.net','orangemail.es','vodafone.es','ono.com'
])

function extraerDominio(email) {
  const parts = email.toLowerCase().trim().split('@')
  return parts.length === 2 ? parts[1] : null
}

export default function Cuestionario({ version, demo = false }) {
  const { codigo } = useParams()
  const navigate   = useNavigate()

  const [empresa,       setEmpresa]       = useState(null)
  const [cargando,      setCargando]      = useState(true)
  const [enviando,      setEnviando]      = useState(false)
  const [paso,          setPaso]          = useState(0)
  const [respuestas,    setRespuestas]    = useState({})
  const [clasificacion, setClasificacion] = useState(null)
  const [disponibilidad,setDisponibilidad]= useState('')
  const [emailContacto, setEmailContacto] = useState('')
  const [errorEnvio,    setErrorEnvio]    = useState('')
  const [errorEmail,    setErrorEmail]    = useState('')
  const [checkingEmail,   setCheckingEmail]   = useState(false)
  const [dominioConflicto, setDominioConflicto] = useState(null)  // {codigo} si dominio ya registrado
  const [copiado,          setCopiado]          = useState(false)

  useEffect(() => {
    if (demo) {
      setEmpresa({ codigo: 'DEMO', nombre: 'Empresa Demo', estrato: null, sector: null })
      setCargando(false)
      return
    }
    const verificar = async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('codigo, nombre, estrato, sector, empleados, antiguedad_empresa, empresa_familiar')
        .eq('codigo', codigo.toUpperCase())
        .single()
      if (error || !data) { navigate('/'); return }
      setEmpresa(data)
      setCargando(false)
    }
    verificar()
  }, [codigo, navigate, demo])

  if (cargando) return (
    <div className="contenedor"><div className="tarjeta"><div className="tarjeta-cuerpo cargando">
      <div className="spinner"></div><p>Verificando código de empresa...</p>
    </div></div></div>
  )

  const progreso = (paso / 11) * 100

  const setRespuesta = (dim, idx, valor) =>
    setRespuestas(prev => ({ ...prev, [`${dim}_${idx}`]: valor }))

  const getRespuesta = (dim, idx) => respuestas[`${dim}_${idx}`] || 0

  // Dimensión completa si todos los ítems tienen valor > 0 O son NS/NC (NSNC = -1)
  const dimensionCompleta = (dim) =>
    [1,2,3,4,5,6].every(i => {
      const v = respuestas[`${dim}_${i}`]
      return v !== undefined && v !== 0
    })

  const handleEnviar = async () => {
    if (version === 'D' && !disponibilidad) { setErrorEnvio('Por favor, responda la pregunta final antes de enviar.'); return }
    if (demo) {
      navigate('/gracias', { state: { version, empresa: empresa.nombre, demo: true } })
      return
    }

    setEnviando(true)
    setErrorEnvio('')

    // Deduplicidad por email ya comprobada al inicio en paso 0

    // ── Deduplicidad por código de empresa (versión D)
    if (version === 'D') {
      const { data: existente } = await supabase
        .from('respuestas_dir')
        .select('id')
        .eq('empresa_codigo', codigo.toUpperCase())
        .limit(1)
      if (existente && existente.length > 0) {
        setErrorEnvio('Ya existe una respuesta de Dirección registrada para esta empresa. Si cree que es un error, contacte con el investigador.')
        setEnviando(false)
        return
      }
    }

    // ── Construir fila de respuestas según versión (solo columnas que existen en cada tabla)
    const fila = { empresa_codigo: codigo.toUpperCase() }

    // Ítems: NS/NC se almacena como null en BD
    DIM_KEYS.forEach(dim => {
      const n = dim.toLowerCase()
      ;[1,2,3,4,5,6].forEach(i => {
        const v = respuestas[`${dim}_${i}`]
        fila[`${n}_${i}`] = (v === NSNC || !v) ? null : v
      })
    })

    // Campos comunes a todas las versiones
    fila.antiguedad_respondente    = clasificacion?.antiguedad_respondente || null
    fila.disponibilidad_ampliacion = version === 'D' ? disponibilidad : null
    // Para D: usa el email recogido en clasificación; para MI/EO: el del cierre
    // Email de contacto: solo para dirección (recogido en clasificación)
    fila.email_contacto = version === 'D'
      ? (clasificacion?.email_directivo?.toLowerCase().trim() || null)
      : null

    // Campos específicos por versión
    if (version === 'D') {
      fila.sector            = clasificacion?.sector            || null
      fila.empleados         = clasificacion?.empleados         || null
      fila.antiguedad_empresa= clasificacion?.antiguedad_empresa|| null
      fila.empresa_familiar  = clasificacion?.empresa_familiar  || null
    }
    if (version === 'MI') {
      fila.area_funcional  = clasificacion?.area_funcional || null
      fila.tipo_contrato   = clasificacion?.tipo_contrato  || null
      fila.personas_cargo  = clasificacion?.personas_cargo || null
    }
    if (version === 'EO') {
      fila.area_funcional  = clasificacion?.area_funcional || null
      fila.tipo_contrato   = clasificacion?.tipo_contrato  || null
      fila.jornada         = clasificacion?.jornada        || null
    }

    // ── Actualizar empresa con datos del directivo
    if (version === 'D' && clasificacion?.sector) {
      await supabase.from('empresas').update({
        nombre:            clasificacion.nombre_empresa || null,
        sector:            clasificacion.sector,
        empleados:         clasificacion.empleados,
        antiguedad_empresa:clasificacion.antiguedad_empresa,
        empresa_familiar:  clasificacion.empresa_familiar,
      }).eq('codigo', codigo.toUpperCase())
    }

    const tabla = version === 'D' ? 'respuestas_dir' : version === 'MI' ? 'respuestas_mi' : 'respuestas_eo'
    const { error } = await supabase.from(tabla).insert([fila])

    if (error) {
      console.error('Error Supabase:', error)
      setErrorEnvio('Error al enviar. Por favor, inténtelo de nuevo.')
      setEnviando(false)
      return
    }

    navigate('/gracias', { state: { version, empresa: empresa.nombre, codigo: empresa.codigo } })
  }

  // ── PASO 0: Datos de clasificación ───────────────────────────────────
  if (paso === 0) return (
    <div className="contenedor"><div className="tarjeta">
      <div className="cabecera">
        <h1>Estudio BEV — PYMEs Españolas</h1>
        <p>{empresa.nombre || (demo ? 'DEMO' : codigo)}</p>
      </div>
      <div className="tarjeta-cuerpo">
        <span className={`version-badge ${BADGE[version]}`}>{VERSION_LABEL[version]}</span>

        <div className="escala-explicacion" style={{ marginTop: 16 }}>
          <div className="escala-titulo">Escala de valoración (1–7)</div>
          <p>Todas las secciones utilizan la misma escala. Valore la
            <strong> importancia estratégica</strong> de cada aspecto,
            siendo 1 «ninguna importancia» y 7 «máxima importancia».</p>
          <div className="escala-visual">
            {[1,2,3,4,5,6,7].map(v => (
              <div key={v} className="escala-celda">
                <div className="escala-num" style={{
                  background: `hsl(${210 + v*10}, 60%, ${65 - v*5}%)`
                }}>{v}</div>
                <div className="escala-desc">
                  {v===1?'Ninguna':v===4?'Moderada':v===7?'Máxima':''}
                </div>
              </div>
            ))}
          </div>
          {version !== 'D' && (
            <p style={{ fontSize: '0.80rem', color: '#555e7a', marginTop: 8 }}>
              Si no dispone de suficiente información para valorar un aspecto, puede marcar <strong>NS/NC</strong>.
            </p>
          )}
        </div>

        {/* Error email genérico */}
        {errorEmail && !dominioConflicto && (
          <div style={{
            margin: '12px 0', padding: '12px 16px',
            background: '#fff5f5', border: '1.5px solid #fc8181',
            borderRadius: 8, fontSize: '0.88rem', color: '#742a2a'
          }}>
            ⚠ {errorEmail}
          </div>
        )}

        {/* Conflicto de dominio — empresa ya registrada */}
        {dominioConflicto && (() => {
          const enlace = `https://bev-pymes-cuestionario.vercel.app/empresa/${dominioConflicto.codigo}`
          return (
            <div style={{
              margin: '12px 0', padding: '18px 20px',
              background: '#fffbea', border: '1.5px solid #f0b429',
              borderRadius: 10, fontSize: '0.90rem', color: '#744210'
            }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                ⚠ Su empresa ya está registrada en el estudio
              </div>
              <p style={{ marginBottom: 12 }}>
                Utilice el siguiente enlace para acceder y añadir su respuesta
                como directivo adicional de su empresa:
              </p>
              <div style={{
                background: '#fff', border: '1px solid #f0b429',
                borderRadius: 8, padding: '8px 14px',
                fontFamily: 'monospace', fontSize: '0.85rem',
                color: '#1e3a5f', wordBreak: 'break-all', marginBottom: 10
              }}>
                {enlace}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(enlace)
                    .then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2500) })
                }}
                className="btn btn-primario"
                style={{ fontSize: '0.85rem', padding: '7px 18px', width: 'auto', background: '#d97706' }}
              >
                {copiado ? '✓ Enlace copiado' : '📋 Copiar enlace'}
              </button>
            </div>
          )
        })()}

        <DatosClasificacion
          version={version}
          empresaDatos={empresa}
          onComplete={async (datos) => {
            // Para Dirección: comprobar deduplicidad por email antes de continuar
            if (version === 'D' && datos.email_directivo && !demo) {
              const dominio = extraerDominio(datos.email_directivo)
              // Solo comprobar dominios corporativos (no gmail, hotmail, etc.)
              if (dominio && !DOMINIOS_GENERICOS.has(dominio)) {
                setCheckingEmail(true)
                setErrorEmail('')
                setDominioConflicto(null)
                const { data: dominioExistente } = await supabase
                  .from('respuestas_dir')
                  .select('empresa_codigo')
                  .ilike('email_contacto', '%@' + dominio)
                  .limit(1)
                setCheckingEmail(false)
                if (dominioExistente && dominioExistente.length > 0) {
                  const codExistente = dominioExistente[0].empresa_codigo
                  setDominioConflicto({ codigo: codExistente })
                  return
                }
              }
            }
            setClasificacion(datos)
            setPaso(1)
          }}
          cargando={checkingEmail}
        />
      </div>
    </div></div>
  )

  // ── PASO 11: Cierre ──────────────────────────────────────────────────
  if (paso === 11) return (
    <div className="contenedor"><div className="tarjeta">
      <div className="cabecera">
        <h1>Estudio BEV — PYMEs Españolas</h1>
        <p>{clasificacion?.nombre_empresa || empresa.nombre || (demo ? 'DEMO' : codigo)} · {VERSION_LABEL[version]}</p>
      </div>
      <div className="tarjeta-cuerpo">
        <div className="progreso-texto">Sección final</div>
        <div className="barra-progreso">
          <div className="barra-progreso-inner" style={{ width: '100%' }}></div>
        </div>
        <div className="dimension-titulo" style={{ marginBottom: 16 }}>Para terminar</div>

        {/* ── Versión Dirección: agradecimiento + herramienta + disponibilidad ── */}
        {version === 'D' && (
          <p style={{ color: '#374151', marginBottom: 20, fontSize: '0.92rem' }}>
            Muchas gracias por su tiempo y por liderar la participación de su empresa
            en este estudio. Su contribución es fundamental para mejorar el conocimiento
            sobre el alineamiento estratégico en las PYMEs españolas.
          </p>
        )}
        {version === 'D' && (
          <>
            <div style={{
              background: '#f0fdf4', border: '1.5px solid #22c55e',
              borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: '0.88rem', color: '#374151'
            }}>
              <strong style={{ color: '#15803d' }}>🎯 Acceso gratuito a la futura herramienta de alineamiento</strong>
              <p style={{ marginTop: 6, marginBottom: 0 }}>
                El desarrollo de una herramienta de diagnóstico continuo de alineamiento estratégico
                —similar a las evaluaciones de desempeño, pero orientada a la estrategia interna—
                requiere la participación de un número amplio de empresas en futuras ampliaciones.
                Las empresas que colaboren tendrán <strong>acceso permanente y sin coste</strong> a
                esa herramienta para uso interno.
              </p>
            </div>

            <div className="campo-grupo">
              <label className="campo-label">
                ¿Estaría su empresa disponible para participar en futuras ampliaciones del estudio?{' '}
                <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              {[
                'Sí, con mucho gusto',
                'Posiblemente',
                'No, prefiero no participar en más fases'
              ].map(op => (
                <label key={op} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                  border: `2px solid ${disponibilidad === op ? '#1e3a5f' : '#d1d9e6'}`,
                  background: disponibilidad === op ? '#eef3fb' : '#fff'
                }}>
                  <input type="radio" name="disponibilidad" value={op}
                    checked={disponibilidad === op}
                    onChange={() => setDisponibilidad(op)} />
                  {op}
                </label>
              ))}
            </div>
          </>
        )}

        {/* ── Versiones MI / EO: agradecimiento ── */}
        {version !== 'D' && (
          <p style={{ color: '#374151', marginBottom: 20, fontSize: '0.92rem' }}>
            Muchas gracias por su tiempo y por contribuir a la mejora del conocimiento
            sobre el alineamiento estratégico en las empresas. Puede enviar sus
            respuestas a continuación.
          </p>
        )}

        {errorEnvio && (
          <div style={{ color: '#e53e3e', fontSize: '0.88rem', marginTop: 12 }}>
            ⚠ {errorEnvio}
          </div>
        )}

        <div className="botones-nav">
          <button className="btn btn-secundario" onClick={() => setPaso(10)}>← Anterior</button>
          <button
            className="btn btn-primario"
            onClick={handleEnviar}
            disabled={(version === 'D' && !disponibilidad) || enviando}
            style={{ background: ((version === 'D' && !disponibilidad) || enviando) ? '#d1d9e6' : '#1a7a4a' }}
          >
            {enviando ? 'Enviando...' : '✓ Enviar respuestas'}
          </button>
        </div>
      </div>
    </div></div>
  )

  // ── PASOS 1–10: Dimensiones ──────────────────────────────────────────
  const dim     = DIM_KEYS[paso - 1]
  const dimData = DIMENSIONES[dim]
  const items   = dimData[version]
  const esUltima = paso === 10

  return (
    <div className="contenedor"><div className="tarjeta">
      <div className="cabecera">
        <h1>Estudio BEV — PYMEs Españolas</h1>
        <p>{clasificacion?.nombre_empresa || empresa.nombre || (demo ? 'DEMO' : codigo)} · {VERSION_LABEL[version]}</p>
      </div>
      <div className="tarjeta-cuerpo">

        <div className="progreso-texto">Sección {paso} de 10</div>
        <div className="barra-progreso">
          <div className="barra-progreso-inner" style={{ width: `${progreso}%` }}></div>
        </div>

        <div className="dimension-titulo">{paso}. {dimData.nombre.toUpperCase()}</div>

        {/* Nota contextual D9 — sin filtro */}
        {dim === 'D9' && dimData.nota && (
          <div className="nota-dimension">{dimData.nota}</div>
        )}

        <div className="dimension-instruccion">{INSTRUCCIONES[version]}</div>

        {/* Explicación escala solo en sección 1 */}
        {paso === 1 && (
          <div className="escala-explicacion">
            <div className="escala-titulo">Escala de valoración</div>
            <div className="escala-visual">
              {[1,2,3,4,5,6,7].map(v => (
                <div key={v} className="escala-celda">
                  <div className="escala-num" style={{
                    background: `hsl(${210 + v*10}, 60%, ${65 - v*5}%)`
                  }}>{v}</div>
                  <div className="escala-desc">
                    {v===1?'Ninguna':v===4?'Moderada':v===7?'Máxima':''}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.80rem', color: '#555e7a', marginTop: 8 }}>
              {ANCLAJES[version].izq} — {ANCLAJES[version].der}
            </p>
          </div>
        )}

        {/* Ítems Likert + NS/NC */}
        {items.map((texto, idx) => {
          const n   = idx + 1
          const val = getRespuesta(dim, n)
          const esNSNC = val === NSNC

          return (
            <div key={n} className="item-bloque">
              <div className="item-texto">
                <span className="item-numero">{n}.</span>{texto}
              </div>

              <div className="likert-row">
                <div className="likert">
                  {[1,2,3,4,5,6,7].map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`likert-btn ${val === v ? 'seleccionado' : ''} ${esNSNC ? 'likert-disabled' : ''}`}
                      onClick={() => !esNSNC && setRespuesta(dim, n, v)}
                      disabled={esNSNC}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {/* Botón NS/NC — solo versiones MI y EO */}
                {version !== 'D' && (
                  <button
                    type="button"
                    className={`nsnc-btn ${esNSNC ? 'nsnc-btn-sel' : ''}`}
                    onClick={() => setRespuesta(dim, n, esNSNC ? 0 : NSNC)}
                    title="No sabe / No contesta"
                  >
                    NS/NC
                  </button>
                )}
              </div>

              <div className="likert-anclajes">
                <span>{ANCLAJES[version].izq}</span>
                <span>{ANCLAJES[version].der}</span>
              </div>
            </div>
          )
        })}

        <div className="botones-nav">
          <button className="btn btn-secundario" onClick={() => setPaso(p => p - 1)}>
            ← Anterior
          </button>
          <button
            className="btn btn-primario"
            onClick={() => setPaso(p => p + 1)}
            disabled={!dimensionCompleta(dim)}
          >
            {esUltima ? 'Finalizar →' : 'Siguiente →'}
          </button>
        </div>

        {!dimensionCompleta(dim) && (
          <p style={{ fontSize: '0.78rem', color: '#555e7a', marginTop: 10, textAlign: 'center' }}>
            Valore todas las afirmaciones de esta sección para continuar
            {version !== 'D' && ' (puede usar NS/NC si no dispone de información suficiente)'}.
          </p>
        )}

      </div>
    </div></div>
  )
}
