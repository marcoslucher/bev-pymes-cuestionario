// Componente de datos de clasificación diferenciado por perfil
import { useState } from 'react'

const SECTORES = [
  'Industria y fabricación','Construcción','Comercio al por menor',
  'Comercio al por mayor','Hostelería y restauración','Transporte y logística',
  'Tecnología e informática','Servicios profesionales','Salud y bienestar',
  'Educación y formación','Agricultura y alimentación','Otro'
]
const EMPLEADOS = [
  { label: '2 a 9 empleados (Microempresa)',        estrato: 'A'  },
  { label: '10 a 49 empleados (Pequeña empresa)',   estrato: 'B1' },
  { label: '50 a 249 empleados (Mediana empresa)',  estrato: 'C'  },
]
const ANTIGUEDAD_EMPRESA = [
  'Menos de 2 años','2 a 5 años','5 a 10 años','10 a 20 años','Más de 20 años'
]
const FAMILIAR = [
  'Sí, de primera generación',
  'Sí, de segunda generación o posterior',
  'No',
  'No lo sé'
]
const ROL_DIRECTIVO = [
  'Propietario-fundador',
  'Socio directivo',
  'Gerente contratado',
]
const FORMALIZACION = [
  'No existe ninguna formalización',
  'Existe de forma muy informal',
  'Parcialmente formalizada',
  'Mayoritariamente formalizada',
  'Totalmente formalizada y documentada',
]
const TIENE_MI = [
  'Sí, hay al menos un mando intermedio formal',
  'No, la dirección coordina directamente al equipo operativo',
]
const ANTIGUEDAD_RESPONDENTE = [
  'Menos de 1 año','1 a 3 años','3 a 5 años','5 a 10 años','Más de 10 años'
]
const AREAS = [
  'Dirección / Gerencia','Producción / Operaciones','Almacén / Logística',
  'Comercial / Ventas','Administración / Finanzas','Recursos Humanos',
  'Tecnología / Informática','Atención al cliente','Otro'
]
const CONTRATO = [
  'Indefinido','Temporal','Fijo discontinuo',
  'Autónomo / Freelance','Prácticas / Formación','Otro'
]
const JORNADA = [
  'Jornada completa','Jornada parcial','Turnos rotativos','Otro'
]
const PERSONAS_CARGO = [
  '1 a 3 personas','4 a 9 personas','10 o más personas'
]

function Campo({ label, children, required }) {
  return (
    <div className="campo-grupo">
      <label className="campo-label">
        {label}{required && <span style={{ color: '#e53e3e' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select className="campo-select" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder || 'Seleccione...'}</option>
      {options.map(o => (
        <option key={typeof o === 'string' ? o : o.label} value={typeof o === 'string' ? o : o.label}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  )
}

export default function DatosClasificacion({ version, empresaDatos, onComplete, demo = false }) {
  const needsEmpresaData = version === 'D' && !empresaDatos?.sector

  // Regex de validación de email (formato básico x@x.x)
  const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [emailDirectivo, setEmailDirectivo] = useState('')
  const [sector, setSector] = useState('')
  const [empleados, setEmpleados] = useState('')
  const [antiguedadEmpresa, setAntiguedadEmpresa] = useState('')
  const [familiar, setFamiliar] = useState('')
  const [sectorOtro, setSectorOtro] = useState('')
  const [rolDirectivo, setRolDirectivo] = useState('')
  const [formalizacion, setFormalizacion] = useState('')
  const [tieneMI, setTieneMI] = useState('')

  // Detecta si el tamaño elegido corresponde al estrato pequeño (10-49)
  // donde es necesario preguntar por la presencia de mando intermedio
  const esTamañoPequeño = empleados.startsWith('10 a 49')

  const [antiguedadRespondente, setAntiguedadRespondente] = useState('')
  const [area, setArea] = useState('')
  const [areaOtro, setAreaOtro] = useState('')
  const [contrato, setContrato] = useState('')
  const [jornada, setJornada] = useState('')
  const [personasCargo, setPersonasCargo] = useState('')

  const isValid = () => {
    if (needsEmpresaData) {
      if (!nombreEmpresa.trim() || !emailDirectivo.trim() || !emailValido(emailDirectivo) || !sector || !empleados || !antiguedadEmpresa || !familiar || !formalizacion) return false
      if (sector === 'Otro' && !sectorOtro.trim()) return false
      if (esTamañoPequeño && !tieneMI) return false
    }
    if (!antiguedadRespondente) return false
    if (version === 'D' && !rolDirectivo) return false
    if (version !== 'D') {
      if (!area || !contrato) return false
      if (area === 'Otro' && !areaOtro.trim()) return false
      if (version === 'EO' && !jornada) return false
      if (version === 'MI' && !personasCargo) return false
    }
    return true
  }

  const handleContinuar = () => {
    const payload = {
      nombre_empresa: needsEmpresaData ? nombreEmpresa.trim() : empresaDatos?.nombre,
      email_directivo: version === 'D' ? emailDirectivo.trim() : undefined,
      sector: needsEmpresaData ? (sector === 'Otro' ? sectorOtro : sector) : empresaDatos?.sector,
      empleados,
      antiguedad_empresa: antiguedadEmpresa,
      empresa_familiar: familiar,
      rol_directivo: rolDirectivo,
      formalizacion_estrategia: formalizacion,
      tiene_mi: esTamañoPequeño ? (tieneMI === 'Sí, hay al menos un mando intermedio formal') : null,
      antiguedad_respondente: antiguedadRespondente,
      area_funcional: area === 'Otro' ? areaOtro : area,
      tipo_contrato: contrato,
      jornada,
      personas_cargo: personasCargo,
    }
    onComplete(payload)
  }

  return (
    <div>
      {needsEmpresaData && (
        <div style={{ marginBottom: 24 }}>
          <div className="dimension-titulo" style={{ marginBottom: 4 }}>Datos de la empresa</div>
          <div className="dimension-instruccion">
            Solo se solicitan al primer directivo que cumplimenta el cuestionario.
          </div>

          <Campo label="Nombre de la empresa" required>
            <input
              type="text"
              className="campo-input"
              placeholder="Nombre o razón social de la empresa"
              value={nombreEmpresa}
              onChange={e => setNombreEmpresa(e.target.value)}
            />
          </Campo>

          <Campo label="Email de contacto" required>
            <input
              type="email"
              className="campo-input"
              placeholder="correo@empresa.com"
              value={emailDirectivo}
              onChange={e => setEmailDirectivo(e.target.value)}
            />
            {emailDirectivo && !emailValido(emailDirectivo) && (
              <div style={{ fontSize: '0.78rem', color: '#e53e3e', marginTop: 4 }}>
                Introduzca un email válido (ejemplo: nombre@empresa.com).
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
              Se utiliza para evitar duplicidades y para enviarle el informe de resultados.
            </div>
          </Campo>

          <Campo label="Sector de actividad" required>
            <Select value={sector} onChange={setSector} options={SECTORES} />
            {sector === 'Otro' && (
              <input
                type="text" className="campo-input" style={{ marginTop: 8 }}
                placeholder="Indique el sector"
                value={sectorOtro} onChange={e => setSectorOtro(e.target.value)}
              />
            )}
          </Campo>

          <Campo label="Número de empleados" required>
            <Select value={empleados} onChange={setEmpleados} options={EMPLEADOS} />
          </Campo>

          {esTamañoPequeño && (
            <Campo label="¿Su empresa cuenta con mandos intermedios formalizados?" required>
              <Select value={tieneMI} onChange={setTieneMI} options={TIENE_MI} />
              <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
                Se considera mando intermedio formal a una persona con cargo reconocido en la empresa (jefe de equipo, responsable de área, supervisor, etc.) que (1) ocupa una posición intermedia entre la dirección y el personal operativo, (2) supervisa de forma habitual el trabajo de al menos una persona y (3) actúa como enlace en la transmisión de directrices. La coordinación puntual sin cargo reconocido no constituye un mando intermedio formal.
              </div>
            </Campo>
          )}

          <Campo label="Antigüedad de la empresa" required>
            <Select value={antiguedadEmpresa} onChange={setAntiguedadEmpresa} options={ANTIGUEDAD_EMPRESA} />
          </Campo>

          <Campo label="¿Es una empresa familiar?" required>
            <Select value={familiar} onChange={setFamiliar} options={FAMILIAR} />
          </Campo>

          <Campo label="¿En qué medida dispone su empresa de una estrategia formalizada y documentada?" required>
            <Select value={formalizacion} onChange={setFormalizacion} options={FORMALIZACION} />
            <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
              Considere estrategia formalizada aquella definida explícitamente, comunicada y registrada en documentos internos (plan estratégico, objetivos escritos, etc.).
            </div>
          </Campo>
        </div>
      )}

      {!needsEmpresaData && empresaDatos?.sector && (
        <div style={{
          padding: '10px 14px', background: '#f0f7ff',
          borderRadius: 8, marginBottom: 20, fontSize: '0.85rem', color: '#555e7a'
        }}>
          <strong>Empresa:</strong> {empresaDatos.sector} · {empresaDatos.empleados}
        </div>
      )}

      <div>
        <div className="dimension-titulo" style={{ marginBottom: 4 }}>Sus datos</div>
        <div className="dimension-instruccion">Datos individuales del respondente.</div>

        <Campo label="Antigüedad en esta empresa" required>
          <Select value={antiguedadRespondente} onChange={setAntiguedadRespondente} options={ANTIGUEDAD_RESPONDENTE} />
        </Campo>

        {version === 'D' && (
          <Campo label="Rol en la empresa" required>
            <Select value={rolDirectivo} onChange={setRolDirectivo} options={ROL_DIRECTIVO} />
          </Campo>
        )}

        {version === 'MI' && (
          <div style={{
            background: '#fffbea', border: '1px solid #f0b429', borderRadius: 8,
            padding: '10px 14px', marginBottom: 16, fontSize: '0.83rem',
            color: '#744210', lineHeight: 1.5
          }}>
            <strong>Mando intermedio formal:</strong> cargo reconocido en la empresa (jefe de equipo, responsable de área, supervisor, etc.) con supervisión habitual de al menos una persona. Si no cumple estas condiciones, su perfil es el de empleado operativo.
          </div>
        )}
        {version !== 'D' && (
          <>
            <Campo label="Área funcional" required>
              <Select value={area} onChange={setArea} options={AREAS} />
              {area === 'Otro' && (
                <input
                  type="text" className="campo-input" style={{ marginTop: 8 }}
                  placeholder="Indique su área"
                  value={areaOtro} onChange={e => setAreaOtro(e.target.value)}
                />
              )}
            </Campo>

            <Campo label="Tipo de contrato" required>
              <Select value={contrato} onChange={setContrato} options={CONTRATO} />
            </Campo>

            {version === 'MI' && (
              <Campo label="Personas a su cargo" required>
                <Select value={personasCargo} onChange={setPersonasCargo} options={PERSONAS_CARGO} />
              </Campo>
            )}

            {version === 'EO' && (
              <Campo label="Turno o modalidad de jornada" required>
                <Select value={jornada} onChange={setJornada} options={JORNADA} />
              </Campo>
            )}
          </>
        )}
      </div>

      <div className="botones-nav" style={{ marginTop: 24 }}>
        <button
          className="btn btn-primario"
          onClick={handleContinuar}
          disabled={!demo && !isValid()}
        >
          Continuar →
        </button>
      </div>
      {!demo && !isValid() && (
        <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 8, textAlign: 'center' }}>
          Complete todos los campos obligatorios para continuar.
        </p>
      )}
    </div>
  )
}
