import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabase'

const PERFILES = [
  {
    id: 'D',
    label: 'Director / Fundador / Gerente',
    color: '#1e3a5f', bg: '#dbeafe', textColor: '#1e40af',
    info: 'Selecciona este perfil si eres el responsable principal de la empresa, tomas las decisiones estratégicas y defines las prioridades del negocio. Incluye socios directivos y propietarios con funciones de gestión.'
  },
  {
    id: 'MI',
    label: 'Mando intermedio / Responsable de área',
    color: '#15803d', bg: '#dcfce7', textColor: '#15803d',
    info: 'Selecciona este perfil si coordinas un equipo o área dentro de la empresa, actuando como enlace entre la dirección y los empleados operativos. Incluye jefes de equipo, responsables de departamento o supervisores.'
  },
  {
    id: 'EO',
    label: 'Empleado operativo',
    color: '#854d0e', bg: '#fef9c3', textColor: '#854d0e',
    info: 'Selecciona este perfil si realizas tareas operativas sin responsabilidades directivas formales sobre otras personas. Incluye técnicos, operarios, administrativos y cualquier empleado sin funciones de supervisión.'
  }
]

export default function App({ demo = false }) {
  const [perfil, setPerfil] = useState(null)
  const [infoAbierto, setInfoAbierto] = useState(null)
  const navigate = useNavigate()
  const { codigo } = useParams()

  const handleComenzar = () => {
    if (!perfil) return
    if (demo) {
      const ruta = perfil === 'D' ? '/demo/d' : perfil === 'MI' ? '/demo/mi' : '/demo/eo'
      navigate(ruta)
    } else {
      const cod = codigo || ''
      const ruta = perfil === 'D' ? `/d/${cod}` : perfil === 'MI' ? `/mi/${cod}` : `/eo/${cod}`
      navigate(ruta)
    }
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
            {PERFILES.map(p => (
              <div key={p.id}>
                <button
                  type="button"
                  className={`perfil-btn ${perfil === p.id ? 'perfil-btn-seleccionado' : ''}`}
                  style={{
                    borderColor: perfil === p.id ? p.color : '#d1d9e6',
                    background: perfil === p.id ? p.bg : '#fff',
                  }}
                  onClick={() => { setPerfil(p.id); setInfoAbierto(null) }}
                >
                  <div className="perfil-btn-inner">
                    <span className="perfil-radio"
                      style={{ borderColor: perfil === p.id ? p.color : '#d1d9e6',
                               background: perfil === p.id ? p.color : 'transparent' }} />
                    <span className="perfil-label"
                      style={{ color: perfil === p.id ? p.textColor : '#1a1a2e',
                               fontWeight: perfil === p.id ? 700 : 500 }}>
                      {p.label}
                    </span>
                  </div>
                  <button type="button" className="info-btn"
                    onClick={e => { e.stopPropagation(); setInfoAbierto(infoAbierto === p.id ? null : p.id) }}
                    title="Más información sobre este perfil">ⓘ</button>
                </button>
                {infoAbierto === p.id && (
                  <div className="perfil-info-texto">{p.info}</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28 }}>
            <button
              className="btn btn-primario"
              style={{ width: '100%', opacity: perfil ? 1 : 0.45,
                       cursor: perfil ? 'pointer' : 'not-allowed' }}
              disabled={!perfil}
              onClick={handleComenzar}
            >
              Comenzar cuestionario →
            </button>
            {!perfil && (
              <p style={{ textAlign: 'center', fontSize: '0.80rem', color: '#888', marginTop: 8 }}>
                Selecciona tu perfil para continuar
              </p>
            )}
          </div>

          <div className="pie-investigador">
            <p><strong>Investigador:</strong> Marcos Lucas Hernández</p>
            <p>Trabajo de Fin de Grado — Ingeniería de Organización Industrial · UEMC</p>
            <p><em>"Brecha Estratégica Vertical en PYMEs Españolas: Desarrollo de un Instrumento de Diagnóstico Multinivel"</em></p>
            <p>Tutora: Dra. Patricia Lerma Escudero</p>
          </div>
        </div>
      </div>
    </div>
  )
}
