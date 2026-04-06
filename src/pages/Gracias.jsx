import { useLocation } from 'react-router-dom'
import { useState } from 'react'

const VERSION_LABEL = {
  D: 'Versión Dirección', MI: 'Versión Mandos Intermedios', EO: 'Versión Empleados Operativos'
}
const BASE_URL = 'https://bev-pymes-cuestionario.vercel.app'

export default function Gracias() {
  const { state } = useLocation()
  const version = state?.version || 'EO'
  const empresa = state?.empresa || ''
  const codigo  = state?.codigo  || ''
  const demo    = state?.demo    || false
  const [copiado, setCopiado] = useState(false)

  const enlaceEquipo = `${BASE_URL}/empresa/${codigo}`

  const copiarEnlace = () => {
    navigator.clipboard.writeText(enlaceEquipo).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  return (
    <div className="contenedor">
      <div className="tarjeta">
        <div className="cabecera">
          <h1>Estudio BEV — PYMEs Españolas</h1>
          <p>Universidad Europea Miguel de Cervantes (UEMC)</p>
        </div>
        <div className="tarjeta-cuerpo">
          <div className="gracias">
            <div className="gracias-icono">✅</div>
            <h2>{demo ? 'Demostración completada' : 'Cuestionario completado'}</h2>
            <p style={{ marginBottom: 8 }}>
              {demo
                ? 'Ha completado el recorrido de demostración. Las respuestas no han sido almacenadas.'
                : 'Sus respuestas han sido registradas correctamente.'}
              {!demo && empresa && <><br />Empresa: <strong>{empresa}</strong></>}
              {!demo && <>{' '}· {VERSION_LABEL[version]}</>}
            </p>

            {!demo && (
              <p style={{ marginBottom: 28, color: '#555e7a' }}>
                Muchas gracias por su participación.
                Su empresa recibirá el informe diagnóstico de alineamiento estratégico
                una vez finalizada la recogida de datos.
              </p>
            )}

            {/* Bloque exclusivo para Versión Dirección */}
            {!demo && version === 'D' && codigo && (
              <div style={{
                background: '#eef6ff',
                border: '1.5px solid #3b82f6',
                borderRadius: 12,
                padding: '24px 28px',
                textAlign: 'left',
                marginBottom: 24,
              }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e3a5f', marginBottom: 10 }}>
                  📋 Siguiente paso — comparta el estudio con su equipo
                </div>
                <p style={{ fontSize: '0.90rem', color: '#374151', marginBottom: 16 }}>
                  Para que el análisis de alineamiento estratégico de su empresa pueda completarse,
                  necesitamos que los miembros de su equipo cumplimenten también su versión del
                  cuestionario. Por favor, comparta el siguiente enlace con sus{' '}
                  <strong>mandos intermedios y empleados operativos</strong>:
                </p>
                <div style={{
                  background: '#fff',
                  border: '1px solid #c3d8f5',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontFamily: 'monospace',
                  fontSize: '0.88rem',
                  color: '#1e3a5f',
                  wordBreak: 'break-all',
                  marginBottom: 12,
                }}>
                  {enlaceEquipo}
                </div>
                <button
                  onClick={copiarEnlace}
                  className="btn btn-primario"
                  style={{ fontSize: '0.88rem', padding: '8px 20px', width: 'auto' }}
                >
                  {copiado ? '✓ Enlace copiado' : '📋 Copiar enlace'}
                </button>
                <p style={{ fontSize: '0.80rem', color: '#6b7280', marginTop: 12 }}>
                  El enlace es exclusivo de su empresa. Cada participante tardará entre 8 y 12 minutos.
                </p>
              </div>
            )}

            <p style={{ marginTop: 8, fontSize: '0.82rem', color: '#9ca3af' }}>
              Puede cerrar esta ventana.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
