import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { obtenerProveedores, obtenerProveedorPorId, crearProveedor } from '../services/providers.service';
import { obtenerDepartamentos, obtenerProvincias, obtenerDistritos } from '../services/ubigeos.service';
import { obtenerCatalogo } from '../services/catalogos.service';
import ModalProveedor from '../components/ModalProveedor';
import ModalVerProveedor from '../components/ModalVerProveedor';
import { exportarExcel } from '../utils/exportExcel';

const colors = {
    card: '#ffffff',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
    primary: '#2563eb',
    amber: '#f59e0b',
    success: '#166534',
    successBg: '#dcfce7',
    danger: '#991b1b',
    dangerBg: '#fee2e2',
};

const styles = {
    heading: {
        fontSize: '24px',
        fontWeight: 700,
        color: colors.text,
        margin: 0,
    },
    card: {
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    toolbarRow: {
        display: 'flex',
        alignItems: 'stretch',
        gap: '24px',
        flexWrap: 'wrap',
    },
    toolbarSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flex: 1,
        minWidth: '260px',
    },
    toolbarLabel: {
        fontSize: '13px',
        fontWeight: 700,
        color: colors.text,
        margin: 0,
    },
    toolbarDivider: {
        width: '1px',
        background: colors.border,
        alignSelf: 'stretch',
    },
    searchInput: {
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        fontSize: '14px',
        color: colors.text,
        outline: 'none',
        boxSizing: 'border-box',
    },
    btnPrimary: {
        background: colors.primary,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    btnSuccess: {
        background: colors.success,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '12px 16px',
        fontSize: '13px',
        fontWeight: 700,
        color: colors.text,
        borderBottom: `1px solid ${colors.border}`,
        background: '#f9fafb',
    },
    td: {
        padding: '14px 16px',
        fontSize: '14px',
        color: colors.text,
        borderBottom: `1px solid ${colors.border}`,
    },
    badge: (ok) => ({
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
        background: ok ? colors.successBg : colors.dangerBg,
        color: ok ? colors.success : colors.danger,
    }),
    rowActions: {
        display: 'flex',
        gap: '8px',
    },
    linkBtn: {
        background: colors.primary,
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '7px 14px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    linkBtnAmber: {
        background: colors.amber,
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '7px 14px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    linkBtnDisabled: {
        background: '#d1d5db',
        color: '#9ca3af',
        border: 'none',
        borderRadius: '6px',
        padding: '7px 14px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'not-allowed',
    },
    emptyState: {
        padding: '32px 16px',
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: '14px',
    },
    searchControls: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
    },
    searchSelect: {
        width: '240px',
        padding: '10px 12px',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        fontSize: '14px',
        background: '#fff',
        color: colors.text,
        outline: 'none'
    },
    labelForm: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '600',
        fontSize: '14px',
        color: colors.text
    },
    inputForm: {
        width: '100%',
        padding: '10px',
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        marginBottom: '15px',
        boxSizing: 'border-box'
    },
    alertInfo: {
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderLeft: '4px solid #2563eb',
        borderRadius: '8px',
        padding: '14px 18px',
        fontSize: '14px',
        color: '#1e40af',
        marginBottom: '20px',
    },
};

// ── Constantes de búsqueda (solo panel general) ────────────────────────────────
const CAMPOS_BUSQUEDA = [
    { value: 'ALL', label: 'Todos los campos' },
    { value: 'proveedor', label: 'Razón Social' },
    { value: 'nro_documento', label: 'N° Documento' },
    { value: 'tipo_documento', label: 'Tipo Documento' },
    { value: 'actividad_economica', label: 'Actividad Económica' },
    { value: 'estado_documentos', label: 'Estado Documentos' },
    { value: 'estado', label: 'Estado' }
];

const OPCIONES_ESTADO = [
    { value: '', label: '-- Seleccione --' },
    { value: 'ACTIVO', label: 'ACTIVO' },
    { value: 'INACTIVO', label: 'INACTIVO' }
];

const OPCIONES_ESTADO_DOCUMENTOS = [
    { value: '', label: '-- Seleccione --' },
    { value: 'VIGENTES', label: 'VIGENTES' },
    { value: 'VENCIDOS', label: 'VENCIDOS' }
];

// ── Helper seguro para leer el usuario del localStorage ───────────────────────
const obtenerUsuario = () => {
    try {
        const raw = localStorage.getItem('usuario');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export default function ProvidersPage() {
    // ── Identidad ──────────────────────────────────────────────────────────────
    const usuarioLogueado = obtenerUsuario();
    const rolCodigo = usuarioLogueado?.rol_codigo || '';
    const esAdmin = rolCodigo === 'ADMIN';
    const esProveedor = rolCodigo === 'PROVEEDOR';
    const esConsultor = rolCodigo === 'CONSULTOR';
    const miProveedorId = usuarioLogueado?.proveedor_id;

    // El proveedor puede editar su ficha solo si primer_ingreso === 'H' (habilitado por admin)
    // El consultor nunca puede editar
    const usuarioFresco = obtenerUsuario(); // re-leemos para tener el valor más fresco
    const puedeEditarFichaCompleta = !esConsultor && (!esProveedor || usuarioFresco?.primer_ingreso === 'H');

    // ── Estado general ─────────────────────────────────────────────────────────
    const [proveedores, setProveedores] = useState([]);
    const [campoBusqueda, setCampoBusqueda] = useState('ALL');
    const [valorBusqueda, setValorBusqueda] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConsultaVisible, setModalConsultaVisible] = useState(false);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [proveedorEditar, setProveedorEditar] = useState(null);

    // ── Estado formulario autoregistro (PROVEEDOR sin ficha) ──────────────────
    const [form, setForm] = useState({
        tipo_documento: '06',
        nro_documento: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        razon_social: '',
        pagina_web: '',
        representante_legal: '',
        correo: '',
        telefono: '',
        departamento: '',
        provincia: '',
        ciudad: '',
        ubigeo: '',
        direccion: '',
        ciiu: '',
        calificacion: 'R',
        status: 'A'
    });
    const [departamentos, setDepartamentos] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [ciius, setCiius] = useState([]);

    const esEmpresa = form.tipo_documento === '06';

    // ── Effects ────────────────────────────────────────────────────────────────
    // Para ADMIN y CONSULTOR: búsqueda con debounce
    useEffect(() => {
        if (esProveedor) return; // el proveedor usa su propia lógica
        const timer = setTimeout(() => {
            cargarProveedores(campoBusqueda, valorBusqueda);
        }, valorBusqueda.trim() === '' ? 0 : 400);
        return () => clearTimeout(timer);
    }, [campoBusqueda, valorBusqueda, esProveedor]);

    // Para PROVEEDOR: carga su propia ficha
    useEffect(() => {
        if (esProveedor) {
            verificarYCargarProveedor();
        }
    }, [esProveedor]);

    // Catálogos iniciales (necesarios para el formulario de autoregistro)
    useEffect(() => {
        if (esProveedor && !miProveedorId) {
            cargarInicialForm();
        }
    }, [esProveedor, miProveedorId]);

    // ── Carga general (ADMIN / CONSULTOR) ─────────────────────────────────────
    const cargarProveedores = async (campo = 'ALL', valor = '') => {
        try {
            const data = await obtenerProveedores(campo, valor);
            setProveedores(data);
        } catch (error) {
            console.error(error);
        }
    };

    // ── Carga ficha del PROVEEDOR logueado ────────────────────────────────────
    const verificarYCargarProveedor = async () => {
        try {
            const paramsCache = `?_cb=${new Date().getTime()}`;

            if (miProveedorId) {
                const miFichaUnica = await obtenerProveedorPorId(miProveedorId);
                if (miFichaUnica) {
                    setProveedores([miFichaUnica]);
                    return;
                }
            }

            // Fallback: buscar entre todos e identificar por username/correo
            const data = await obtenerProveedores(paramsCache);
            if (data && data.length > 0) {
                const miFichaReal = data.find(p =>
                    (p.correo && p.correo.toLowerCase() === usuarioLogueado?.username?.toLowerCase() + '@gmail.com') ||
                    (p.proveedor && p.proveedor.toLowerCase().includes(usuarioLogueado?.username?.toLowerCase()))
                );

                if (miFichaReal) {
                    setProveedores([miFichaReal]);
                    const usuarioCorregido = {
                        ...usuarioLogueado,
                        proveedor_id: miFichaReal.proveedor_id || miFichaReal.PROVEEDOR_ID,
                        primer_ingreso: usuarioLogueado?.primer_ingreso === 'L' ? 'L' : 'N'
                    };
                    localStorage.setItem('usuario', JSON.stringify(usuarioCorregido));
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error("Error al cargar ficha del proveedor:", error);
        }
    };

    // ── Catálogos para autoregistro ────────────────────────────────────────────
    const cargarInicialForm = async () => {
        try {
            const [resDeps, resCiiu] = await Promise.allSettled([
                obtenerDepartamentos(),
                obtenerCatalogo('0002', 'CODIGO_CIIU_SUNAT')
            ]);
            if (resDeps.status === 'fulfilled') {
                const rawDeps = resDeps.value?.data || resDeps.value || [];
                setDepartamentos(Array.isArray(rawDeps) ? rawDeps : []);
            }
            if (resCiiu.status === 'fulfilled') {
                const rawCiiu = resCiiu.value?.data || resCiiu.value || [];
                setCiius(Array.isArray(rawCiiu) ? rawCiiu : []);
            }
        } catch (error) {
            console.error("Error al inicializar catálogos:", error);
        }
    };

    const handleDepartamentoChange = async (e) => {
        const depName = e.target.value;
        setForm(prev => ({ ...prev, departamento: depName, provincia: '', ciudad: '', ubigeo: '' }));
        setProvincias([]);
        setCiudades([]);
        if (depName) {
            try {
                const res = await obtenerProvincias(depName);
                const data = res?.data || res || [];
                setProvincias(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); }
        }
    };

    const handleProvinciaChange = async (e) => {
        const provName = e.target.value;
        setForm(prev => ({ ...prev, provincia: provName, ciudad: '', ubigeo: '' }));
        setCiudades([]);
        if (provName) {
            try {
                const res = await obtenerDistritos(form.departamento, provName);
                const data = res?.data || res || [];
                setCiudades(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); }
        }
    };

    const handleDistritoChange = (e) => {
        const selectedValue = e.target.value;
        const distObjeto = ciudades.find(c =>
            (c.ubigeo_inei || c.UBIGEO_INEI || c.ubigeo_reniec || c.id || '').toString() === selectedValue.toString()
        );
        const nombreDistrito = distObjeto?.distrito || distObjeto?.DISTRITO || distObjeto?.name || selectedValue;
        setForm(prev => ({ ...prev, ciudad: nombreDistrito, ubigeo: selectedValue }));
    };

    // ── Guardar autoregistro ───────────────────────────────────────────────────
    const guardarAutoregistro = async (e) => {
        e.preventDefault();
        try {
            const razonSocialFinal = esEmpresa ? form.razon_social : '';

            const res = await crearProveedor({
                ...form,
                razon_social: razonSocialFinal,
                representante_legal: esEmpresa ? form.representante_legal : '',
                create_by: usuarioLogueado.usuario_id,
                usuario_id: usuarioLogueado.usuario_id
            });

            const nuevoProveedorId = res?.proveedor_id || res?.data?.proveedor_id;

            if (nuevoProveedorId) {
                const usuarioActualizado = {
                    ...usuarioLogueado,
                    proveedor_id: nuevoProveedorId,
                    primer_ingreso: usuarioLogueado?.primer_ingreso === 'L' ? 'L' : 'N'
                };
                localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
                alert('Ficha corporativa registrada correctamente. Ingresando al panel de control.');
                window.location.reload();
            } else {
                alert('Ficha registrada correctamente. Reinicie sesión para actualizar sus accesos.');
                localStorage.removeItem('usuario');
                window.location.replace('/');
            }
        } catch (error) {
            alert(error.response?.data?.message || error.message);
        }
    };

    // ── Acciones de tabla ──────────────────────────────────────────────────────
    const consultarProveedor = async (proveedorId) => {
        try {
            const data = await obtenerProveedorPorId(proveedorId);
            setProveedorSeleccionado(data);
            setModalConsultaVisible(true);
        } catch (error) { console.error(error); }
    };

    const editarProveedor = async (proveedorId) => {
        if (esConsultor) {
            alert("Acceso denegado: El rol CONSULTOR solo cuenta con permisos de lectura.");
            return;
        }
        if (esProveedor && !puedeEditarFichaCompleta) {
            alert("La edición de la Ficha Informativa se encuentra BLOQUEADA. Solicite la habilitación al Administrador.");
            return;
        }
        try {
            const data = await obtenerProveedorPorId(proveedorId);
            setProveedorEditar(data);
            setModalVisible(true);
        } catch (error) { console.error(error); }
    };

    // ── Exportar Excel (ADMIN y CONSULTOR) ────────────────────────────────────
    const exportarListado = () => {
        exportarExcel({
            nombreArchivo: 'PROVEEDORES',
            nombreHoja: 'PROVEEDORES',
            titulo: 'SISGESTION',
            subtitulo: 'Listado de Proveedores',
            columnas: [
                { titulo: 'Tipo Documento', campo: 'tipo_documento', ancho: 35 },
                { titulo: 'N° Documento', campo: 'nro_documento', ancho: 20 },
                { titulo: 'Razón Social', campo: 'proveedor', ancho: 45 },
                { titulo: 'Página Web', campo: 'pagina_web', ancho: 45 },
                { titulo: 'Actividad Económica', campo: 'actividad_economica', ancho: 50 },
                { titulo: 'Estado Documentos', campo: 'estado_documentos', ancho: 20 },
                { titulo: 'Estado Proveedor', campo: 'estado', ancho: 15 }
            ],
            datos: proveedores
        });
    };

    // ── Control de búsqueda dinámico ──────────────────────────────────────────
    const renderControlBusqueda = () => {
        if (campoBusqueda === 'estado') {
            return (
                <select
                    value={valorBusqueda}
                    onChange={(e) => setValorBusqueda(e.target.value)}
                    style={styles.searchInput}
                >
                    {OPCIONES_ESTADO.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                </select>
            );
        }
        if (campoBusqueda === 'estado_documentos') {
            return (
                <select
                    value={valorBusqueda}
                    onChange={(e) => setValorBusqueda(e.target.value)}
                    style={styles.searchInput}
                >
                    {OPCIONES_ESTADO_DOCUMENTOS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                </select>
            );
        }
        return (
            <input
                type="text"
                value={valorBusqueda}
                onChange={(e) => setValorBusqueda(e.target.value)}
                placeholder="Ingrese el criterio de búsqueda..."
                style={styles.searchInput}
            />
        );
    };

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <MainLayout>
            <style>{`
                @media (max-width: 700px) {
                    .toolbar-divider { display: none; }
                    .toolbar-section { min-width: 100% !important; }
                }
                .table-scroll {
                    width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                .table-scroll table {
                    min-width: 720px;
                }
            `}</style>

            {/* ════════════════════════════════════════════════════════════════
                CASO A: PROVEEDOR sin ficha → Formulario de autoregistro
            ════════════════════════════════════════════════════════════════ */}
            {esProveedor && !miProveedorId ? (
                <div style={{ maxWidth: '850px', margin: '0 auto', padding: '10px 0' }}>
                    <div style={{ marginBottom: '25px' }}>
                        <h1 style={styles.heading}>Completar Ficha de Proveedor</h1>
                        <p style={{ color: colors.textMuted, margin: '5px 0 0 0', fontSize: '14px' }}>
                            Por favor, registre la información oficial de su entidad para habilitar sus accesos dentro de la plataforma.
                        </p>
                    </div>

                    <form onSubmit={guardarAutoregistro} style={styles.card}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={styles.labelForm}>Tipo Documento *</label>
                                <select style={styles.inputForm} value={form.tipo_documento} onChange={e => setForm({ ...form, tipo_documento: e.target.value })}>
                                    <option value="06">RUC</option>
                                    <option value="01">DNI</option>
                                    <option value="04">Carnet de Extranjería</option>
                                </select>
                            </div>
                            <div>
                                <label style={styles.labelForm}>Nro Documento *</label>
                                <input required type="text" style={styles.inputForm} value={form.nro_documento} onChange={e => setForm({ ...form, nro_documento: e.target.value })} />
                            </div>
                        </div>

                        {esEmpresa ? (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={styles.labelForm}>Razón Social *</label>
                                <input required type="text" style={styles.inputForm} value={form.razon_social} onChange={e => setForm({ ...form, razon_social: e.target.value })} />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={styles.labelForm}>Nombre *</label>
                                    <input required type="text" style={styles.inputForm} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                                </div>
                                <div>
                                    <label style={styles.labelForm}>Apellido Paterno *</label>
                                    <input required type="text" style={styles.inputForm} value={form.apellido_paterno} onChange={e => setForm({ ...form, apellido_paterno: e.target.value })} />
                                </div>
                                <div>
                                    <label style={styles.labelForm}>Apellido Materno *</label>
                                    <input required type="text" style={styles.inputForm} value={form.apellido_materno} onChange={e => setForm({ ...form, apellido_materno: e.target.value })} />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={styles.labelForm}>Correo Contacto *</label>
                                <input required type="email" style={styles.inputForm} value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} />
                            </div>
                            <div>
                                <label style={styles.labelForm}>Teléfono *</label>
                                <input required type="text" style={styles.inputForm} value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={styles.labelForm}>Página Web</label>
                            <input type="text" style={styles.inputForm} value={form.pagina_web} onChange={e => setForm({ ...form, pagina_web: e.target.value })} />
                        </div>

                        {esEmpresa && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={styles.labelForm}>Representante Legal *</label>
                                <input required type="text" style={styles.inputForm} value={form.representante_legal} onChange={e => setForm({ ...form, representante_legal: e.target.value })} />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={styles.labelForm}>Departamento *</label>
                                <select required style={styles.inputForm} value={form.departamento} onChange={handleDepartamentoChange}>
                                    <option value="">Seleccione</option>
                                    {departamentos.map((d, index) => {
                                        const name = d?.departamento || d?.DEPARTAMENTO || d?.name || d?.nombre;
                                        return <option key={index} value={name}>{name}</option>;
                                    })}
                                </select>
                            </div>
                            <div>
                                <label style={styles.labelForm}>Provincia *</label>
                                <select required style={styles.inputForm} value={form.provincia} onChange={handleProvinciaChange}>
                                    <option value="">Seleccione</option>
                                    {provincias.map((p, index) => {
                                        const name = p?.provincia || p?.PROVINCIA || p?.name || p?.nombre;
                                        return <option key={index} value={name}>{name}</option>;
                                    })}
                                </select>
                            </div>
                            <div>
                                <label style={styles.labelForm}>Distrito / Ciudad *</label>
                                <select required style={styles.inputForm} value={form.ubigeo} onChange={handleDistritoChange}>
                                    <option value="">Seleccione</option>
                                    {ciudades.map((c, index) => {
                                        const id = c?.ubigeo_inei || c?.UBIGEO_INEI || c?.ubigeo_reniec || c?.codigo || c?.id;
                                        const name = c?.distrito || c?.DISTRITO || c?.name || c?.nombre;
                                        return <option key={index} value={id}>{name}</option>;
                                    })}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={styles.labelForm}>Dirección *</label>
                            <input required type="text" style={styles.inputForm} value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={styles.labelForm}>Actividad Económica (CIIU) *</label>
                            <select required style={styles.inputForm} value={form.ciiu} onChange={e => setForm({ ...form, ciiu: e.target.value })}>
                                <option value="">Seleccione Actividad</option>
                                {ciius.map((c, index) => {
                                    const obj = Object.keys(c).reduce((acc, key) => {
                                        acc[key.toLowerCase()] = c[key];
                                        return acc;
                                    }, {});
                                    const code = obj.codigo_valor || obj.ciiu || obj.id_ciiu || obj.nro_ciiu || obj.code || obj.codigo || obj.id_catalogo;
                                    const label = obj.label || obj.descripcion || obj.nombre || obj.actividad || obj.descripcion_ciiu;
                                    return <option key={index} value={code}>{code} - {label}</option>;
                                })}
                            </select>
                        </div>

                        <button type="submit" style={{ ...styles.btnPrimary, width: '100%', padding: '12px' }}>
                            Guardar Ficha Informativa
                        </button>
                    </form>
                </div>

            ) : esProveedor && miProveedorId ? (
                /* ════════════════════════════════════════════════════════════
                   CASO B: PROVEEDOR con ficha → Vista individual de su ficha
                ════════════════════════════════════════════════════════════ */
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '20px' }}>
                        <div>
                            <h1 style={styles.heading}>Bienvenido</h1>
                            <p style={{ color: colors.textMuted, margin: '5px 0 0 0', fontSize: '14px' }}>
                                Panel corporativo exclusivo para el seguimiento de la ficha informativa.
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {puedeEditarFichaCompleta ? (
                                <button style={styles.linkBtnAmber} onClick={() => editarProveedor(proveedores[0]?.proveedor_id || proveedores[0]?.PROVEEDOR_ID)}>
                                    Modificar Ficha
                                </button>
                            ) : (
                                <button style={styles.linkBtnDisabled} onClick={() => alert("La edición de la Ficha Informativa se encuentra BLOQUEADA. Solicite la habilitación al Administrador.")}>
                                    Modificar Ficha (Bloqueado)
                                </button>
                            )}
                            <span style={styles.badge((proveedores[0]?.status || proveedores[0]?.STATUS) === 'A')}>
                                {(proveedores[0]?.status || proveedores[0]?.STATUS) === 'A' ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={{ margin: '0 0 25px 0', fontSize: '16px', fontWeight: '700', color: colors.text, borderBottom: `1px solid ${colors.border}`, paddingBottom: '10px' }}>
                            Información del Proveedor
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>TIPO DOCUMENTO</label>
                                <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.descripcion_tipo_documento || proveedores[0]?.tipo_documento}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>NÚMERO DE DOCUMENTO</label>
                                <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.nro_documento}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>TELÉFONO</label>
                                <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.telefono || 'No registrado'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>CORREO ELECTRÓNICO</label>
                                <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text, wordBreak: 'break-all' }}>{proveedores[0]?.correo || 'No registrado'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>PÁGINA WEB</label>
                                <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.pagina_web || 'No registrada'}</div>
                            </div>
                        </div>

                        {/* Identidad: RUC → Razón Social y Rep Legal | DNI/CE → Nombres */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px', marginBottom: '5px' }}>
                            {proveedores[0]?.tipo_documento === '06' ? (
                                <>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>RAZÓN SOCIAL</label>
                                        <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.razon_social || 'No registrada'}</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>REPRESENTANTE LEGAL</label>
                                        <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.representante_legal || 'No registrado'}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>NOMBRE</label>
                                        <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.nombre || 'No registrado'}</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>APELLIDO PATERNO</label>
                                        <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.apellido_paterno || 'No registrado'}</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>APELLIDO MATERNO</label>
                                        <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.apellido_materno || 'No registrado'}</div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px', marginTop: '15px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>ACTIVIDAD ECONÓMICA (CIIU)</label>
                                <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>
                                    {proveedores[0]?.ciiu ? `${proveedores[0].ciiu} - ${proveedores[0]?.descripcion_ciiu || ''}` : 'No especificada'}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>DEPARTAMENTO</label>
                                <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.departamento || 'No registrado'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>PROVINCIA</label>
                                <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.provincia || 'No registrado'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>DISTRITO / CIUDAD</label>
                                <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.ciudad || 'No registrado'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>UBIGEO</label>
                                <div style={{ padding: '8px 0', fontSize: '14px', fontWeight: '500', color: colors.text }}>{proveedores[0]?.ubigeo || 'No registrado'}</div>
                            </div>
                        </div>

                        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '20px', marginTop: '15px' }}>
                            <label style={{ display: 'block', fontSize: '11px', color: colors.textMuted, fontWeight: '700' }}>DIRECCIÓN</label>
                            <div style={{ padding: '8px 0', fontSize: '14px', color: colors.text, fontWeight: '500' }}>{proveedores[0]?.direccion || 'Sin dirección registrada'}</div>
                        </div>
                    </div>
                </div>

            ) : (
                /* ════════════════════════════════════════════════════════════
                   CASO C: ADMIN y CONSULTOR → Panel general de proveedores
                ════════════════════════════════════════════════════════════ */
                <>
                    <h1 style={styles.heading}>Proveedores</h1>

                    {/* Aviso solo-lectura para CONSULTOR */}
                    {esConsultor && (
                        <div style={{ ...styles.alertInfo, marginTop: '16px' }}>
                            ⚠️ <strong>Modo consulta:</strong> Usted tiene acceso de solo lectura. No puede crear ni editar proveedores.
                        </div>
                    )}

                    {/* Toolbar */}
                    <div style={{ ...styles.card, marginTop: '20px' }}>
                        <div style={styles.toolbarRow}>
                            <div style={styles.toolbarSection}>
                                <p style={styles.toolbarLabel}>Búsqueda</p>
                                <div style={styles.searchControls}>
                                    <select
                                        value={campoBusqueda}
                                        onChange={(e) => {
                                            setCampoBusqueda(e.target.value);
                                            setValorBusqueda('');
                                        }}
                                        style={styles.searchSelect}
                                    >
                                        {CAMPOS_BUSQUEDA.map(campo => (
                                            <option key={campo.value} value={campo.value}>{campo.label}</option>
                                        ))}
                                    </select>
                                    {renderControlBusqueda()}
                                </div>
                            </div>

                            <div style={styles.toolbarDivider} />

                            <div style={styles.toolbarSection}>
                                <p style={styles.toolbarLabel}>Acciones de Registro</p>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {/* Botón Nuevo Proveedor: solo ADMIN */}
                                    {esAdmin && (
                                        <button
                                            style={{ ...styles.btnPrimary, alignSelf: 'flex-start' }}
                                            onClick={() => setModalVisible(true)}
                                        >
                                            + Nuevo Proveedor
                                        </button>
                                    )}
                                    {/* Exportar Excel: ADMIN y CONSULTOR */}
                                    <button style={styles.btnSuccess} onClick={exportarListado}>
                                        Exportar Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div style={{ ...styles.card, marginTop: '20px', padding: 0 }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Tipo Documento</th>
                                    <th style={styles.th}>Nro Documento</th>
                                    <th style={styles.th}>Razón Social</th>
                                    <th style={styles.th}>Página Web</th>
                                    <th style={styles.th}>Actividad Económica</th>
                                    <th style={styles.th}>Estado Documentos</th>
                                    <th style={styles.th}>Estado Proveedor</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proveedores.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={styles.emptyState}>No se encontraron proveedores.</td>
                                    </tr>
                                ) : proveedores.map(item => (
                                    <tr key={item.proveedor_id}>
                                        <td style={styles.td}>{item.tipo_documento}</td>
                                        <td style={styles.td}>{item.nro_documento}</td>
                                        <td style={styles.td}>{item.proveedor}</td>
                                        <td style={styles.td}>{item.pagina_web}</td>
                                        <td style={styles.td}>{item.actividad_economica}</td>
                                        <td style={styles.td}>
                                            <span style={styles.badge(item.estado_documentos === 'VIGENTES')}>
                                                {item.estado_documentos}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.badge(item.estado === 'ACTIVO')}>
                                                {item.estado}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.rowActions}>
                                                <button style={styles.linkBtn} onClick={() => consultarProveedor(item.proveedor_id)}>
                                                    Ver
                                                </button>
                                                {/* Botón Editar: solo ADMIN */}
                                                {esAdmin && (
                                                    <button style={styles.linkBtnAmber} onClick={() => editarProveedor(item.proveedor_id)}>
                                                        Editar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ── Modales (disponibles en todos los casos que apliquen) ────── */}
            <ModalProveedor
                visible={modalVisible}
                proveedorEditar={proveedorEditar}
                onClose={() => {
                    setModalVisible(false);
                    setProveedorEditar(null);
                }}
                onSuccess={() => {
                    if (esProveedor) {
                        verificarYCargarProveedor();
                    } else {
                        cargarProveedores(campoBusqueda, valorBusqueda);
                    }
                }}
            />

            <ModalVerProveedor
                visible={modalConsultaVisible}
                proveedor={proveedorSeleccionado}
                onClose={() => setModalConsultaVisible(false)}
            />
        </MainLayout>
    );
}