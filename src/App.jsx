import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabase'

const PERFILES = [
  {
    id: 'D',
    label: 'Director / Fundador / Gerente',
    color: '#1e3a5f', bg: '#dbeafe', textColor: '#1e40af',
    info: 'Seleccione este perfil si es usted el responsable principal de la empresa, toma las decisiones estratégicas y define las prioridades del negocio. Incluye socios directivos, propietarios con funciones de gestión y gerentes contratados.'
  },
  {
    id: 'MI',
    label: 'Mando intermedio / Responsable de área',
    color: '#15803d', bg: '#dcfce7', textColor: '#15803d',
    info: 'Seleccione este perfil si cumple las tres condiciones siguientes: (1) ocupa un cargo reconocido formalmente en la empresa con un equipo o área a su cargo; (2) supervisa de forma habitual el trabajo de al menos una persona; y (3) actúa como enlace entre la dirección y los empleados en la transmisión de directrices. Si coordina puntualmente a compañeros pero sin cargo ni supervisión continuada reconocida, seleccione «Empleado operativo».'
  },
  {
    id: 'EO',
    label: 'Empleado operativo',
    color: '#854d0e', bg: '#fef9c3', textColor: '#854d0e',
    info: 'Seleccione este perfil si realiza tareas operativas sin un cargo de supervisión reconocido formalmente en la empresa. Si tiene dudas entre este perfil y el de mando intermedio, seleccione este: la coordinación puntual de compañeros sin cargo reconocido ni supervisión continuada no constituye un mando intermedio formal.'
  }
]

// Genera un código aleatorio de 6 caracteres alfanuméricos en mayúsculas
function generarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function App({ demo = false }) {
  const [perfil, setPerfil]           = useState(null)
  const [creando, setCreando]         = useState(false)
  const [error, setError]             = useState('')
  const [empresa, setEmpresa]         = useState(null)
  const navigate = useNavigate()
  const { codigo } = useParams()  // undefined si viene del enlace genérico

  // Cargar nombre de empresa si hay código en la URL
  useEffect(() => {
    if (!codigo || demo) return
    supabase
      .from('empresas')
      .select('nombre, sector, estrato')
      .eq('codigo', codigo.toUpperCase())
      .maybeSingle()
      .then(({ data }) => { if (data) setEmpresa(data) })
  }, [codigo, demo])

  // Filtra perfiles según estrato: oculta MI en A y B1
  const perfilesVisibles = PERFILES.filter(p => {
    if (p.id !== 'MI') return true
    if (!empresa?.estrato) return true  // sin estrato aún, mostrar todos
    return empresa.estrato === 'B2' || empresa.estrato === 'C'
  })

  const handleComenzar = async () => {
    if (!perfil) return

    // ── Modo demo
    if (demo) {
      const ruta = perfil === 'D' ? '/demo/d' : perfil === 'MI' ? '/demo/mi' : '/demo/eo'
      navigate(ruta)
      return
    }

    // ── Hay código en la URL (enlace de empresa pre-generado)
    if (codigo) {
      const ruta = perfil === 'D' ? `/d/${codigo}` : perfil === 'MI' ? `/mi/${codigo}` : `/eo/${codigo}`
      navigate(ruta)
      return
    }

    // ── Sin código: solo el directivo puede iniciar desde el enlace genérico
    if (perfil !== 'D') {
      setError('No es posible acceder al cuestionario desde este enlace. Por favor, solicite el enlace exclusivo de su empresa a su Director, Gerente o responsable directo.')
      return
    }

    // ── Crear empresa nueva con código generado automáticamente
    setCreando(true)
    setError('')

    let cod = ''
    let intentos = 0
    while (intentos < 10) {
      cod = generarCodigo()
      // Verificar que no exista ya
      const { data } = await supabase
        .from('empresas')
        .select('codigo')
        .eq('codigo', cod)
        .maybeSingle()
      if (!data) break   // código libre
      intentos++
    }

    const { error: errInsert } = await supabase
      .from('empresas')
      .insert([{ codigo: cod }])

    setCreando(false)

    if (errInsert) {
      setError('Error al iniciar el cuestionario. Por favor, inténtelo de nuevo.')
      return
    }

    navigate(`/d/${cod}`)
  }

  return (
    <div className="contenedor">
      <div className="tarjeta">
        <div className="cabecera">
          <h1>Brecha Estratégica Vertical en PYMEs Españolas</h1>
          <p>Estudio de diagnóstico multinivel · Universidad Europea Miguel de Cervantes (UEMC)</p>
        </div>

        <div className="tarjeta-cuerpo">
          {demo && (
            <div style={{
              background: '#fef9c3', border: '1.5px solid #f0b429',
              borderRadius: 8, padding: '10px 16px', marginBottom: 20,
              fontSize: '0.85rem', color: '#854d0e', fontWeight: 500
            }}>
              🔍 Modo demostración — Las respuestas no se almacenarán
            </div>
          )}

          {/* Bienvenida personalizada con nombre de empresa */}
          {codigo && empresa?.nombre && (
            <div style={{
              background: '#eef3fb', border: '1.5px solid #bcd3f5',
              borderRadius: 10, padding: '14px 20px', marginBottom: 20,
              fontSize: '0.95rem', color: '#1e3a5f'
            }}>
              👋 Bienvenido/a al cuestionario de{' '}
              <strong>{empresa.nombre}</strong>
              {empresa.sector ? ` · ${empresa.sector}` : ''}
            </div>
          )}

          <div className="intro-bloque">
            <p>
              Este cuestionario forma parte de un proyecto de investigación académica de la
              Universidad Europea Miguel de Cervantes (UEMC) <strong>con interés predoctoral</strong>,
              centrado en analizar cómo los distintos niveles de una empresa perciben sus
              prioridades estratégicas.
            </p>
            <p>
              No hay respuestas correctas ni incorrectas. Lo que nos interesa es
              su <strong>percepción genuina</strong> sobre lo que ocurre en su organización.
            </p>
            <div className="garantias-fila">
              <span className="garantia-item">🔒 Participación voluntaria y anónima</span>
              <span className="garantia-item">📋 Datos tratados conforme al RGPD (UE) 2016/679</span>
              <span className="garantia-item">⏱ 8–14 minutos según su perfil</span>
            </div>
          </div>

          <div className="perfil-titulo">Seleccione su perfil en la organización</div>

          <div className="perfiles-lista">
            {perfilesVisibles.map(p => (
              <div key={p.id}>
                <button
                  type="button"
                  className={`perfil-btn ${perfil === p.id ? 'perfil-btn-seleccionado' : ''}`}
                  style={{
                    borderColor: perfil === p.id ? p.color : '#d1d9e6',
                    background:  perfil === p.id ? p.bg   : '#fff',
                  }}
                  onClick={() => { setPerfil(p.id); setError('') }}
                >
                  <div className="perfil-btn-inner">
                    <span className="perfil-radio"
                      style={{ borderColor: perfil === p.id ? p.color : '#d1d9e6',
                               background:  perfil === p.id ? p.color : 'transparent' }} />
                    <span className="perfil-label"
                      style={{ color:      perfil === p.id ? p.textColor : '#1a1a2e',
                               fontWeight: perfil === p.id ? 700 : 500 }}>
                      {p.label}
                    </span>
                  </div>
                </button>
                {perfil === p.id && (
                  <div style={{
                    margin: '4px 0 8px',
                    padding: '10px 14px',
                    background: p.bg,
                    border: `1px solid ${p.color}33`,
                    borderRadius: 8,
                    fontSize: '0.83rem',
                    color: p.textColor,
                    lineHeight: 1.55,
                  }}>
                    {p.info}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Aviso bloqueante para MI/EO en enlace genérico */}
          {!codigo && !demo && perfil && perfil !== 'D' && (
            <div style={{
              marginTop: 16, padding: '16px 20px',
              background: '#fff5f5', border: '2px solid #fc8181',
              borderRadius: 10, fontSize: '0.92rem', color: '#742a2a',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                🚫 No es posible acceder al cuestionario desde este enlace
              </div>
              Por favor, solicite el <strong>enlace exclusivo de su empresa</strong> a su Director, Gerente o responsable directo para poder cumplimentar su versión del cuestionario.
            </div>
          )}

          {error && (
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: '#fff5f5', border: '1px solid #fed7d7',
              borderRadius: 8, fontSize: '0.85rem', color: '#c53030'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 28 }}>
            <button
              className="btn btn-primario"
              style={{
                width: '100%',
                opacity: (perfil && (!codigo && perfil !== 'D') === false) ? 1 : 0.45,
                cursor: perfil ? 'pointer' : 'not-allowed'
              }}
              disabled={!perfil || creando || (!codigo && !demo && perfil !== 'D')}
              onClick={handleComenzar}
            >
              {creando ? 'Preparando cuestionario...' : 'Comenzar cuestionario →'}
            </button>
            {!perfil && (
              <p style={{ textAlign: 'center', fontSize: '0.80rem', color: '#888', marginTop: 8 }}>
                Seleccione su perfil para continuar
              </p>
            )}
          </div>

          <div className="pie-investigador">
            <p><em>«Brecha Estratégica Vertical en PYMEs Españolas: Desarrollo de un Instrumento de Diagnóstico Multinivel»</em></p>
            <p>Marcos Lucas Hernández · Universidad Europea Miguel de Cervantes (UEMC)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
