import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

// Password simple para el panel — cámbiala cuando quieras
const ADMIN_PASSWORD = 'bev2025marcos'

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(false)

  const login = (e) => {
    e.preventDefault()
    if (pwd === ADMIN_PASSWORD) {
      setAuth(true)
    } else {
      setPwdError('Contraseña incorrecta.')
    }
  }

  useEffect(() => {
    if (!auth) return
    const cargar = async () => {
      setCargando(true)

      const [{ data: empresas }, { data: dirs }, { data: mis }, { data: eos }] =
        await Promise.all([
          supabase.from('empresas').select('*').order('creada_en'),
          supabase.from('respuestas_dir').select('empresa_codigo'),
          supabase.from('respuestas_mi').select('empresa_codigo'),
          supabase.from('respuestas_eo').select('empresa_codigo, id'),
        ])

      const resumen = (empresas || []).map(emp => {
        const tieneDir = (dirs || []).some(r => r.empresa_codigo === emp.codigo)
        const tieneMI  = (mis  || []).some(r => r.empresa_codigo === emp.codigo)
        const nEO      = (eos  || []).filter(r => r.empresa_codigo === emp.codigo).length

        const completa =
          tieneDir && nEO >= 2 &&
          (emp.estrato === 'A' || tieneMI)

        return { ...emp, tieneDir, tieneMI, nEO, completa }
      })

      setDatos(resumen)
      setCargando(false)
    }
    cargar()
  }, [auth])

  const totalCompletas = datos.filter(e => e.completa).length
  const totalParciales  = datos.filter(e => !e.completa && (e.tieneDir || e.nEO > 0)).length

  if (!auth) return (
    <div className="contenedor">
      <div className="admin-login">
        <h2>Panel de administración</h2>
        <form onSubmit={login}>
          <input
            type="password"
            className="campo-input"
            placeholder="Contraseña"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setPwdError('') }}
            style={{ marginBottom: 8 }}
          />
          {pwdError && <div className="error-msg">{pwdError}</div>}
          <button className="btn btn-primario" type="submit" style={{ width: '100%', marginTop: 8 }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="contenedor">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#1e3a5f', fontSize: '1.3rem' }}>Panel de progreso — BEV PYMEs</h2>
        <p style={{ color: '#555e7a', fontSize: '0.88rem', marginTop: 4 }}>
          {totalCompletas} empresa(s) con datos completos ·{' '}
          {totalParciales} con datos parciales ·{' '}
          {datos.length - totalCompletas - totalParciales} sin respuestas
        </p>
      </div>

      {/* Barra de progreso global */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '0.82rem', color: '#555e7a', marginBottom: 6 }}>
          Progreso objetivo: {totalCompletas}/30 empresas completas
        </div>
        <div className="barra-progreso">
          <div
            className="barra-progreso-inner"
            style={{ width: `${Math.min(100, (totalCompletas / 30) * 100)}%` }}
          ></div>
        </div>
      </div>

      {cargando ? (
        <div className="cargando">
          <div className="spinner"></div>
          <p>Cargando datos...</p>
        </div>
      ) : (
        <>
          <div className="admin-grid">
            {datos.map(emp => (
              <div
                key={emp.codigo}
                className={`empresa-card ${emp.completa ? 'completa' : (emp.tieneDir || emp.nEO > 0) ? 'parcial' : ''}`}
              >
                <div className="empresa-nombre">
                  {emp.nombre || emp.codigo}
                  <span className={`estrato-badge estrato-${emp.estrato}`}>
                    Estrato {emp.estrato}
                  </span>
                </div>
                <div className="empresa-codigo">{emp.codigo} · {emp.sector || '—'}</div>

                <div className="nivel-fila">
                  <span className={`nivel-dot ${emp.tieneDir ? 'dot-ok' : 'dot-no'}`}></span>
                  Dirección {emp.tieneDir ? '✓' : '— pendiente'}
                </div>

                {emp.estrato !== 'A' && (
                  <div className="nivel-fila">
                    <span className={`nivel-dot ${emp.tieneMI ? 'dot-ok' : 'dot-no'}`}></span>
                    Mandos intermedios {emp.tieneMI ? '✓' : '— pendiente'}
                  </div>
                )}

                <div className="nivel-fila">
                  <span className={`nivel-dot ${emp.nEO >= 2 ? 'dot-ok' : emp.nEO === 1 ? 'dot-multi' : 'dot-no'}`}></span>
                  Empleados operativos: {emp.nEO} respuesta{emp.nEO !== 1 ? 's' : ''}
                  {emp.nEO < 2 ? ' (mín. 2)' : ' ✓'}
                </div>
              </div>
            ))}
          </div>

          {/* Links rápidos para copiar */}
          <div style={{
            marginTop: 32, padding: '20px 24px',
            background: 'white', borderRadius: 10,
            boxShadow: '0 2px 12px rgba(30,58,95,0.10)'
          }}>
            <h3 style={{ color: '#1e3a5f', marginBottom: 16, fontSize: '1rem' }}>
              URLs para incluir en los emails
            </h3>
            <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 2, color: '#333' }}>
              <div>
                <strong>Dirección:</strong>{' '}
                <span style={{ color: '#2e5f9e' }}>
                  {window.location.origin}/d/<strong>[CODIGO]</strong>
                </span>
              </div>
              <div>
                <strong>Mandos intermedios:</strong>{' '}
                <span style={{ color: '#15803d' }}>
                  {window.location.origin}/mi/<strong>[CODIGO]</strong>
                </span>
              </div>
              <div>
                <strong>Empleados:</strong>{' '}
                <span style={{ color: '#854d0e' }}>
                  {window.location.origin}/eo/<strong>[CODIGO]</strong>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
