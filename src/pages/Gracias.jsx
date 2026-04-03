import { useLocation } from 'react-router-dom'

const VERSION_LABEL = {
  D: 'Versión Dirección', MI: 'Versión Mandos Intermedios', EO: 'Versión Empleados Operativos'
}

export default function Gracias() {
  const { state } = useLocation()
  const version = state?.version || 'D'
  const empresa = state?.empresa || ''

  return (
    <div className="contenedor">
      <div className="tarjeta">
        <div className="cabecera">
          <h1>Estudio sobre alineamiento estratégico en PYMEs españolas</h1>
          <p>Universidad Europea Miguel de Cervantes (UEMC)</p>
        </div>
        <div className="tarjeta-cuerpo">
          <div className="gracias">
            <div className="gracias-icono">✅</div>
            <h2>¡Cuestionario completado!</h2>
            <p style={{ marginBottom: 16 }}>
              Sus respuestas han sido registradas correctamente.
              {empresa && <><br /><strong>{empresa}</strong> · </>}{VERSION_LABEL[version]}
            </p>
            <p style={{ marginBottom: 24 }}>
              Muchas gracias por su tiempo y colaboración. Su empresa recibirá un informe
              diagnóstico personalizado sobre su alineamiento estratégico interno una vez
              finalizada la recogida de datos.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 32 }}>
              Puede cerrar esta ventana.
            </p>

            <div className="pie-investigador" style={{ textAlign: 'center' }}>
              <p><strong>Marcos Lucas Hernández</strong></p>
              <p>Grado en Ingeniería de Organización Industrial · UEMC</p>
              <p>Tutora: Dra. Patricia Lerma Escudero</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
