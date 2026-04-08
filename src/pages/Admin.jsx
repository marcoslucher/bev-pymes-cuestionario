import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'bev2026marcos_ioi_uemc'

export default function Admin() {
  const [auth, setAuth]         = useState(false)
  const [pwd, setPwd]           = useState('')
  const [pwdError, setPwdError] = useState('')
  const [datos, setDatos]       = useState([])
  const [cargando, setCargando] = useState(false)

  const login = (e) => {
    e.preventDefault()
    if (pwd === ADMIN_PASSWORD) { setAuth(true) }
    else { setPwdError('Contraseña incorrecta.') }
  }

  useEffect(() => {
    if (!auth) return
    const cargar = async () => {
      setCargando(true)
      const [{ data: empresas }, { data: dirs }, { data: mis }, { data: eos }] =
        await Promise.all([
          supabase.from('empresas').select('*').order('estrato').order('creada_en'),
          supabase.from('respuestas_dir').select('empresa_codigo'),
          supabase.from('respuestas_mi').select('empresa_codigo'),
          supabase.from('respuestas_eo').select('empresa_codigo, id'),
        ])

      const resumen = (empresas || []).map(emp => {
        const tieneDir = (dirs || []).some(r => r.empresa_codigo === emp.codigo)
        const tieneMI  = (mis  || []).some(r => r.empresa_codigo === emp.codigo)
        const nEO      = (eos  || []).filter(r => r.empresa_codigo === emp.codigo).length
        // B1 no requiere MI, solo B2 y C
        const necesitaMI = emp.estrato === 'B2' || emp.estrato === 'C'
        const completa = tieneDir && nEO >= 2 && (!necesitaMI || tieneMI)
        return { ...emp, tieneDir, tieneMI, nEO, completa, necesitaMI }
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
          <input type="password" className="campo-input" placeholder="Contraseña"
            value={pwd} onChange={e => { setPwd(e.target.value); setPwdError('') }}
            style={{ marginBottom: 8 }} />
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

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '0.82rem', color: '#555e7a', marginBottom: 6 }}>
          Progreso objetivo: {totalCompletas} / 40 empresas completas
        </div>
        <div className="barra-progreso">
          <div className="barra-progreso-inner"
            style={{ width: `${Math.min(100, (totalCompletas / 40) * 100)}%` }}></div>
        </div>
      </div>

      {/* Resumen por estrato */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {['A','B1','B2','C'].map(est => {
          const grup = datos.filter(e => e.estrato === est)
          const comp = grup.filter(e => e.completa).length
          return (
            <div key={est} style={{
              background: '#fff', borderRadius: 10, padding: '12px 18px',
              boxShadow: '0 2px 8px rgba(30,58,95,0.08)', minWidth: 110, textAlign: 'center'
            }}>
              <span className={`estrato-badge estrato-${est}`} style={{ fontSize: '0.9rem', padding: '4px 12px' }}>
                Estrato {est}
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e3a5f', marginTop: 8 }}>
                {comp}/{grup.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>completas</div>
            </div>
          )
        })}
      </div>

      {cargando ? (
        <div className="cargando"><div className="spinner"></div><p>Cargando datos...</p></div>
      ) : (
        <div className="admin-grid">
          {datos.map(emp => (
            <div key={emp.codigo}
              className={`empresa-card ${emp.completa ? 'completa' : (emp.tieneDir || emp.nEO > 0) ? 'parcial' : ''}`}
            >
              <div className="empresa-nombre">
                {emp.nombre || emp.codigo}
                {emp.estrato && (
                  <span className={`estrato-badge estrato-${emp.estrato}`}>
                    {emp.estrato}
                  </span>
                )}
              </div>
              <div className="empresa-codigo">{emp.codigo} · {emp.sector || '—'}</div>

              <div className="nivel-fila">
                <span className={`nivel-dot ${emp.tieneDir ? 'dot-ok' : 'dot-no'}`}></span>
                Dirección {emp.tieneDir ? '✓' : '— pendiente'}
              </div>

              {emp.necesitaMI && (
                <div className="nivel-fila">
                  <span className={`nivel-dot ${emp.tieneMI ? 'dot-ok' : 'dot-no'}`}></span>
                  Mandos intermedios {emp.tieneMI ? '✓' : '— pendiente'}
                </div>
              )}

              <div className="nivel-fila">
                <span className={`nivel-dot ${emp.nEO >= 2 ? 'dot-ok' : emp.nEO === 1 ? 'dot-multi' : 'dot-no'}`}></span>
                Empleados: {emp.nEO} respuesta{emp.nEO !== 1 ? 's' : ''}
                {emp.nEO < 2 ? ' (mín. 2)' : ' ✓'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
