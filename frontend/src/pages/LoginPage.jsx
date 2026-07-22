import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { usersService } from '../modules/usuarios/services/users.service';

// ── Estilos reutilizables ─────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
  color: '#1e293b',
  background: '#f8fafc'
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: '600',
  fontSize: '13px',
  color: '#475569',
  letterSpacing: '0.03em'
};

const btnPrimaryStyle = {
  width: '100%',
  padding: '13px',
  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '700',
  cursor: 'pointer',
  letterSpacing: '0.02em',
  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.35)',
  transition: 'opacity 0.2s, transform 0.1s'
};

export default function LoginPage() {

  const { doLogin } = useAuth();
  const navigate    = useNavigate();

  // ── Estado Login ─────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Estado Modal Registro ─────────────────────────────────────────────────
  const [showRegistro, setShowRegistro] = useState(false);
  const [regUsername, setRegUsername]   = useState('');
  const [regCorreo,   setRegCorreo]     = useState('');
  const [regPassword, setRegPassword]   = useState('');
  const [regLoading,  setRegLoading]    = useState(false);
  const [regError,    setRegError]      = useState('');
  const [regSuccess,  setRegSuccess]    = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const loginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const ok = await doLogin(username, password);
    setLoginLoading(false);

    if (ok) {
      navigate('/dashboard');
    } else {
      setLoginError('Usuario o contraseña incorrectos, o la cuenta aún no ha sido aprobada.');
    }
  };

  const abrirRegistro = () => {
    setRegUsername('');
    setRegCorreo('');
    setRegPassword('');
    setRegError('');
    setRegSuccess(false);
    setShowRegistro(true);
  };

  const cerrarRegistro = () => {
    setShowRegistro(false);
    setRegSuccess(false);
    setRegCorreo('');
    setRegError('');
  };

  const registroSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    try {
      await usersService.registrar({ username: regUsername, password: regPassword, correo: regCorreo || undefined });
      setRegSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al enviar la solicitud. Intenta nuevamente.';
      setRegError(msg);
    } finally {
      setRegLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1976d2 100%)',
        padding: '16px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', 'Segoe UI', sans-serif"
      }}
    >

      {/* ── Card Login ─────────────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255,255,255,0.97)',
          padding: '40px 32px 32px',
          borderRadius: '18px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          boxSizing: 'border-box',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Logo / Título */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(25,118,210,0.4)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.3px' }}>
            SISGESTION
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
            Sistema de Gestión de Proveedores
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={loginSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Usuario</label>
            <input
              type="text"
              value={username}
              placeholder="Ingrese su usuario"
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              value={password}
              placeholder="Ingrese su contraseña"
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {loginError && (
            <div style={{
              marginBottom: '16px',
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              ⚠️ {loginError}
            </div>
          )}

          <button type="submit" disabled={loginLoading} style={{ ...btnPrimaryStyle, opacity: loginLoading ? 0.7 : 1 }}>
            {loginLoading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Separador + Registrarse */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' }}>
              ¿No tienes una cuenta?
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          <button
            type="button"
            onClick={abrirRegistro}
            style={{
              width: '100%',
              padding: '11px',
              background: 'transparent',
              border: '1.5px solid #1976d2',
              borderRadius: '8px',
              color: '#1976d2',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s'
            }}
            onMouseEnter={e => { e.target.style.background = '#eff6ff'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; }}
          >
            Registrarse
          </button>
        </div>
      </div>

      {/* ── Modal Registro ──────────────────────────────────────────────────── */}
      {showRegistro && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            backdropFilter: 'blur(3px)'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) cerrarRegistro(); }}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
          }}>

            {/* Header modal */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              padding: '22px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '17px', fontWeight: '800' }}>
                  Solicitar Acceso
                </h3>
                <p style={{ margin: '3px 0 0', color: '#94a3b8', fontSize: '12px' }}>
                  Un administrador revisará tu solicitud
                </p>
              </div>
              <button
                onClick={cerrarRegistro}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
                  width: '32px', height: '32px', cursor: 'pointer', color: 'white',
                  fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                ×
              </button>
            </div>

            {/* Body modal */}
            <div style={{ padding: '24px' }}>
              {regSuccess ? (
                /* Pantalla de éxito */
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{
                    width: '60px', height: '60px', margin: '0 auto 16px',
                    background: '#dcfce7', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h4 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '17px', fontWeight: '800' }}>
                    ¡Solicitud enviada!
                  </h4>
                  <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                    Tu solicitud fue recibida correctamente.
                    Un <strong>administrador</strong> revisará tu cuenta y te 
                    <strong> remitirá un mensaje</strong> cuando ya te encuentres habilitado para ingresar al sistema.
                  </p>
                  <button
                    onClick={cerrarRegistro}
                    style={{ ...btnPrimaryStyle, width: 'auto', padding: '10px 24px' }}
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                /* Formulario de registro */
                <form onSubmit={registroSubmit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Usuario *</label>
                    <input
                      required
                      type="text"
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      placeholder="Elige un nombre de usuario"
                      style={inputStyle}
                      autoComplete="username"
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Correo Electrónico</label>
                    <input
                      type="email"
                      value={regCorreo}
                      onChange={e => setRegCorreo(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      style={inputStyle}
                      autoComplete="email"
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Contraseña *</label>
                    <input
                      required
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Crea una contraseña segura"
                      style={inputStyle}
                      autoComplete="new-password"
                    />
                  </div>

                  {regError && (
                    <div style={{
                      marginBottom: '14px',
                      padding: '10px 14px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#dc2626',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      ⚠️ {regError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={cerrarRegistro}
                      style={{
                        padding: '10px 18px', border: '1.5px solid #e2e8f0',
                        borderRadius: '8px', background: 'white',
                        color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '14px'
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={regLoading}
                      style={{ ...btnPrimaryStyle, width: 'auto', padding: '10px 22px', opacity: regLoading ? 0.7 : 1 }}
                    >
                      {regLoading ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}