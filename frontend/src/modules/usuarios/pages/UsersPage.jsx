import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { usersService } from '../services/users.service'; 
import { Lock, Unlock } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  // ESTADOS PARA EL MODAL Y EL FORMULARIO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR'); // 'CREAR' o 'EDITAR'
  const [usuarioIdEditar, setUsuarioIdEditar] = useState(null);
  
  const [formData, setFormData] = useState({ 
    username: '', 
    correo: '', 
    password: '', 
    rol_id: '', 
    primer_ingreso: 'L' 
  }); 
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista maestra e inmutable de los roles autorizados en la plataforma sincronizados con tu script SQL
  const catalogoRolesFijos = [
    { id: 1, nombre: 'Administrador', codigo: 'ADMIN' },
    { id: 2, nombre: 'Proveedor', codigo: 'PROVEEDOR' },
    { id: 3, nombre: 'Consultor', codigo: 'CONSULTOR' }
  ];

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(data); 
      
      // Inicializar el primer rol disponible si el formulario está vacío
      if (!formData.rol_id) {
        setFormData(prev => ({ ...prev, rol_id: '2' })); // Por defecto arranca en Proveedor
      }
    } catch (err) {
      console.error("Error al traer usuarios de la DB:", err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const abrirModalEditar = (user) => {
    setModoModal('EDITAR');
    setUsuarioIdEditar(user.usuario_id);
    setFormData({
      username: user.username || '',
      correo: user.correo || '',
      password: '', 
      rol_id: user.rol_id ? user.rol_id.toString() : '', // Captura el ID real numérico asignado en Postgres
      primer_ingreso: user.primer_ingreso || 'L'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const abrirModalCrear = () => {
    setModoModal('CREAR');
    setUsuarioIdEditar(null);
    
    setFormData({ 
      username: '', 
      correo: '', 
      password: '', 
      rol_id: '2', // Inicializa por defecto apuntando al ID de Proveedor
      primer_ingreso: 'L' 
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    // Encontrar el rol seleccionado actual en base a nuestra lista maestra fijos
    const rolActual = catalogoRolesFijos.find(r => r.id.toString() === formData.rol_id.toString());
    const esAdminOConsultor = rolActual?.codigo === 'ADMIN' || rolActual?.codigo === 'CONSULTOR';

    // Si es Admin o Consultor, se guarda forzosamente bloqueado en 'L' para no alterar permisos de fichas corporativas
    const datosEnviar = {
      ...formData,
      primer_ingreso: esAdminOConsultor ? 'L' : formData.primer_ingreso
    };

    try {
      if (modoModal === 'CREAR') {
        await usersService.create(datosEnviar);
      } else {
        await usersService.update(usuarioIdEditar, datosEnviar);
      }
      setIsModalOpen(false); 
      loadUsers(); 
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Error al procesar los datos de rol.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cambiarEstadoPermisoRapido = async (user) => {
    const nuevoEstado = user.primer_ingreso === 'H' ? 'L' : 'H';
    try {
      await usersService.update(user.usuario_id, {
        username: user.username,
        correo: user.correo,
        rol_id: user.rol_id,
        primer_ingreso: nuevoEstado
      });
      loadUsers();
    } catch (err) {
      alert("No se pudo actualizar el estado de edición en la base de datos.");
    }
  };

  if (loading && users.length === 0) return <div style={{ padding: '30px', color: '#0F172A' }}>Cargando usuarios desde la DB...</div>;
  if (error) return <div style={{ padding: '30px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '30px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'sans-serif', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: '#0F172A', margin: 0, fontWeight: '700' }}>Gestión de Usuarios</h2>
        <button 
          onClick={abrirModalCrear} 
          style={{
            backgroundColor: '#2563EB', color: 'white', border: 'none', padding: '10px 18px',
            borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}
        >
          + Crear Nuevo Usuario
        </button>
      </div>
      
      <div style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
        <table border="0" cellPadding="14" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#0F172A', color: 'white', fontSize: '14px' }}>
              <th>Nombre de Usuario</th>
              <th>Email</th>
              <th>Rol Asignado</th>
              <th style={{ textAlign: 'center' }}>Permiso Ficha Edición</th>
              <th style={{ textAlign: 'center' }}>Acciones</th> 
            </tr>
          </thead>
          <tbody style={{ color: '#334155', fontSize: '14px' }}>
            {users.map((user, index) => (
              <tr key={user.usuario_id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                <td style={{ fontWeight: '500' }}>{user.username}</td>
                <td>{user.correo || 'No registrado'}</td>
                <td>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '6px', 
                    backgroundColor: user.rol_codigo === 'ADMIN' ? '#fee2e2' : user.rol_codigo === 'CONSULTOR' ? '#f0fdf4' : '#e2e8f0',
                    color: user.rol_codigo === 'ADMIN' ? '#991b1b' : user.rol_codigo === 'CONSULTOR' ? '#166534' : '#334155', 
                    fontWeight: 'bold', fontSize: '12px'
                  }}>
                    {user.rol_nombre || (user.rol_codigo === 'CONSULTOR' ? 'Consultor' : user.rol_codigo)}
                  </span>
                </td>
                
                <td style={{ textAlign: 'center' }}>
                  {user.rol_codigo === 'PROVEEDOR' ? (
                    <button
                      onClick={() => cambiarEstadoPermisoRapido(user)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none',
                        padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                        backgroundColor: user.primer_ingreso === 'H' ? '#dcfce7' : '#fee2e2',
                        color: user.primer_ingreso === 'H' ? '#166534' : '#991b1b'
                      }}
                    >
                      {user.primer_ingreso === 'H' ? <Unlock size={13} /> : <Lock size={13} />}
                      {user.primer_ingreso === 'H' ? 'HABILITADA' : 'BLOQUEADA'}
                    </button>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>No aplica</span>
                  )}
                </td>

                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => abrirModalEditar(user)} 
                      style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => navigate(`/usuarios/${user.usuario_id}`)} 
                      style={{ backgroundColor: '#2563EB', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'white' }}
                    >
                      Ver
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#0F172A', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
              {modoModal === 'CREAR' ? 'Registrar Nuevo Usuario' : 'Modificar Usuario'}
            </h3>
            
            {formError && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>⚠️ {formError}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Username *</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Correo Electrónico</label>
                <input type="email" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                  {modoModal === 'CREAR' ? 'Contraseña Inicial *' : 'Cambiar Contraseña (Dejar vacío para mantener)'}
                </label>
                <input required={modoModal === 'CREAR'} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Asignar Rol *</label>
                <select value={formData.rol_id} onChange={e => setFormData({...formData, rol_id: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white' }}>
                  {catalogoRolesFijos.map(rol => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const rolActual = catalogoRolesFijos.find(r => r.id.toString() === formData.rol_id.toString());
                if (rolActual?.codigo === 'PROVEEDOR') {
                  return (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Estado de Edición Ficha *</label>
                      <select value={formData.primer_ingreso} onChange={e => setFormData({...formData, primer_ingreso: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white' }}>
                        <option value="H">HABILITADA (Permitir cambios)</option>
                        <option value="L">BLOQUEADA (Solo lectura)</option>
                      </select>
                    </div>
                  );
                }
                return null;
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#e2e8f0', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}