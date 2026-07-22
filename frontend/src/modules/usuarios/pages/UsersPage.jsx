import { useEffect, useState } from 'react';
import { usersService } from '../services/users.service';
import { Lock, Unlock, Eye, EyeOff, Copy, CheckCheck, UserCheck, UserX } from 'lucide-react';

// ── Helpers de estilo ─────────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  A: { label: 'Activo',    bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
  P: { label: 'Pendiente', bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04' },
  R: { label: 'Rechazado', bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' },
  I: { label: 'Inactivo',  bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' }
};

const ROL_CONFIG = {
  ADMIN:     { bg: '#fee2e2', color: '#991b1b' },
  CONSULTOR: { bg: '#eff6ff', color: '#1d4ed8' },
  PROVEEDOR: { bg: '#e2e8f0', color: '#334155' }
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '7px',
  border: '1.5px solid #e2e8f0',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: '#f8fafc',
  color: '#1e293b'
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: '600',
  fontSize: '12px',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

// ── Roles fijos ───────────────────────────────────────────────────────────────
const catalogoRolesFijos = [
  { id: 1, nombre: 'Administrador', codigo: 'ADMIN' },
  { id: 2, nombre: 'Proveedor',     codigo: 'PROVEEDOR' },
  { id: 3, nombre: 'Consultor',     codigo: 'CONSULTOR' }
];

// ── Componente Badge de estado ────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.I;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '20px',
      background: cfg.bg, color: cfg.color,
      fontWeight: '700', fontSize: '11px', whiteSpace: 'nowrap'
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: cfg.dot, flexShrink: 0
      }} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Filtro activo: 'TODOS' | 'ACTIVOS' | 'PENDIENTES' | 'RECHAZADOS'
  const [filtroActivo, setFiltroActivo] = useState('TODOS');

  // ── Modal Crear/Editar ────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [modoModal, setModoModal]         = useState('CREAR');
  const [usuarioIdEditar, setUsuarioIdEditar] = useState(null);
  const [formData, setFormData]           = useState({
    username: '', correo: '', password: '', rol_id: '2', primer_ingreso: 'L'
  });
  const [formError, setFormError]         = useState(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  // ── Modal Ver ─────────────────────────────────────────────────────────────
  const [isVerModalOpen, setIsVerModalOpen] = useState(false);
  const [userVer, setUserVer]               = useState(null);
  const [showPassword, setShowPassword]     = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [passwordMap, setPasswordMap]       = useState({});

  // ── Modal Aprobar ─────────────────────────────────────────────────────────
  const [isAprobarOpen, setIsAprobarOpen]         = useState(false);
  const [usuarioAprobar, setUsuarioAprobar]        = useState(null);
  const [aprobarRolId, setAprobarRolId]  = useState('2');
  const [aprobarLoading, setAprobarLoading] = useState(false);
  const [aprobarError, setAprobarError]  = useState('');

  // ── Modal Rechazar ────────────────────────────────────────────────────────
  const [isRechazarOpen, setIsRechazarOpen] = useState(false);
  const [usuarioRechazar, setUsuarioRechazar]= useState(null);
  const [rechazarLoading, setRechazarLoading]= useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  const loadUsers = async (filtro = filtroActivo) => {
    try {
      setLoading(true);
      const data = await usersService.getAll(filtro);
      setUsers(data);
    } catch (err) {
      console.error('Error al traer usuarios:', err);
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers('TODOS'); }, []);

  const cambiarFiltro = (f) => {
    setFiltroActivo(f);
    loadUsers(f);
  };

  // Contadores por estado para los badges de filtro
  const contadores = users.reduce((acc, u) => {
    const e = u.estado_usuario || 'I';
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {});

  // ── CRUD modal crear/editar ───────────────────────────────────────────────
  const abrirModalCrear = () => {
    setModoModal('CREAR');
    setUsuarioIdEditar(null);
    setFormData({ username: '', correo: '', password: '', rol_id: '2', primer_ingreso: 'L' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (user) => {
    setModoModal('EDITAR');
    setUsuarioIdEditar(user.usuario_id);
    setFormData({
      username:      user.username || '',
      correo:        user.correo   || '',
      password:      '',
      rol_id:        user.rol_id ? user.rol_id.toString() : '',
      primer_ingreso: user.primer_ingreso || 'L'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const rolActual = catalogoRolesFijos.find(r => r.id.toString() === formData.rol_id.toString());
    const esAdminOConsultor = rolActual?.codigo === 'ADMIN' || rolActual?.codigo === 'CONSULTOR';
    const datosEnviar = {
      ...formData,
      primer_ingreso: esAdminOConsultor ? 'L' : formData.primer_ingreso
    };

    try {
      if (modoModal === 'CREAR') {
        const result = await usersService.create(datosEnviar);
        const nuevoId = result?.user?.usuario_id;
        if (nuevoId && formData.password) {
          setPasswordMap(prev => ({ ...prev, [nuevoId]: formData.password }));
        }
      } else {
        await usersService.update(usuarioIdEditar, datosEnviar);
        if (formData.password && usuarioIdEditar) {
          setPasswordMap(prev => ({ ...prev, [usuarioIdEditar]: formData.password }));
        }
      }
      setIsModalOpen(false);
      loadUsers(filtroActivo);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error al procesar.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cambiarEstadoPermisoRapido = async (user) => {
    const nuevoEstado = user.primer_ingreso === 'H' ? 'L' : 'H';
    try {
      await usersService.update(user.usuario_id, {
        username:      user.username,
        correo:        user.correo,
        rol_id:        user.rol_id,
        primer_ingreso: nuevoEstado
      });
      loadUsers(filtroActivo);
    } catch {
      alert('No se pudo actualizar el estado de edición.');
    }
  };

  // ── Flujo Aprobar ─────────────────────────────────────────────────────────
  const abrirModalAprobar = (user) => {
    setUsuarioAprobar(user);
    setAprobarRolId('2');
    setAprobarError('');
    setIsAprobarOpen(true);
  };

  const confirmarAprobar = async () => {
    setAprobarError('');
    setAprobarLoading(true);
    try {
      await usersService.aprobar(usuarioAprobar.usuario_id, {
        rol_id: parseInt(aprobarRolId, 10)
      });
      setIsAprobarOpen(false);
      loadUsers(filtroActivo);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al aprobar el usuario.';
      setAprobarError(msg);
    } finally {
      setAprobarLoading(false);
    }
  };

  // ── Flujo Rechazar ────────────────────────────────────────────────────────
  const abrirModalRechazar = (user) => {
    setUsuarioRechazar(user);
    setIsRechazarOpen(true);
  };

  const confirmarRechazar = async () => {
    setRechazarLoading(true);
    try {
      await usersService.rechazar(usuarioRechazar.usuario_id);
      setIsRechazarOpen(false);
      loadUsers(filtroActivo);
    } catch {
      alert('Error al rechazar el usuario.');
    } finally {
      setRechazarLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading && users.length === 0)
    return <div style={{ padding: '30px', color: '#0F172A' }}>Cargando usuarios...</div>;
  if (error)
    return <div style={{ padding: '30px', color: 'red' }}>{error}</div>;

  const rolActualModal = catalogoRolesFijos.find(r => r.id.toString() === aprobarRolId.toString());
  const requiereProveedorModal = rolActualModal?.codigo === 'PROVEEDOR' || rolActualModal?.codigo === 'CONSULTOR';

  return (
    <div style={{ padding: '30px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: '#0F172A', margin: 0, fontWeight: '800', fontSize: '22px' }}>
            Gestión de Usuarios
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
            Administra los accesos y estados de los usuarios del sistema
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          style={{
            backgroundColor: '#2563EB', color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: '700', fontSize: '14px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          + Crear Usuario
        </button>
      </div>

      {/* ── Barra de Filtros ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '20px',
        background: 'white', padding: '8px', borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', width: 'fit-content'
      }}>
        {[
          { key: 'TODOS',     label: 'Todos',     count: users.length },
          { key: 'ACTIVOS',   label: 'Activos',   count: contadores['A'] || 0 },
          { key: 'PENDIENTES',label: 'Pendientes', count: contadores['P'] || 0 },
          { key: 'RECHAZADOS',label: 'Rechazados', count: contadores['R'] || 0 }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => cambiarFiltro(key)}
            style={{
              padding: '7px 16px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: filtroActivo === key ? '700' : '500',
              fontSize: '13px',
              background: filtroActivo === key ? '#0F172A' : 'transparent',
              color: filtroActivo === key ? 'white' : '#64748b',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            {label}
            {count > 0 && (
              <span style={{
                background: filtroActivo === key ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: filtroActivo === key ? 'white' : '#475569',
                borderRadius: '10px', padding: '1px 7px',
                fontSize: '11px', fontWeight: '700', minWidth: '20px', textAlign: 'center'
              }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <div style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <table border="0" cellPadding="14" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#0F172A', color: 'white', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '14px 16px' }}>Usuario</th>
              <th style={{ padding: '14px 16px' }}>Correo</th>
              <th style={{ padding: '14px 16px' }}>Rol Asignado</th>
              <th style={{ padding: '14px 16px' }}>Estado</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Permiso Ficha</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody style={{ color: '#334155', fontSize: '14px' }}>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No hay usuarios en este estado
                </td>
              </tr>
            ) : users.map((user, index) => {
              const estado = user.estado_usuario || 'I';
              const isPendiente = estado === 'P';
              const isActivo    = estado === 'A';
              const rolCfg = ROL_CONFIG[user.rol_codigo] || ROL_CONFIG.PROVEEDOR;

              return (
                <tr
                  key={user.usuario_id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                    transition: 'background 0.15s'
                  }}
                >
                  {/* Usuario */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '800', fontSize: '13px', flexShrink: 0
                      }}>
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.username}</div>
                    </div>
                  </td>

                  {/* Correo */}
                  <td style={{ padding: '12px 16px' }}>
                    {user.correo
                      ? <span style={{ fontSize: '13px', color: '#475569' }}>{user.correo}</span>
                      : <span style={{ fontSize: '12px', color: '#cbd5e1' }}>—</span>
                    }
                  </td>

                  {/* Rol */}
                  <td style={{ padding: '12px 16px' }}>
                    {user.rol_nombre ? (
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px',
                        background: rolCfg.bg, color: rolCfg.color,
                        fontWeight: '700', fontSize: '12px'
                      }}>
                        {user.rol_nombre}
                      </span>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Sin asignar</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '12px 16px' }}>
                    <EstadoBadge estado={estado} />
                  </td>

                  {/* Permiso Ficha */}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {user.rol_codigo === 'PROVEEDOR' && isActivo ? (
                      <button
                        onClick={() => cambiarEstadoPermisoRapido(user)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          border: 'none', padding: '5px 12px', borderRadius: '20px',
                          cursor: 'pointer', fontWeight: '700', fontSize: '11px',
                          background: user.primer_ingreso === 'H' ? '#dcfce7' : '#fee2e2',
                          color:      user.primer_ingreso === 'H' ? '#166534' : '#991b1b'
                        }}
                      >
                        {user.primer_ingreso === 'H' ? <Unlock size={12} /> : <Lock size={12} />}
                        {user.primer_ingreso === 'H' ? 'HABILITADA' : 'BLOQUEADA'}
                      </button>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {/* Ver */}
                      <button
                        onClick={() => { setUserVer(user); setShowPassword(false); setCopied(false); setIsVerModalOpen(true); }}
                        title="Ver detalle"
                        style={{
                          background: '#eff6ff', border: '1px solid #bfdbfe',
                          padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '600', color: '#1d4ed8',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <Eye size={13} /> Ver
                      </button>

                      {/* Aprobar (solo pendientes) */}
                      {isPendiente && (
                        <button
                          onClick={() => abrirModalAprobar(user)}
                          title="Aprobar usuario"
                          style={{
                            background: '#dcfce7', border: '1px solid #bbf7d0',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '700', color: '#15803d',
                            display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          <UserCheck size={13} /> Aprobar
                        </button>
                      )}

                      {/* Rechazar (solo pendientes) */}
                      {isPendiente && (
                        <button
                          onClick={() => abrirModalRechazar(user)}
                          title="Rechazar usuario"
                          style={{
                            background: '#fee2e2', border: '1px solid #fecaca',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '700', color: '#dc2626',
                            display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          <UserX size={13} /> Rechazar
                        </button>
                      )}

                      {/* Editar (solo activos) */}
                      {isActivo && (
                        <button
                          onClick={() => abrirModalEditar(user)}
                          style={{
                            background: '#fff', border: '1px solid #e2e8f0',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '600', color: '#475569'
                          }}
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREAR / EDITAR USUARIO                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#0F172A', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', fontWeight: '800' }}>
              {modoModal === 'CREAR' ? '+ Registrar Nuevo Usuario' : 'Modificar Usuario'}
            </h3>

            {formError && (
              <div style={{ color: '#dc2626', marginBottom: '15px', fontSize: '13px', background: '#fef2f2', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Username *</label>
                <input required type="text" value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  style={inputStyle} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Correo Electrónico</label>
                <input type="email" value={formData.correo}
                  onChange={e => setFormData({ ...formData, correo: e.target.value })}
                  style={inputStyle} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>
                  {modoModal === 'CREAR' ? 'Contraseña Inicial *' : 'Nueva Contraseña (vacío = mantener)'}
                </label>
                <input required={modoModal === 'CREAR'} type="password" value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={inputStyle} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Asignar Rol *</label>
                <select value={formData.rol_id}
                  onChange={e => setFormData({ ...formData, rol_id: e.target.value })}
                  style={{ ...inputStyle, background: 'white' }}>
                  {catalogoRolesFijos.map(rol => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const rolActual = catalogoRolesFijos.find(r => r.id.toString() === formData.rol_id.toString());
                if (rolActual?.codigo === 'PROVEEDOR') {
                  return (
                    <div style={{ marginBottom: '18px' }}>
                      <label style={labelStyle}>Estado Ficha Edición *</label>
                      <select value={formData.primer_ingreso}
                        onChange={e => setFormData({ ...formData, primer_ingreso: e.target.value })}
                        style={{ ...inputStyle, background: 'white' }}>
                        <option value="H">HABILITADA (Permitir cambios)</option>
                        <option value="L">BLOQUEADA (Solo lectura)</option>
                      </select>
                    </div>
                  );
                }
                return null;
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)}
                  style={{ background: '#e2e8f0', border: 'none', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontWeight: '600' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting}
                  style={{ background: '#2563EB', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontWeight: '700', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: VER USUARIO                                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isVerModalOpen && userVer && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ background: 'white', borderRadius: '14px', width: '420px', maxWidth: '95vw', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)', padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: '800', color: 'white', flexShrink: 0
              }}>
                {userVer.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '17px', fontWeight: '800' }}>{userVer.username}</h3>
                <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '13px' }}>{userVer.correo || 'Sin correo registrado'}</p>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '22px 24px' }}>
              {/* Rol */}
              <div style={{ marginBottom: '14px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rol</p>
                <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                  {userVer.rol_nombre || userVer.rol_codigo || 'Sin asignar'}
                </p>
              </div>

              {/* Estado */}
              <div style={{ marginBottom: '14px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado</p>
                <div style={{ marginTop: '6px' }}><EstadoBadge estado={userVer.estado_usuario || 'I'} /></div>
              </div>

              {/* Proveedor */}
              {userVer.proveedor_nombre && (
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Proveedor</p>
                  <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{userVer.proveedor_nombre}</p>
                </div>
              )}

              {/* Contraseña */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contraseña</p>
                {passwordMap[userVer.usuario_id] ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <div style={{ flex: 1, padding: '9px 13px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'monospace', fontSize: '15px', color: '#1e293b', fontWeight: '700' }}>
                      {showPassword ? passwordMap[userVer.usuario_id] : '••••••••'}
                    </div>
                    <button onClick={() => setShowPassword(v => !v)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '9px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {showPassword ? <EyeOff size={16} color="#2563EB" /> : <Eye size={16} color="#2563EB" />}
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(passwordMap[userVer.usuario_id]); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      style={{ background: copied ? '#f0fdf4' : '#eff6ff', border: `1px solid ${copied ? '#bbf7d0' : '#bfdbfe'}`, borderRadius: '8px', padding: '9px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {copied ? <CheckCheck size={16} color="#16a34a" /> : <Copy size={16} color="#2563EB" />}
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: '6px', padding: '10px 13px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
                    ⚠️ Solo disponible durante la sesión en que fue creada.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setIsVerModalOpen(false)}
                  style={{ background: '#0F172A', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: APROBAR USUARIO                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isAprobarOpen && usuarioAprobar && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ background: 'white', borderRadius: '14px', width: '440px', maxWidth: '95vw', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #15803d, #166534)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={20} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '800' }}>Aprobar Usuario</h3>
                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>
                  {usuarioAprobar.username}
                </p>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 20px', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                Asigna el rol correspondiente para activar la cuenta. El usuario podrá rellenar su ficha al ingresar.
              </p>

              {/* Rol */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Rol *</label>
                <select
                  value={aprobarRolId}
                  onChange={e => setAprobarRolId(e.target.value)}
                  style={{ ...inputStyle, background: 'white' }}
                >
                  {catalogoRolesFijos.map(rol => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>


              {aprobarError && (
                <div style={{ marginBottom: '14px', padding: '10px 13px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>
                  ⚠️ {aprobarError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsAprobarOpen(false)}
                  style={{ background: '#e2e8f0', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Cancelar
                </button>
                <button
                  onClick={confirmarAprobar}
                  disabled={aprobarLoading}
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                    border: 'none', padding: '9px 22px', borderRadius: '8px',
                    cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    opacity: aprobarLoading ? 0.7 : 1
                  }}
                >
                  <UserCheck size={15} />
                  {aprobarLoading ? 'Aprobando...' : 'Confirmar Aprobación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: RECHAZAR USUARIO                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {isRechazarOpen && usuarioRechazar && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ background: 'white', borderRadius: '14px', width: '400px', maxWidth: '95vw', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserX size={20} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '800' }}>Rechazar Usuario</h3>
                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>{usuarioRechazar.username}</p>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 24px', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                ¿Estás seguro que deseas <strong>rechazar</strong> la solicitud de acceso de{' '}
                <strong style={{ color: '#0f172a' }}>{usuarioRechazar.username}</strong>?
                El usuario no podrá iniciar sesión.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsRechazarOpen(false)}
                  style={{ background: '#e2e8f0', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Cancelar
                </button>
                <button
                  onClick={confirmarRechazar}
                  disabled={rechazarLoading}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #991b1b)', color: 'white',
                    border: 'none', padding: '9px 22px', borderRadius: '8px',
                    cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    opacity: rechazarLoading ? 0.7 : 1
                  }}
                >
                  <UserX size={15} />
                  {rechazarLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}