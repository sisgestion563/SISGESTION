
import {
    useEffect,
    useState
} from 'react';
import { useNavigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';

import {
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

import {
    obtenerResumen,
    obtenerDocumentosPorGrupo,
    obtenerDocumentosPorEstado,
    obtenerProximosVencer,
    obtenerCumplimientoGestion,
    obtenerEstadoExpediente,
    obtenerCalificacionProveedor
} from '../services/dashboard.service';

// Reutilizamos el servicio para listar los expedientes por grupo corporativo
import { listarPorGrupo } from '../services/documentos.service';
import { obtenerProveedorPorId } from '../services/providers.service';

const formatearFechaLocal = (fechaString) => {
    if (!fechaString) return '';
    const datePart = typeof fechaString === 'string' ? fechaString.split('T')[0] : new Date(fechaString).toISOString().split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return fechaString;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
};

// Misma paleta usada en DocumentsPage (navy sidebar + acentos azul/ámbar)
const colors = {
    bg: '#f3f4f6',
    card: '#ffffff',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
    primary: '#2563eb',
    amber: '#f59e0b',
    danger: '#dc2626',
    dangerBg: '#fee2e2',
    success: '#16a34a',
    successBg: '#dcfce7',
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
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    statCard: (accent) => ({
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }),
    statLabel: {
        fontSize: '13px',
        fontWeight: 700,
        color: colors.text,
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
    },
    statValue: (accent) => ({
        fontSize: '32px',
        fontWeight: 700,
        color: accent,
        margin: '8px 0 0 0',
    }),
    sectionTitle: {
        fontSize: '17px',
        fontWeight: 700,
        color: colors.text,
        margin: '0 0 16px 0',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '4px',
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
    badge: (bg, fg) => ({
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
        background: bg,
        color: fg,
    }),
    emptyState: {
        padding: '32px 16px',
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: '14px',
    },
};

// Determina si un registro de "estado" corresponde a vigente o vencido,
// sin depender del orden en que llegue el arreglo del backend.
const esVigente = (item) => {
    const ref = `${item.estado_documento || ''} ${item.descripcion || ''}`.toUpperCase();
    return ref.includes('VIG');
};

// Urgencia para "Próximos a Vencer": rojo <=7 días, ámbar <=30 días, verde el resto.
const urgencia = (dias) => {
    if (dias <= 7) return { label: `${dias} día${dias === 1 ? '' : 's'}`, bg: colors.dangerBg, fg: colors.danger };
    if (dias <= 30) return { label: `${dias} días`, bg: '#fef3c7', fg: '#b45309' };
    return { label: `${dias} días`, bg: colors.successBg, fg: colors.success };
};

const responsiveCSS = `
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 30px;
    }
    .stats-grid.proveedor {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 900px) {
        .stats-grid, .stats-grid.proveedor { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
        .stats-grid, .stats-grid.proveedor { grid-template-columns: 1fr; }
    }
    .pie-chart-wrap {
        width: 60%;
    }
    @media (max-width: 700px) {
        .pie-chart-wrap { width: 100%; }
    }
    .table-scroll {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
    .table-scroll table {
        min-width: 480px;
    }
`;

// ── Helper seguro para leer el usuario del localStorage ───────────────────────
const obtenerUsuario = () => {
    try {
        const raw = localStorage.getItem('usuario');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// ── Grupos documentales fijos para el dashboard del PROVEEDOR ─────────────────
const CODIGOS_GRUPOS = ['DOC_NOR', 'DOC_EXT_NOR', 'DOC_REQ_ESTATAL', 'DOC_OTROS'];
const NOMBRES_GRUPOS = {
    'DOC_NOR': 'Gestión SST-MA',
    'DOC_EXT_NOR': 'Gestión de Calidad',
    'DOC_REQ_ESTATAL': 'Gestión Seg. Patrimonial',
    'DOC_OTROS': 'Código Ética'
};

const GESTION_MAP = {
    'GSG,GMA': { nombre: 'Gestión SST-MA', grupo: 'DOC_NOR', alcances: ['GSG', 'GMA'], kpiMatch: ['SST', 'MA'] },
    'GCA': { nombre: 'Gestión de Calidad', grupo: 'DOC_EXT_NOR', alcances: ['GCA'], kpiMatch: ['CALIDAD'] },
    'GPA': { nombre: 'Gestión Seg. Patrimonial', grupo: 'DOC_REQ_ESTATAL', alcances: ['GPA'], kpiMatch: ['PATRIMONIAL'] },
    'GTR': { nombre: 'Código Ética', grupo: 'DOC_OTROS', alcances: ['GTR'], kpiMatch: ['ETICA'] }
};

const obtenerNombreMostrado = (gestionRaw) => {
    const rawUpper = (gestionRaw || '').toUpperCase();
    if (rawUpper.includes('SST') || rawUpper.includes('MA')) return 'Gestión SST-MA';
    if (rawUpper.includes('CALIDAD')) return 'Gestión de Calidad';
    if (rawUpper.includes('PATRIMONIAL')) return 'Gestión Seg. Patrimonial';
    if (rawUpper.includes('ETICA')) return 'Código Ética';
    return gestionRaw;
};

export default function DashboardPage() {
    const navigate = useNavigate();

    const [resumen, setResumen] = useState(null);
    const [grupos, setGrupos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [proximos, setProximos] = useState([]);
    const [kpisGestion, setKpisGestion] = useState([]);
    const [estadoExpediente, setEstadoExpediente] = useState(null);
    const [calificacion, setCalificacion] = useState(null);
    const [loadingProveedor, setLoadingProveedor] = useState(true);
    const [proveedorInfo, setProveedorInfo] = useState(null);

    // Estado para la gestión seleccionada actualmente (por defecto ['ALL'] = Toda la información)
    const [gestionFiltro, setGestionFiltro] = useState(() => {
        try {
            const raw = localStorage.getItem('sisgestion_gestion_actual');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch { }
        return ['ALL'];
    });

    // Copias de datos brutos para filtrado reactivo
    const [rawDocsProveedor, setRawDocsProveedor] = useState([]);
    const [rawKpisProveedor, setRawKpisProveedor] = useState([]);
    const [rawCalificacion, setRawCalificacion] = useState(null);
    const [rawAdminGrupos, setRawAdminGrupos] = useState([]);
    const [rawAdminProximos, setRawAdminProximos] = useState([]);
    const [rawAdminResumen, setRawAdminResumen] = useState(null);
    const [rawAdminEstados, setRawAdminEstados] = useState([]);

    // ── Identidad del usuario logueado ──────────────────────────────────────
    const usuarioLogueado = obtenerUsuario();
    const rolCodigo = usuarioLogueado?.rol_codigo || '';
    const esProveedor = rolCodigo === 'PROVEEDOR';
    const esConsultor = rolCodigo === 'CONSULTOR';
    const miProveedorId = usuarioLogueado?.proveedor_id;

    // Escucha de cambios de gestión desde el Header
    useEffect(() => {
        const handleGestionChange = (e) => {
            if (e.detail) {
                setGestionFiltro(Array.isArray(e.detail) ? e.detail : [e.detail]);
            }
        };
        window.addEventListener('sisgestion:gestion_change', handleGestionChange);
        return () => window.removeEventListener('sisgestion:gestion_change', handleGestionChange);
    }, []);

    useEffect(() => {
        if (esProveedor) {
            cargarDashboardProveedor();
        } else {
            cargarDashboardAdmin();
        }
    }, [esProveedor, miProveedorId]);

    // Cargar información de la razón social del proveedor
    useEffect(() => {
        if (miProveedorId) {
            obtenerProveedorPorId(miProveedorId)
                .then(data => {
                    setProveedorInfo(data);
                })
                .catch(err => console.error("Error al obtener info de proveedor:", err));
        }
    }, [miProveedorId]);

    // Reaccionar al cambio de gestión para filtrar los datos en pantalla
    useEffect(() => {
        if (esProveedor) {
            aplicarFiltroProveedor(rawDocsProveedor, rawKpisProveedor, gestionFiltro);
        } else {
            aplicarFiltroAdmin(rawAdminGrupos, rawAdminProximos, rawAdminEstados, rawAdminResumen, gestionFiltro);
        }
    }, [gestionFiltro, rawDocsProveedor, rawKpisProveedor, rawCalificacion, rawAdminGrupos, rawAdminProximos, rawAdminEstados, rawAdminResumen, esProveedor]);

    // ── Dashboard ADMIN / CONSULTOR ──────────────────────────────────────────
    async function cargarDashboardAdmin() {
        try {
            const resumenData = await obtenerResumen();
            const gruposData = await obtenerDocumentosPorGrupo();
            const estadosData = await obtenerDocumentosPorEstado();
            const proximosData = await obtenerProximosVencer();

            setRawAdminResumen(resumenData);
            setRawAdminGrupos(gruposData.map(item => ({ ...item, cantidad: Number(item.cantidad) })));
            setRawAdminEstados(estadosData.map(item => ({ ...item, cantidad: Number(item.cantidad) })));
            setRawAdminProximos(proximosData);
        } catch (error) {
            console.error(error);
        }
    };

    const aplicarFiltroAdmin = (rawGrupos, rawProximosList, rawEstadosList, rawRes, gestionesCodeArray) => {
        if (!rawGrupos) return;
        const isAll = !gestionesCodeArray || gestionesCodeArray.length === 0 || gestionesCodeArray.includes('ALL');

        if (isAll) {
            setResumen(rawRes);
            setGrupos(rawGrupos);
            setEstados(rawEstadosList);
            setProximos(rawProximosList);
            return;
        }

        const configs = gestionesCodeArray.map(code => GESTION_MAP[code]).filter(Boolean);
        const gruposPermitidos = configs.map(c => c.grupo);

        // Filtrar próximos a vencer por grupo asociado a la gestión
        const proximosFiltrados = (rawProximosList || []).filter(item => {
            return !item.grupo_documentos || gruposPermitidos.includes(item.grupo_documentos);
        });
        setProximos(proximosFiltrados);

        // Filtrar grupos
        const gruposEncontrados = (rawGrupos || []).filter(g => gruposPermitidos.includes(g.grupo_documentos));
        if (gruposEncontrados.length > 0) {
            setGrupos(gruposEncontrados);
        } else {
            setGrupos(rawGrupos);
        }

        setResumen(rawRes);
        setEstados(rawEstadosList);
    };

    // ── Dashboard PROVEEDOR (solo sus propios documentos) ────────────────────
    async function cargarDashboardProveedor() {
        if (!miProveedorId) {
            setLoadingProveedor(false);
            return;
        }
        try {
            let acumuladoDocs = [];

            // Consultamos secuencialmente los 4 grupos documentales del proveedor logueado
            for (const grupoCode of CODIGOS_GRUPOS) {
                const dataDocs = await listarPorGrupo(miProveedorId, grupoCode);
                if (dataDocs && dataDocs.length > 0) {
                    acumuladoDocs = [...acumuladoDocs, ...dataDocs];
                }
            }

            setRawDocsProveedor(acumuladoDocs);

            const dataKpis = await obtenerCumplimientoGestion(miProveedorId);
            setRawKpisProveedor(dataKpis || []);

            const dataEstado = await obtenerEstadoExpediente(miProveedorId);
            setEstadoExpediente(dataEstado);

            const dataCalificacion = await obtenerCalificacionProveedor(miProveedorId);
            setRawCalificacion(dataCalificacion);
            // setCalificacion is handled inside aplicarFiltroProveedor which is triggered by rawCalificacion change
        } catch (error) {
            console.error("Error consolidando indicadores de proveedor:", error);
        } finally {
            setLoadingProveedor(false);
        }
    };

    const aplicarFiltroProveedor = (acumuladoDocs, dataKpis, gestionesCodeArray) => {
        if (!acumuladoDocs) return;

        const isAll = !gestionesCodeArray || gestionesCodeArray.length === 0 || gestionesCodeArray.includes('ALL');
        const configs = isAll ? [] : gestionesCodeArray.map(code => GESTION_MAP[code]).filter(Boolean);

        // Filtrar documentos según la gestión seleccionada
        const docsFiltrados = isAll
            ? acumuladoDocs
            : acumuladoDocs.filter(d => {
                return configs.some(config => {
                    if (d.alcance) {
                        return config.alcances.includes(d.alcance);
                    }
                    return d.grupo_documentos === config.grupo;
                });
            });

        // Separación de documentos por estatus evaluando fecha_vigencia
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const vigentesCount = docsFiltrados.filter(d => {
            if (!d.fecha_vigencia) return false;
            const f = new Date(d.fecha_vigencia);
            f.setHours(0, 0, 0, 0);
            return f >= hoy;
        }).length;

        const vencidosCount = docsFiltrados.filter(d => {
            if (!d.fecha_vigencia) return false;
            const f = new Date(d.fecha_vigencia);
            f.setHours(0, 0, 0, 0);
            return f < hoy;
        }).length;

        setResumen({
            total_proveedores: 'N/A',
            documentos_vigentes: vigentesCount,
            documentos_vencidos: vencidosCount,
            total_documentos: docsFiltrados.length
        });

        // ── Recalcular estadoExpediente para "MIS DOCUMENTOS"
        const regimen = rawCalificacion?.regimen_tributario_codigo || rawCalificacion?.regimen_tributario || 'RG';
        const LIMITS_PER_ALCANCE = {
            'RG': { 'GSG': 12, 'GMA': 1, 'GCA': 1, 'GPA': 1, 'GTR': 1 },
            'RP': { 'GSG': 10, 'GMA': 1, 'GCA': 1, 'GPA': 1, 'GTR': 1 },
            'RM': { 'GSG': 7,  'GMA': 1, 'GCA': 1, 'GPA': 1, 'GTR': 1 }
        };
        const limits = LIMITS_PER_ALCANCE[regimen] || LIMITS_PER_ALCANCE['RG'];

        const activeAlcances = isAll
            ? ['GSG', 'GMA', 'GCA', 'GPA', 'GTR']
            : configs.reduce((acc, config) => [...acc, ...config.alcances], []);

        let totalExigibles = 0;
        let totalRegistrados = 0;
        let totalVigentesCapped = 0;

        activeAlcances.forEach(alcance => {
            const exigibleAlcance = limits[alcance] || 0;
            totalExigibles += exigibleAlcance;

            const docsAlcance = docsFiltrados.filter(d => d.alcance === alcance);
            const uniqueTypes = new Set(docsAlcance.map(d => d.tipo_documento_id));
            const countUploaded = uniqueTypes.size;
            totalRegistrados += Math.min(countUploaded, exigibleAlcance);

            const docsVigentesAlcance = docsAlcance.filter(d => {
                if (!d.fecha_vigencia) return false;
                const f = new Date(d.fecha_vigencia);
                f.setHours(0, 0, 0, 0);
                return f >= hoy;
            });
            const uniqueVigentesTypes = new Set(docsVigentesAlcance.map(d => d.tipo_documento_id));
            const countVigentes = uniqueVigentesTypes.size;
            totalVigentesCapped += Math.min(countVigentes, exigibleAlcance);
        });

        const unDiaMs = 86400000;
        const hoyMas7 = new Date(hoy.getTime() + 7 * unDiaMs);

        const vencidosAbs = docsFiltrados.filter(d => {
            if (!d.fecha_vigencia) return false;
            const f = new Date(d.fecha_vigencia);
            f.setHours(0, 0, 0, 0);
            return f < hoy;
        }).length;

        const porVencerAbs = docsFiltrados.filter(d => {
            if (!d.fecha_vigencia) return false;
            const f = new Date(d.fecha_vigencia);
            f.setHours(0, 0, 0, 0);
            return f >= hoy && f <= hoyMas7;
        }).length;

        const vigentesAbs = docsFiltrados.filter(d => {
            if (!d.fecha_vigencia) return false;
            const f = new Date(d.fecha_vigencia);
            f.setHours(0, 0, 0, 0);
            return f >= hoy;
        }).length;

        setEstadoExpediente({
            total_exigibles: totalExigibles,
            total_registrados: totalRegistrados,
            vigentes_para_porcentaje: totalVigentesCapped,
            vencidos: vencidosAbs,
            por_vencer: porVencerAbs,
            vigentes: vigentesAbs
        });

        // Gráficos de grupo según filtro
        if (!isAll && configs.length > 0) {
            const gruposEstadistica = configs.map(config => {
                const count = docsFiltrados.filter(d => {
                    if (d.alcance) return config.alcances.includes(d.alcance);
                    return d.grupo_documentos === config.grupo;
                }).length;
                return { descripcion: config.nombre, cantidad: count };
            });
            setGrupos(gruposEstadistica);
        } else {
            const estadisticaGrupos = CODIGOS_GRUPOS.map(grupoCode => {
                const count = acumuladoDocs.filter(d => d.grupo_documentos === grupoCode).length;
                return { descripcion: NOMBRES_GRUPOS[grupoCode], cantidad: count };
            });
            setGrupos(estadisticaGrupos);
        }

        setEstados([
            { descripcion: 'VIGENTE', cantidad: vigentesCount },
            { descripcion: 'VENCIDO', cantidad: vencidosCount }
        ]);

        // Filtrado de alertas: documentos vigentes próximos a vencer en los siguientes 90 días
        const alertasVencimiento = docsFiltrados.filter(d => {
            if (d.estado_documento !== 'V') return false;
            const diasRestantes = Math.ceil((new Date(d.fecha_vigencia) - new Date()) / 86400000);
            return diasRestantes > 0 && diasRestantes <= 90;
        }).map(d => ({
            proveedor: d.descripcion_tipo_documento || d.tipo_documento || 'Documento',
            fecha_vigencia: d.fecha_vigencia
        }));

        setProximos(alertasVencimiento);

        // Filtrar o resaltar KPIs de gestión
        if (!isAll && configs.length > 0 && dataKpis && dataKpis.length > 0) {
            const kpisFiltrados = dataKpis.filter(kpi => {
                const nombreUpper = (kpi.gestion || '').toUpperCase();
                return configs.some(config => config.kpiMatch.some(match => nombreUpper.includes(match)));
            });
            setKpisGestion(kpisFiltrados.length > 0 ? kpisFiltrados : dataKpis);
        } else {
            setKpisGestion(dataKpis || []);
        }

        // Calificación Dinámica
        if (rawCalificacion) {
            if (isAll) {
                setCalificacion(rawCalificacion);
            } else {
                const regimen = rawCalificacion.regimen_tributario_codigo || rawCalificacion.regimen_tributario;
                const limits = LIMITS_PER_ALCANCE[regimen] || LIMITS_PER_ALCANCE['RG'];

                let totalExigible = 0;
                let totalCappedIngresados = 0;

                gestionesCodeArray.forEach(code => {
                    const config = GESTION_MAP[code];
                    if (config) {
                        config.alcances.forEach(alcance => {
                            const exigibleAlcance = limits[alcance] || 0;
                            totalExigible += exigibleAlcance;

                            const docsAlcance = docsFiltrados.filter(d => d.alcance === alcance);
                            const uniqueTypes = new Set(docsAlcance.map(d => d.tipo_documento_id));
                            const countUploaded = uniqueTypes.size;

                            totalCappedIngresados += Math.min(countUploaded, exigibleAlcance);
                        });
                    }
                });

                if (totalExigible === 0) {
                    setCalificacion(rawCalificacion);
                } else {
                    let puntajeRaw = (totalCappedIngresados / totalExigible) * 100;
                    if (puntajeRaw > 100) puntajeRaw = 100;
                    
                    let recomendacion = 'NO RECOMENDADO';
                    let nivel = 'BAJO';
                    let desc = 'Presentas un bajo nivel de registro y vigencia documental';
                    
                    if (puntajeRaw > 90) {
                        recomendacion = 'RECOMENDADO';
                        nivel = 'ALTO';
                        desc = 'Mantienes un alto nivel de registro y vigencia documental';
                    } else if (puntajeRaw >= 75) {
                        recomendacion = 'RECOMENDADO CON RESTRICCIONES';
                        nivel = 'MEDIO';
                        desc = 'Mantienes un nivel aceptable de registro y vigencia documental';
                    }

                    setCalificacion({
                        ...rawCalificacion,
                        cantidad_documentos_vigentes: totalCappedIngresados,
                        puntaje_formateado: `${Math.round(puntajeRaw)} / 100`,
                        puntaje_numerico: Math.round(puntajeRaw),
                        recomendacion,
                        nivel_documental: nivel,
                        descripcion_nivel: desc
                    });
                }
            }
        }
    };

    // Próximos a vencer, ordenados por fecha más cercana primero
    const proximosOrdenados = [...proximos].sort(
        (a, b) => new Date(a.fecha_vigencia) - new Date(b.fecha_vigencia)
    );

    const limpiarFiltroGestion = () => {
        setGestionFiltro('ALL');
        localStorage.setItem('sisgestion_gestion_actual', 'ALL');
        window.dispatchEvent(new CustomEvent('sisgestion:gestion_change', { detail: 'ALL' }));
    };

    return (
        <MainLayout>
            <style>{responsiveCSS}</style>

            {/* ── Encabezado dinámico por rol ─────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={styles.heading}>
                        {esProveedor || esConsultor
                            ? `Panel de Control - ${proveedorInfo?.razon_social || proveedorInfo?.proveedor || usuarioLogueado?.username || ''} - ${esProveedor ? 'Proveedor' : 'Consultor'}`
                            : 'Dashboard SISGESTION'}
                    </h1>
                    <p style={{ color: colors.textMuted, margin: '5px 0 0 0', fontSize: '14px' }}>
                        {esProveedor
                            ? 'Resumen analítico y alertas del estado de vigencia de sus expedientes cargados.'
                            : esConsultor
                                ? 'Vista general del sistema. Acceso de solo lectura para auditorías corporativas.'
                                : 'Vista general del sistema para gestión de auditorías corporativas.'}
                    </p>
                </div>

                {/* Botón para eliminar el filtro activo */}
                {gestionFiltro !== 'ALL' && GESTION_MAP[gestionFiltro] && (
                    <button
                        onClick={limpiarFiltroGestion}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#1D4ED8',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
                    >
                        <span>Filtro: <strong>{GESTION_MAP[gestionFiltro]?.nombre}</strong></span>
                        <span style={{ color: '#2563EB', fontWeight: '700', marginLeft: '4px' }}>✕ Ver todo</span>
                    </button>
                )}
            </div>

            {/* ── PROVEEDOR sin ficha → aviso ──────────────────────────────── */}
            {esProveedor && !miProveedorId && !loadingProveedor ? (
                <div style={{ ...styles.card, marginTop: '30px' }}>
                    <div style={styles.emptyState}>
                        Por favor, complete su registro de Ficha Informativa en la sección de Proveedores para activar sus indicadores.
                    </div>
                </div>
            ) : (
                <>


                    {/* ── Tarjetas de estadísticas y KPI ─────────────────────────── */}
                    {resumen && (
                        <div className={`stats-grid ${esProveedor ? 'proveedor' : ''}`}>

                            {/* Primer stat: Proveedores (ADMIN) o KPI (PROVEEDOR) */}
                            {!esProveedor ? (
                                <div style={styles.statCard(colors.primary)}>
                                    <p style={styles.statLabel}>Proveedores</p>
                                    <p style={styles.statValue(colors.text)}>{resumen.total_proveedores}</p>
                                </div>
                            ) : (
                                kpisGestion && kpisGestion.length > 0 ? (
                                    <div style={{ ...styles.card, padding: '20px 24px' }}>
                                        <h2 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>MI DESEMPEÑO POR GESTIÓN</h2>
                                        <div className="table-scroll">
                                            <table style={{ ...styles.table, marginTop: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ ...styles.th, width: '25%', padding: '8px 12px' }}>Gestión</th>
                                                        <th style={{ ...styles.th, width: '45%', padding: '8px 12px' }}>Estado de Avance</th>
                                                        <th style={{ ...styles.th, textAlign: 'center', width: '20%', padding: '8px 12px' }}>Cumplimiento</th>
                                                        <th style={{ ...styles.th, textAlign: 'center', width: '10%', padding: '8px 12px' }}>Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {kpisGestion.map((kpi, index) => {
                                                        const pct = Number(kpi.porcentaje);
                                                        const progressColor = pct === 100 ? colors.success : pct >= 50 ? colors.amber : colors.danger;
                                                        return (
                                                            <tr key={index}>
                                                                <td style={{ ...styles.td, padding: '10px 12px' }}><strong>{obtenerNombreMostrado(kpi.gestion)}</strong></td>
                                                                <td style={{ ...styles.td, padding: '10px 12px' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: colors.textMuted }}>
                                                                            <span>{kpi.documentos_registrados} de {kpi.documentos_exigibles} documentos</span>
                                                                        </div>
                                                                        <div style={{ width: '100%', background: colors.border, borderRadius: '4px', overflow: 'hidden', height: '6px' }}>
                                                                            <div style={{ width: `${pct}%`, background: progressColor, height: '100%', transition: 'width 1s ease-in-out', borderRadius: '4px' }}></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ ...styles.td, textAlign: 'center', padding: '10px 12px' }}>
                                                                    <span style={styles.badge(pct === 100 ? colors.successBg : pct >= 50 ? '#fef3c7' : colors.dangerBg, pct === 100 ? colors.success : pct >= 50 ? '#b45309' : colors.danger)}>
                                                                        {pct.toFixed(2)}%
                                                                    </span>
                                                                </td>
                                                                <td style={{ ...styles.td, textAlign: 'center', padding: '10px 12px' }}>
                                                                    <button
                                                                        onClick={() => {
                                                                            let gestionKey = 'ALL';
                                                                            for (const [key, value] of Object.entries(GESTION_MAP)) {
                                                                                if (value.kpiMatch.some(match => kpi.gestion.toUpperCase().includes(match))) {
                                                                                    gestionKey = key;
                                                                                    break;
                                                                                }
                                                                            }
                                                                            localStorage.setItem('sisgestion_gestion_actual', JSON.stringify([gestionKey]));
                                                                            window.dispatchEvent(new CustomEvent('sisgestion:gestion_change', { detail: [gestionKey] }));
                                                                            navigate('/documents');
                                                                        }}
                                                                        title="Ver documentos"
                                                                        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '6px 10px', color: '#1D4ED8', cursor: 'pointer', transition: 'all 0.2s' }}
                                                                        onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                                                                        onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
                                                                    >
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={styles.statCard(colors.primary)}>
                                        <p style={styles.statLabel}>Total Documentos Cargados</p>
                                        <p style={styles.statValue(colors.text)}>{resumen.total_documentos}</p>
                                    </div>
                                )
                            )}

                            {/* ── Calificación de Proveedor ─────────────────────────── */}
                            {esProveedor && calificacion && (
                                <div style={{ 
                                    ...styles.card, 
                                    border: calificacion.nivel_documental === 'BAJO' ? `2px solid ${colors.danger}` : `1px solid ${colors.border}`,
                                    borderLeft: `6px solid ${calificacion.nivel_documental === 'ALTO' ? colors.success : calificacion.nivel_documental === 'MEDIO' ? colors.amber : colors.danger}`, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '16px',
                                    background: calificacion.nivel_documental === 'BAJO' ? '#FEF2F2' : colors.card
                                }}>
                                    <div style={{ display: 'flex', flexDirection: calificacion.nivel_documental === 'BAJO' ? 'column' : 'row', justifyContent: 'space-between', alignItems: calificacion.nivel_documental === 'BAJO' ? 'center' : 'flex-start', borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px', gap: calificacion.nivel_documental === 'BAJO' ? '12px' : '0' }}>
                                        <div style={{ textAlign: calificacion.nivel_documental === 'BAJO' ? 'center' : 'left' }}>
                                            <h2 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                MI CALIFICACIÓN - <span style={{ color: colors.primary }}>{proveedorInfo?.razon_social || proveedorInfo?.proveedor || usuarioLogueado?.username || 'PROVEEDOR'}</span>
                                            </h2>
                                            <p style={{ fontSize: '13px', color: colors.textMuted, margin: '4px 0 0 0' }}>
                                                Régimen Tributario: <strong>{calificacion.regimen_tributario}</strong>
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                ...styles.badge(
                                                    calificacion.nivel_documental === 'ALTO' ? colors.successBg : calificacion.nivel_documental === 'MEDIO' ? '#fef3c7' : colors.danger, 
                                                    calificacion.nivel_documental === 'ALTO' ? colors.success : calificacion.nivel_documental === 'MEDIO' ? '#b45309' : '#FFFFFF'
                                                ), 
                                                fontSize: calificacion.nivel_documental === 'BAJO' ? '16px' : '14px', 
                                                padding: calificacion.nivel_documental === 'BAJO' ? '8px 24px' : '6px 16px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '8px',
                                                boxShadow: calificacion.nivel_documental === 'BAJO' ? '0 4px 6px -1px rgba(220, 38, 38, 0.2)' : 'none'
                                            }}>
                                                {calificacion.nivel_documental === 'ALTO' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>}
                                                {calificacion.nivel_documental === 'MEDIO' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                                                {calificacion.nivel_documental === 'BAJO' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                                                {calificacion.recomendacion}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: calificacion.nivel_documental === 'BAJO' ? 'column' : 'row', alignItems: 'center', gap: calificacion.nivel_documental === 'BAJO' ? '16px' : '30px', textAlign: calificacion.nivel_documental === 'BAJO' ? 'center' : 'left' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: calificacion.nivel_documental === 'BAJO' ? '#FFFFFF' : '#f8fafc', padding: '20px', borderRadius: '12px', minWidth: '150px', border: calificacion.nivel_documental === 'BAJO' ? `1px solid ${colors.danger}` : 'none' }}>
                                            <span style={{ fontSize: '32px', fontWeight: 900, color: calificacion.nivel_documental === 'ALTO' ? colors.success : calificacion.nivel_documental === 'MEDIO' ? '#b45309' : colors.danger, lineHeight: '1' }}>
                                                {calificacion.puntaje_formateado.split(' ')[0]}
                                            </span>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: colors.textMuted, marginTop: '4px' }}>
                                                / 100
                                            </span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: calificacion.nivel_documental === 'BAJO' ? colors.danger : colors.text, margin: '0 0 8px 0' }}>
                                                Nivel de Gestión Documental: {calificacion.nivel_documental}
                                            </h3>
                                            <p style={{ fontSize: '15px', color: colors.textMuted, margin: 0, lineHeight: '1.5' }}>
                                                {calificacion.descripcion_nivel}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        borderTop: `1px solid ${colors.border}`, 
                                        paddingTop: '12px', 
                                        marginTop: '4px',
                                        fontSize: '12px', 
                                        color: colors.textMuted, 
                                        fontStyle: 'italic',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.primary }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        <span>Cómo me ven los clientes</span>
                                    </div>
                                </div>
                            )}

                            {/* ── MIS DOCUMENTOS (Solo Proveedor, ahora más pequeña en medio) ────────────────────── */}
                            {esProveedor && estadoExpediente && (
                                <div style={{ ...styles.card, padding: '24px' }}>
                                    <h2 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>MIS DOCUMENTOS</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                                        {/* REGISTRO DOCUMENTAL */}
                                        {(() => {
                                            const exigibles = estadoExpediente.total_exigibles || 0;
                                            const registrados = estadoExpediente.total_registrados || 0;
                                            const pctRegistro = exigibles > 0 ? Math.min((registrados / exigibles) * 100, 100).toFixed(0) : 0;
                                            return (
                                                <div style={{ background: '#eff6ff', padding: '16px 8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                                                    <p style={{ ...styles.statLabel, color: '#1e40af', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                        REGISTRO DOCUMENTAL
                                                    </p>
                                                    <p style={{ fontSize: '24px', fontWeight: 800, color: '#1d4ed8', margin: '8px 0' }}>{pctRegistro}%</p>
                                                    <div style={{ width: '80%', background: '#dbeafe', borderRadius: '6px', overflow: 'hidden', height: '6px' }}>
                                                        <div style={{ width: `${pctRegistro}%`, background: '#2563eb', height: '100%', borderRadius: '6px', transition: 'width 1s ease-in-out', boxShadow: '0 0 8px rgba(37,99,235,0.4)' }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        {/* VIGENCIA DOCUMENTAL */}
                                        {(() => {
                                            const registrados = estadoExpediente.total_registrados || 0;
                                            const vigentesParaPorcentaje = estadoExpediente.vigentes_para_porcentaje || 0;
                                            const pctVigencia = registrados > 0 ? Math.min((vigentesParaPorcentaje / registrados) * 100, 100).toFixed(0) : 0;
                                            return (
                                                <div style={{ background: '#f0fdf4', padding: '16px 8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #bbf7d0', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                                                    <p style={{ ...styles.statLabel, color: '#166534', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                        VIGENCIA DOCUMENTAL
                                                    </p>
                                                    <p style={{ fontSize: '24px', fontWeight: 800, color: '#15803d', margin: '8px 0' }}>{pctVigencia}%</p>
                                                    <div style={{ width: '80%', background: '#dcfce7', borderRadius: '6px', overflow: 'hidden', height: '6px' }}>
                                                        <div style={{ width: `${pctVigencia}%`, background: '#16a34a', height: '100%', borderRadius: '6px', transition: 'width 1s ease-in-out', boxShadow: '0 0 8px rgba(22,163,74,0.4)' }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        {/* DOCUMENTOS POR VENCER */}
                                        <div style={{ background: '#fffbeb', padding: '16px 8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #fde68a', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                                            <p style={{ ...styles.statLabel, color: '#92400e', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                                DOCUMENTOS POR VENCER
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
                                                <p style={{ fontSize: '24px', fontWeight: 800, color: '#b45309', margin: 0 }}>
                                                    {estadoExpediente.por_vencer}
                                                </p>
                                            </div>
                                            <div style={{ width: '80%', background: 'transparent', height: '6px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!esProveedor && (() => {
                                const registrados = resumen.total_documentos || 0;
                                const vigentes = resumen.documentos_vigentes || 0;
                                const porcentaje = registrados > 0 ? ((vigentes / registrados) * 100).toFixed(2) : 0;
                                return (
                                    <div style={{ ...styles.card, padding: '20px 24px', borderLeft: `4px solid ${colors.success}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <p style={styles.statLabel}>VIGENCIA DOCUMENTAL</p>
                                        <p style={styles.statValue(colors.success)}>{porcentaje}%</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: colors.textMuted }}>
                                                <span>{vigentes} de {registrados} documentos vigentes</span>
                                            </div>
                                            <div style={{ width: '100%', background: colors.border, borderRadius: '4px', overflow: 'hidden', height: '6px' }}>
                                                <div style={{ width: `${porcentaje}%`, background: colors.success, height: '100%', transition: 'width 1s ease-in-out', borderRadius: '4px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {!esProveedor ? (
                                <div style={styles.statCard(colors.danger)}>
                                    <p style={styles.statLabel}>Documentos Vencidos</p>
                                    <p style={styles.statValue(colors.danger)}>{resumen.documentos_vencidos}</p>
                                </div>
                            ) : (
                                estadoExpediente ? (
                                    <div style={{ ...styles.card, padding: '20px', borderLeft: `4px solid ${colors.danger}`, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: colors.textMuted, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            ESTADO DE MI EXPEDIENTE
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <button
                                                onClick={() => navigate('/documents?estado=VIGENTES')}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: colors.successBg, border: `1px solid #a7f3d0`, borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: colors.success }}>Vigentes</span>
                                                <span style={{ fontSize: '18px', fontWeight: 800, color: colors.success }}>{estadoExpediente.vigentes}</span>
                                            </button>

                                            <button
                                                onClick={() => navigate('/documents?estado=POR_VENCER')}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fef3c7', border: `1px solid #fde68a`, borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#b45309' }}>Por vencer</span>
                                                    {estadoExpediente.por_vencer > 0 && (
                                                        <span style={{ background: colors.danger, width: 8, height: 8, borderRadius: '50%', boxShadow: `0 0 4px ${colors.danger}` }}></span>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '18px', fontWeight: 800, color: '#b45309' }}>{estadoExpediente.por_vencer}</span>
                                            </button>

                                            <button
                                                onClick={() => navigate('/documents?estado=VENCIDOS')}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: colors.dangerBg, border: `1px solid #fecaca`, borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: colors.danger }}>Vencidos</span>
                                                <span style={{ fontSize: '18px', fontWeight: 800, color: colors.danger }}>{estadoExpediente.vencidos}</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={styles.statCard(colors.danger)}>
                                        <p style={styles.statLabel}>Documentos Vencidos</p>
                                        <p style={styles.statValue(colors.danger)}>{resumen.documentos_vencidos}</p>
                                    </div>
                                )
                            )}

                        </div>
                    )}

                    {/* ── Gráfico de torta: estado de documentos ───────────── */}
                    {estados.length > 0 && (
                        <div style={{ ...styles.card, marginTop: '30px' }}>
                            <h2 style={styles.sectionTitle}>Estado de Documentos</h2>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div className="pie-chart-wrap">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={estados}
                                                cx="50%"
                                                cy="50%"
                                                dataKey="cantidad"
                                                nameKey="descripcion"
                                                outerRadius={120}
                                                label={({ name, percent }) =>
                                                    `${name} ${(percent * 100).toFixed(0)}%`
                                                }
                                            >
                                                {estados.map((item, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={esVigente(item) ? colors.success : colors.danger}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tabla de próximos a vencer ───────────────────────── */}
                    <div style={{ ...styles.card, marginTop: '30px' }}>
                        <h2 style={styles.sectionTitle}>
                            {esProveedor
                                ? 'Mis Documentos próximos a vencer'
                                : 'Proveedores con documentos próximos a vencer'}
                        </h2>

                        {proximosOrdenados.length === 0 ? (
                            <div style={styles.emptyState}>
                                No existen documentos próximos a vencer.
                            </div>
                        ) : (
                            <div className="table-scroll">
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>{esProveedor ? 'Tipo Documento' : 'Proveedor'}</th>
                                            <th style={styles.th}>Fecha Vencimiento</th>
                                            <th style={styles.th}>Días Restantes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proximosOrdenados.map((item, index) => {
                                            const dias = Math.ceil(
                                                (new Date(item.fecha_vigencia) - new Date()) / 86400000
                                            );
                                            const u = urgencia(dias);

                                            return (
                                                <tr key={index}>
                                                    <td style={styles.td}>{item.proveedor}</td>
                                                    <td style={styles.td}>
                                                        {formatearFechaLocal(item.fecha_vigencia)}
                                                    </td>
                                                    <td style={styles.td}>
                                                        <span style={styles.badge(u.bg, u.fg)}>
                                                            {u.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </MainLayout>
    );
}
