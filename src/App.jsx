import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabase'

const PERFILES = [
  {
    id: 'D',
    label: 'Director / Fundador / Gerente',
    color: '#1e3a5f',
    bg: '#dbeafe',
    textColor: '#1e40af',
    info: 'Selecciona este perfil si eres el responsable principal de la empresa, tomas las decisiones estratégicas y defines las prioridades del negocio. Incluye socios directivos y propietarios con funciones de gestión.'
  },
  {
    id: 'MI',
    label: 'Mando intermedio / Responsable de área',
    color: '#15803d',
    bg: '#dcfce7',
    textColor: '#15803d',
    info: 'Selecciona este perfil si coordinas un equipo o área dentro de la empresa, actuando como enlace entre la dirección y los empleados operativos. Incluye jefes de equipo, responsables de departamento o supervisores.'
  },
  {
    id: 'EO',
    label: 'Empleado operativo',
    color: '#854d0e',
    bg: '#fef9c3',
    textColor: '#854d0e',
    info: 'Selecciona este perfil si realizas tareas operativas sin responsabilidades directivas formales sobre otras personas. Incluye técnicos, operarios, administrativos y cualquier empleado sin funciones de supervisión.'
  }
]

export default function App() {
  const [perfil, setPerfil] = useState(null)
  const [infoAbierto, setInfoAbierto] = useState(null)
  const navigate = useNavigate()

  // Get codigo from URL if present (used by /empresa/:codigo route)
  const codigo = window.location.pathname.split('/empresa/')[1] || null

  const handleComenzar = () => {
    if (!perfil || !codigo) return
    const ruta = perfil === 'D' ? `/d/${codigo}` : perfil === 'MI' ? `/mi/${codigo}` : `/eo/${codigo}`
    navigate(ruta)
  }

  return (
    <div className="contenedor">
      <div className="tarjeta">
        <div className="cabecera">
          <h1>Estudio sobre alineamiento estratégico en PYMEs españolas</h1>
          <p>Universidad Europea Miguel de Cervantes (UEMC) · Ingeniería de Organización Industrial</p>
        </div>

        <div className="tarjeta-cuerpo">
          {/* Texto introductorio */}
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

          {/* Selector de perfil */}
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
                    <span
                      className="perfil-radio"
                      style={{ borderColor: perfil === p.id ? p.color : '#d1d9e6',
                               background: perfil === p.id ? p.color : 'transparent' }}
                    />
                    <span
                      className="perfil-label"
                      style={{ color: perfil === p.id ? p.textColor : '#1a1a2e', fontWeight: perfil === p.id ? 700 : 500 }}
                    >
                      {p.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="info-btn"
                    onClick={e => { e.stopPropagation(); setInfoAbierto(infoAbierto === p.id ? null : p.id) }}
                    title="Más información sobre este perfil"
                  >
                    ⓘ
                  </button>
                </button>

                {infoAbierto === p.id && (
                  <div className="perfil-info-texto">
                    {p.info}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botón comenzar */}
          <div style={{ marginTop: 28 }}>
            <button
              className="btn btn-primario"
              style={{ width: '100%', opacity: perfil && codigo ? 1 : 0.45, cursor: perfil && codigo ? 'pointer' : 'not-allowed' }}
              disabled={!perfil || !codigo}
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

          {/* Pie investigador */}
          <div className="pie-investigador">
            <p><strong>Investigador:</strong> Marcos Lucas Hernández</p>
            <p>Grado en Ingeniería de Organización Industrial · UEMC</p>
            <p>Tutora: Dra. Patricia Lerma Escudero</p>
          </div>
        </div>
      </div>
    </div>
  )
}
