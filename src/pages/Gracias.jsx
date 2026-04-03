import { useLocation, Link } from 'react-router-dom'

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
          <h1>Estudio BEV — PYMEs Españolas</h1>
          <p>Universidad Europea Miguel de Cervantes (UEMC)</p>
        </div>
        <div className="tarjeta-cuerpo">
          <div className="gracias">
            <div className="gracias-icono">✅</div>
            <h2>¡Cuestionario completado!</h2>
            <p style={{ marginBottom: 20 }}>
              Sus respuestas han sido registradas correctamente.
              {empresa && <><br />Empresa: <strong>{empresa}</strong></>}
              {' '}· {VERSION_LABEL[version]}
            </p>
            <p>
              Muchas gracias por su participación. Su empresa recibirá el informe diagnóstico
              de alineamiento estratégico una vez finalizada la recogida de datos.
            </p>
            <p style={{ marginTop: 20, fontSize: '0.82rem', color: '#888' }}>
              Puede cerrar esta ventana.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
