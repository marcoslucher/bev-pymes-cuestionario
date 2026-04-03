// Componente de datos de clasificación diferenciado por perfil
import { useState } from 'react'

const SECTORES = [
  'Industria y fabricación','Construcción','Comercio al por menor',
  'Comercio al por mayor','Hostelería y restauración','Transporte y logística',
  'Tecnología e informática','Servicios profesionales','Salud y bienestar',
  'Educación y formación','Agricultura y alimentación','Otro'
]
const EMPLEADOS = [
  { label: '2 a 9 empleados (Microempresa)', estrato: 'A' },
  { label: '10 a 49 empleados (Pequeña empresa)', estrato: 'B' },
  { label: '50 a 249 empleados (Mediana empresa)', estrato: 'C' },
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
      <option value="">{placeholder || 'Selecciona...'}</option>
      {options.map(o => (
        <option key={typeof o === 'string' ? o : o.label} value={typeof o === 'string' ? o : o.label}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  )
}

export default function DatosClasificacion({ version, empresaDatos, onComplete }) {
  // empresa data (only shown if needed = first director)
  const needsEmpresaData = version === 'D' && !empresaDatos?.sector

  const [sector, setSector] = useState('')
  const [empleados, setEmpleados] = useState('')
  const [antiguedadEmpresa, setAntiguedadEmpresa] = useState('')
  const [familiar, setFamiliar] = useState('')
  const [sectorOtro, setSectorOtro] = useState('')

  // individual data (all versions)
  const [antiguedadRespodente, setAntiguedadRespondente] = useState('')
  const [area, setArea] = useState('')
  const [areaOtro, setAreaOtro] = useState('')
  const [contrato, setContrato] = useState('')
  const [jornada, setJornada] = useState('')
  const [personasCargo, setPersonasCargo] = useState('')

  const isValid = () => {
    if (needsEmpresaData) {
      if (!sector || !empleados || !antiguedadEmpresa || !familiar) return false
      if (sector === 'Otro' && !sectorOtro.trim()) return false
    }
    if (!antiguedadRespodente) return false
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
      // empresa
      sector: needsEmpresaData ? (sector === 'Otro' ? sectorOtro : sector) : empresaDatos?.sector,
      empleados,
      antiguedad_empresa: antiguedadEmpresa,
      empresa_familiar: familiar,
      // individual
      antiguedad_respondente: antiguedadRespodente,
      area_funcional: area === 'Otro' ? areaOtro : area,
      tipo_contrato: contrato,
      jornada,
      personas_cargo: personasCargo,
    }
    onComplete(payload)
  }

  return (
    <div>
      {/* Datos de empresa — solo primer directivo */}
      {needsEmpresaData && (
        <div style={{ marginBottom: 24 }}>
          <div className="dimension-titulo" style={{ marginBottom: 4 }}>Datos de la empresa</div>
          <div className="dimension-instruccion">
            Solo se solicitan al primer directivo que cumplimenta el cuestionario.
          </div>

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

          <Campo label="Antigüedad de la empresa" required>
            <Select value={antiguedadEmpresa} onChange={setAntiguedadEmpresa} options={ANTIGUEDAD_EMPRESA} />
          </Campo>

          <Campo label="¿Es una empresa familiar?" required>
            <Select value={familiar} onChange={setFamiliar} options={FAMILIAR} />
          </Campo>
        </div>
      )}

      {/* Si no necesita datos empresa pero ya los tiene, mostrar resumen */}
      {!needsEmpresaData && empresaDatos?.sector && (
        <div style={{
          padding: '10px 14px', background: '#f0f7ff',
          borderRadius: 8, marginBottom: 20, fontSize: '0.85rem', color: '#555e7a'
        }}>
          <strong>Empresa:</strong> {empresaDatos.sector} · {empresaDatos.empleados}
        </div>
      )}

      {/* Datos individuales */}
      <div>
        <div className="dimension-titulo" style={{ marginBottom: 4 }}>Sus datos</div>
        <div className="dimension-instruccion">Datos individuales del respondente.</div>

        <Campo label="Antigüedad en esta empresa" required>
          <Select value={antiguedadRespodente} onChange={setAntiguedadRespondente} options={ANTIGUEDAD_RESPONDENTE} />
        </Campo>

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
          disabled={!isValid()}
          style={{ width: '100%' }}
        >
          Comenzar cuestionario →
        </button>
        {!isValid() && (
          <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 8, textAlign: 'center' }}>
            Completa todos los campos obligatorios para continuar.
          </p>
        )}
      </div>
    </div>
  )
}
