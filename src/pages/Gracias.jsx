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

            {!demo && version === 'D' && (
              <p style={{ marginBottom: 28, color: '#374151' }}>
                Muchas gracias por su tiempo y por liderar la participación de su empresa
                en este estudio. Su contribución es fundamental para mejorar el
                conocimiento sobre el alineamiento estratégico en las PYMEs españolas.
                En cuanto finalice la recogida de datos, recibirá el informe personalizado
                de diagnóstico de su empresa.
              </p>
            )}
            {!demo && version !== 'D' && (
              <p style={{ marginBottom: 28, color: '#374151' }}>
                Muchas gracias por su tiempo y por contribuir a la mejora del conocimiento
                sobre el alineamiento estratégico en las empresas. Su participación es
                muy valiosa para este estudio.
              </p>
            )}

            {/* Bloque exclusivo para Versión Dirección — enlace equipo */}
            {!demo && version === 'D' && codigo && (
              <div style={{
                background: '#eef6ff',
                border: '1.5px solid #3b82f6',
                borderRadius: 12,
                padding: '24px 28px',
                textAlign: 'left',
                marginBottom: 20,
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

            {/* Bloque beneficio herramienta — solo Dirección */}
            {!demo && version === 'D' && (
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #22c55e',
                borderRadius: 12,
                padding: '20px 24px',
                textAlign: 'left',
                marginBottom: 24,
              }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#15803d', marginBottom: 10 }}>
                  🎯 Su participación le da acceso prioritario a la futura herramienta
                </div>
                <p style={{ fontSize: '0.88rem', color: '#374151', marginBottom: 10 }}>
                  Este estudio forma parte de un proyecto de investigación cuyo objetivo final es
                  desarrollar una <strong>herramienta de diagnóstico del alineamiento estratégico
                  interno</strong> para PYMEs: una aplicación que permita a cualquier empresa medir,
                  de forma periódica y sencilla, en qué medida su equipo comparte y asume la
                  estrategia definida por la dirección —de manera similar a como las evaluaciones
                  de desempeño miden el rendimiento individual, pero orientada a la cohesión
                  estratégica del conjunto de la organización.
                </p>
                <p style={{ fontSize: '0.88rem', color: '#374151', marginBottom: 0 }}>
                  Como reconocimiento a su colaboración, su empresa tendrá{' '}
                  <strong>acceso prioritario y sin coste</strong> a las futuras aplicaciones
                  del instrumento de diagnóstico desarrolladas en el marco de esta investigación.
                  Si facilitó su email al completar el cuestionario, le informaremos directamente
                  cuando estén disponibles.
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
