import {
    useEffect,
    useState,
    useRef
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
    obtenerCalificacionProveedor,
    obtenerResumenProveedoresCumplimiento,
    obtenerCumplimientoGlobalPorGestion,
    obtenerRankingProveedores,
    obtenerAlertasConsultor
} from '../services/dashboard.service';

import { obtenerCatalogo, obtenerPeriodos } from '../services/catalogos.service';

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

// Urgencia para "Próximos a Vencer": rojo <=15 días, ámbar <=30 días, verde el resto.
const urgencia = (dias) => {
    if (dias <= 15) return { label: `${dias} día${dias === 1 ? '' : 's'}`, bg: colors.dangerBg, fg: colors.danger };
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
    .consultor-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        margin-top: 28px;
    }
    @media (max-width: 960px) {
        .consultor-grid { grid-template-columns: 1fr; }
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

const DOC_DESCRIPCIONES_DASHBOARD = {
    GSG: {
        '01': 'Accidentes de Trabajo, Enfermedades Ocupacionales e Incidentes',
        '02': 'Exámenes Médicos Ocupacionales',
        '03': 'Monitoreo de Agentes',
        '04': 'Inspecciones Internas',
        '05': 'Estadísticas',
        '06': 'Equipos de Seguridad o Emergencia',
        '07': 'Capacitación y Simulacros',
        '08': 'Auditorías',
        '09': 'Reglamento Interno de Seguridad y Salud en el Trabajo.',
        '10': 'Identificación de peligros, evaluación de riesgos y sus medidas de control(IPERC)',
        '11': 'Comité SST',
        '12': 'Plan y Programa Anual de Seguridad y Salud en el Trabajo.',
        '13': 'Supervisor SST (Elegido si tiene menos de 20 trabajadores).',
        '15': 'Comité SST (Obligatorio si supera los 20 trabajadores)'
    },
    GMA: {
        '01': 'Matriz PAMA',
        '02': 'Otros(Certificaciones, declaraciones, manifiestos, informes)'
    },
    GCA: {
        '01': 'Certificaciones ISO 9001',
        '02': 'Certificaciones diversas(Homologaciones)'
    },
    GPA: {
        '01': 'Plán de Contigencia',
        '02': 'Otros'
    },
    GTR: {
        '01': 'Carta de Presentación',
        '02': 'Otros'
    }
};

const REQUERIDOS_SST_DASHBOARD = {
    RM: ['01', '02', '04', '07', '09', '12', '13'],
    RP: ['01', '02', '03', '04', '05', '07', '09', '10', '12'],
    RG: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
};

const calcularPendientesProveedor = (regimenInput, nroTrabajadores, uploadedDocs, nombreProveedor) => {
    const reg = (regimenInput || 'RG').toUpperCase();
    const isRM = reg === 'RM' || reg.includes('MICRO');
    const isRP = reg === 'RP' || reg.includes('PEQUEÑA') || reg.includes('PEQUENA');
    const regCode = isRM ? 'RM' : (isRP ? 'RP' : 'RG');

    const listaPendientes = [];
    const docs = (uploadedDocs || []).filter(Boolean);
    const uploadedSet = new Set(docs.map(d => `${d.alcance || ''}_${String(d.tipo_documento_id || '').padStart(2, '0')}`));
    const uploadedByAlcance = {
        GSG: docs.filter(d => d && d.alcance === 'GSG'),
        GMA: docs.filter(d => d && d.alcance === 'GMA'),
        GCA: docs.filter(d => d && d.alcance === 'GCA'),
        GPA: docs.filter(d => d && d.alcance === 'GPA'),
        GTR: docs.filter(d => d && d.alcance === 'GTR')
    };

    // 1. SST (GSG)
    let reqSST = [...(REQUERIDOS_SST_DASHBOARD[regCode] || REQUERIDOS_SST_DASHBOARD.RG)];
    if (regCode === 'RP') {
        const trabStr = String(nroTrabajadores || '');
        const esMas20 = trabStr.includes('MT') || trabStr.includes('>20') || trabStr.includes('MAS DE 20') || parseInt(trabStr, 10) > 20;
        if (esMas20 && !reqSST.includes('15')) {
            reqSST.push('15');
        }
    }

    reqSST.forEach(docId => {
        const idPad = String(docId).padStart(2, '0');
        if (!uploadedSet.has(`GSG_${idPad}`)) {
            const desc = DOC_DESCRIPCIONES_DASHBOARD.GSG[idPad] || `Documento ${idPad}`;
            listaPendientes.push({
                proveedor: nombreProveedor,
                grupo_documentos: 'DOC_NOR',
                alcance: 'GSG',
                alcance_nombre: 'SST',
                gestion: 'GESTIÓN SST',
                tipo_documento_id: idPad,
                tipo_documento: `${idPad} - ${desc}`,
                descripcion_tipo_documento: desc,
                estado: 'Pendiente de ingresar'
            });
        }
    });

    // 2. MA (GMA), CALIDAD (GCA), PATRIMONIAL (GPA), ETICA (GTR)
    const sencillas = [
        { alcance: 'GMA', alcanceNombre: 'MA', gestion: 'GESTIÓN MA', grupo: 'DOC_NOR', defaultId: '01' },
        { alcance: 'GCA', alcanceNombre: 'CALIDAD', gestion: 'GESTIÓN DE CALIDAD', grupo: 'DOC_EXT_NOR', defaultId: '01' },
        { alcance: 'GPA', alcanceNombre: 'PATRIMONIAL', gestion: 'GESTIÓN PATRIMONIAL', grupo: 'DOC_REQ_ESTATAL', defaultId: '01' },
        { alcance: 'GTR', alcanceNombre: 'ETICA', gestion: 'CÓDIGO ÉTICA', grupo: 'DOC_OTROS', defaultId: '01' }
    ];

    sencillas.forEach(item => {
        if ((uploadedByAlcance[item.alcance] || []).length === 0) {
            const idPad = item.defaultId;
            const desc = DOC_DESCRIPCIONES_DASHBOARD[item.alcance][idPad] || `Documento ${idPad}`;
            listaPendientes.push({
                proveedor: nombreProveedor,
                grupo_documentos: item.grupo,
                alcance: item.alcance,
                alcance_nombre: item.alcanceNombre,
                gestion: item.gestion,
                tipo_documento_id: idPad,
                tipo_documento: `${idPad} - ${desc}`,
                descripcion_tipo_documento: desc,
                estado: 'Pendiente de ingresar'
            });
        }
    });

    return listaPendientes;
};

const obtenerNombreMostrado = (gestionRaw) => {
    const rawUpper = (gestionRaw || '').toUpperCase();
    if (rawUpper.includes('SST') || rawUpper.includes('MA')) return 'Gestión SST-MA';
    if (rawUpper.includes('CALIDAD')) return 'Gestión de Calidad';
    if (rawUpper.includes('PATRIMONIAL')) return 'Gestión Seg. Patrimonial';
    if (rawUpper.includes('ETICA')) return 'Código Ética';
    return gestionRaw;
};

const MAPA_REGIMENES = {
    'RG': 'Régimen General',
    'RP': 'Pequeña Empresa',
    'RM': 'Micro Empresa'
};

const obtenerDescripcionRegimen = (regimen, descripcion) => {
    if (descripcion && descripcion.trim()) return descripcion;
    if (!regimen) return 'Régimen General';
    const code = String(regimen).trim().toUpperCase();
    return MAPA_REGIMENES[code] || (code === 'RG' ? 'Régimen General' : code === 'RP' ? 'Pequeña Empresa' : code === 'RM' ? 'Micro Empresa' : regimen);
};

const calcularRankingYAlertas = (rawRanking, rawAlertas, gestionesCodeArray) => {
    const isAll = !gestionesCodeArray || gestionesCodeArray.length === 0 || gestionesCodeArray.includes('ALL');
    const configs = isAll ? [] : gestionesCodeArray.map(code => GESTION_MAP[code]).filter(Boolean);
    const activeAlcances = isAll
        ? ['GSG', 'GMA', 'GCA', 'GPA', 'GTR']
        : configs.reduce((acc, config) => [...acc, ...config.alcances], []);

    // 1. Cálculo de Ranking
    const rankingCalculado = (rawRanking || []).map(p => {
        let totalExigible = 0;
        let totalVigentes = 0;

        if (activeAlcances.includes('GSG')) {
            const ex = Number(p.exigible_sst) || 12;
            totalExigible += ex;
            totalVigentes += Math.min(Number(p.reg_sst) || 0, ex);
        }
        if (activeAlcances.includes('GMA')) {
            const ex = Number(p.exigible_ma) || 1;
            totalExigible += ex;
            totalVigentes += Math.min(Number(p.reg_ma) || 0, ex);
        }
        if (activeAlcances.includes('GCA')) {
            const ex = Number(p.exigible_calidad) || 1;
            totalExigible += ex;
            totalVigentes += Math.min(Number(p.reg_calidad) || 0, ex);
        }
        if (activeAlcances.includes('GPA')) {
            const ex = Number(p.exigible_patrimonial) || 1;
            totalExigible += ex;
            totalVigentes += Math.min(Number(p.reg_patrimonial) || 0, ex);
        }
        if (activeAlcances.includes('GTR')) {
            const ex = Number(p.exigible_etica) || 1;
            totalExigible += ex;
            totalVigentes += Math.min(Number(p.reg_etica) || 0, ex);
        }

        const puntajePct = totalExigible > 0 ? Math.round((totalVigentes / totalExigible) * 100) : 0;
        const puntajeFinal = Math.min(Math.max(puntajePct, 0), 100);

        let recomendacion = 'NO RECOMENDADO';
        let nivel = 'BAJO';
        if (puntajeFinal > 90) {
            recomendacion = 'RECOMENDADO';
            nivel = 'ALTO';
        } else if (puntajeFinal >= 75) {
            recomendacion = 'RECOMENDADO CON RESTRICCIONES';
            nivel = 'MEDIO';
        }

        return {
            ...p,
            total_exigibles_evaluados: totalExigible,
            total_vigentes_evaluados: totalVigentes,
            puntaje_evaluado: puntajeFinal,
            recomendacion_evaluada: recomendacion,
            nivel_evaluado: nivel
        };
    }).sort((a, b) => {
        if (b.puntaje_evaluado !== a.puntaje_evaluado) {
            return b.puntaje_evaluado - a.puntaje_evaluado;
        }
        return (a.proveedor_nombre || '').localeCompare(b.proveedor_nombre || '');
    });

    // 2. Cálculo de Alertas
    const provsLlenado = rawAlertas?.proveedores || [];
    const docsPorVencerRaw = rawAlertas?.documentos_por_vencer || [];

    // 2.1 No recomendados
    const noRecomendadosList = rankingCalculado.filter(p => p.puntaje_evaluado < 75);

    // 2.2 Documentos por vencer (< 15 días) filtrados por alcance
    const docsPorVencerFiltrados = docsPorVencerRaw.filter(d => {
        if (isAll) return true;
        return activeAlcances.includes(d.alcance);
    });

    // 2.3 Proveedores con llenado incompleto de documentos para la gestión activa
    const incompletosList = provsLlenado.map(p => {
        let totalExigible = 0;
        let totalUploaded = 0;

        if (activeAlcances.includes('GSG')) {
            const ex = Number(p.exigible_sst) || 12;
            totalExigible += ex;
            totalUploaded += Math.min(Number(p.uploaded_sst) || 0, ex);
        }
        if (activeAlcances.includes('GMA')) {
            const ex = Number(p.exigible_ma) || 1;
            totalExigible += ex;
            totalUploaded += Math.min(Number(p.uploaded_ma) || 0, ex);
        }
        if (activeAlcances.includes('GCA')) {
            const ex = Number(p.exigible_calidad) || 1;
            totalExigible += ex;
            totalUploaded += Math.min(Number(p.uploaded_calidad) || 0, ex);
        }
        if (activeAlcances.includes('GPA')) {
            const ex = Number(p.exigible_patrimonial) || 1;
            totalExigible += ex;
            totalUploaded += Math.min(Number(p.uploaded_patrimonial) || 0, ex);
        }
        if (activeAlcances.includes('GTR')) {
            const ex = Number(p.exigible_etica) || 1;
            totalExigible += ex;
            totalUploaded += Math.min(Number(p.uploaded_etica) || 0, ex);
        }

        const pendientes = Math.max(0, totalExigible - totalUploaded);
        const isIncompleto = totalUploaded < totalExigible;

        return {
            ...p,
            total_exigibles_evaluados: totalExigible,
            total_uploaded_evaluados: totalUploaded,
            pendientes_evaluados: pendientes,
            is_incompleto: isIncompleto
        };
    }).filter(p => p.is_incompleto);

    return {
        ranking: rankingCalculado,
        noRecomendadosCount: noRecomendadosList.length,
        noRecomendadosList,
        porVencerCount: docsPorVencerFiltrados.length,
        porVencerList: docsPorVencerFiltrados,
        incompletosCount: incompletosList.length,
        incompletosList
    };
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const pendientesRef = useRef(null);

    const [resumen, setResumen] = useState(null);
    const [grupos, setGrupos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [proximos, setProximos] = useState([]);
    const [kpisGestion, setKpisGestion] = useState([]);
    const [estadoExpediente, setEstadoExpediente] = useState(null);
    const [calificacion, setCalificacion] = useState(null);
    const [cumplimientoProveedores, setCumplimientoProveedores] = useState(null);
    const [cumplimientoGlobal, setCumplimientoGlobal] = useState([]);
    const [rubroFiltro, setRubroFiltro] = useState(() => {
        return localStorage.getItem('sisgestion_rubro_actual') || 'ALL';
    });
    const [loadingProveedor, setLoadingProveedor] = useState(true);
    const [proveedorInfo, setProveedorInfo] = useState(null);
    const [mostrarConstruccion, setMostrarConstruccion] = useState(false);
    const [periodoFiltro, setPeriodoFiltro] = useState(() => {
        return localStorage.getItem('sisgestion_periodo_actual') || '2026';
    });

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

    // ── Estados para Tarjetas Consultor: Ranking y Alertas ───────────────────
    const [rawRankingProveedores, setRawRankingProveedores] = useState([]);
    const [rawAlertasConsultor, setRawAlertasConsultor] = useState(null);
    const [rankingCalculado, setRankingCalculado] = useState([]);
    const [alertasCalculadas, setAlertasCalculadas] = useState({
        noRecomendadosCount: 0,
        noRecomendadosList: [],
        porVencerCount: 0,
        porVencerList: [],
        incompletosCount: 0,
        incompletosList: []
    });
    const [modalRankingOpen, setModalRankingOpen] = useState(false);
    const [modalAlertaDetalle, setModalAlertaDetalle] = useState(null);

    // ── Identidad del usuario logueado ──────────────────────────────────────
    const usuarioLogueado = obtenerUsuario();
    const rolCodigo = (usuarioLogueado?.rol_codigo || usuarioLogueado?.rol || usuarioLogueado?.role || '').toUpperCase();
    const rolId = Number(usuarioLogueado?.rol_id);
    const esProveedor = rolCodigo === 'PROVEEDOR' || rolId === 2 || usuarioLogueado?.tipo_usuario === 'PROVEEDOR';
    const esConsultor = rolCodigo === 'CONSULTOR' || rolId === 3 || usuarioLogueado?.tipo_usuario === 'CONSULTOR' || (usuarioLogueado?.rol_nombre || '').toUpperCase().includes('CONSULT');
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

    // Escucha de cambios de periodo desde el Header
    useEffect(() => {
        const handlePeriodoChange = (e) => {
            if (e.detail) {
                setPeriodoFiltro(e.detail);
            }
        };
        window.addEventListener('sisgestion:periodo_change', handlePeriodoChange);
        return () => window.removeEventListener('sisgestion:periodo_change', handlePeriodoChange);
    }, []);

    // Escucha de cambios de rubro desde el Header
    useEffect(() => {
        const handleRubroChange = (e) => {
            if (e.detail !== undefined) {
                setRubroFiltro(e.detail);
            }
        };
        window.addEventListener('sisgestion:rubro_change', handleRubroChange);
        return () => window.removeEventListener('sisgestion:rubro_change', handleRubroChange);
    }, []);

    useEffect(() => {
        if (esProveedor) {
            cargarDashboardProveedor();
        } else {
            cargarDashboardAdmin(periodoFiltro, rubroFiltro);
        }
    }, [esProveedor, miProveedorId, periodoFiltro, rubroFiltro]);

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

    const obtenerIdentidadProveedor = () => {
        if (!proveedorInfo) return usuarioLogueado?.username || '';
        if (proveedorInfo.tipo_documento === '06' || proveedorInfo.razon_social) {
            return proveedorInfo.razon_social || proveedorInfo.proveedor || usuarioLogueado?.username || '';
        }
        const nombresCompletos = `${proveedorInfo.nombre || ''} ${proveedorInfo.apellido_paterno || ''} ${proveedorInfo.apellido_materno || ''}`.trim();
        return nombresCompletos || proveedorInfo.proveedor || usuarioLogueado?.username || '';
    };

    // Reaccionar al cambio de gestión para filtrar los datos en pantalla
    useEffect(() => {
        if (esProveedor) {
            aplicarFiltroProveedor(rawDocsProveedor, rawKpisProveedor, gestionFiltro);
        } else {
            aplicarFiltroAdmin(rawAdminGrupos, rawAdminProximos, rawAdminEstados, rawAdminResumen, gestionFiltro);
            const res = calcularRankingYAlertas(rawRankingProveedores, rawAlertasConsultor, gestionFiltro);
            setRankingCalculado(res.ranking);
            setAlertasCalculadas(res);
        }
    }, [gestionFiltro, rawDocsProveedor, rawKpisProveedor, rawCalificacion, rawAdminGrupos, rawAdminProximos, rawAdminEstados, rawAdminResumen, rawRankingProveedores, rawAlertasConsultor, esProveedor]);

    // ── Dashboard ADMIN / CONSULTOR ──────────────────────────────────────────
    async function cargarDashboardAdmin(periodo, rubro = 'ALL') {
        try {
            const [
                resumenRes,
                gruposRes,
                estadosRes,
                proximosRes,
                cumplimientoRes,
                globalGestionRes,
                rankingRes,
                alertasRes
            ] = await Promise.allSettled([
                obtenerResumen(periodo),
                obtenerDocumentosPorGrupo(periodo),
                obtenerDocumentosPorEstado(periodo),
                obtenerProximosVencer(periodo),
                obtenerResumenProveedoresCumplimiento(periodo, rubro),
                obtenerCumplimientoGlobalPorGestion(periodo, rubro),
                obtenerRankingProveedores(periodo, rubro),
                obtenerAlertasConsultor(periodo, rubro)
            ]);

            const resumenData = (resumenRes.status === 'fulfilled' && resumenRes.value) ? resumenRes.value : { total_proveedores: 0, total_documentos: 0, documentos_vigentes: 0, documentos_vencidos: 0 };
            const gruposData = (gruposRes.status === 'fulfilled' && Array.isArray(gruposRes.value)) ? gruposRes.value : [];
            const estadosData = (estadosRes.status === 'fulfilled' && Array.isArray(estadosRes.value)) ? estadosRes.value : [];
            const proximosData = (proximosRes.status === 'fulfilled' && Array.isArray(proximosRes.value)) ? proximosRes.value : [];
            const cumplimientoData = (cumplimientoRes.status === 'fulfilled' && cumplimientoRes.value) ? cumplimientoRes.value : { total_proveedores: 0, recomendados: 0, recomendados_con_restricciones: 0, no_recomendados: 0 };
            const globalGestionData = (globalGestionRes.status === 'fulfilled' && Array.isArray(globalGestionRes.value)) ? globalGestionRes.value : [];
            const rankingData = (rankingRes.status === 'fulfilled' && Array.isArray(rankingRes.value)) ? rankingRes.value : [];
            const alertasData = (alertasRes.status === 'fulfilled' && alertasRes.value) ? alertasRes.value : { proveedores: [], documentos_por_vencer: [] };

            setRawAdminResumen(resumenData);
            setResumen(resumenData);
            setRawAdminGrupos(gruposData.map(item => ({ ...item, cantidad: Number(item.cantidad || 0) })));
            setGrupos(gruposData.map(item => ({ ...item, cantidad: Number(item.cantidad || 0) })));
            setRawAdminEstados(estadosData.map(item => ({ ...item, cantidad: Number(item.cantidad || 0) })));
            setEstados(estadosData.map(item => ({ ...item, cantidad: Number(item.cantidad || 0) })));
            setRawAdminProximos(proximosData);
            setProximos(proximosData);
            setCumplimientoProveedores(cumplimientoData);
            setCumplimientoGlobal(globalGestionData);
            setRawRankingProveedores(rankingData);
            setRawAlertasConsultor(alertasData);

            const resAlertas = calcularRankingYAlertas(rankingData, alertasData, gestionFiltro);
            setRankingCalculado(resAlertas.ranking);
            setAlertasCalculadas(resAlertas);
        } catch (error) {
            console.error("Error al cargar dashboard admin/consultor:", error);
            setResumen({ total_proveedores: 0, total_documentos: 0, documentos_vigentes: 0, documentos_vencidos: 0 });
            setCumplimientoProveedores({ total_proveedores: 0, recomendados: 0, recomendados_con_restricciones: 0, no_recomendados: 0 });
        }
    };

    const aplicarFiltroAdmin = (rawGrupos, rawProximosList, rawEstadosList, rawRes, gestionesCodeArray) => {
        if (!rawGrupos) return;
        const isAll = !gestionesCodeArray || gestionesCodeArray.length === 0 || gestionesCodeArray.includes('ALL');

        if (isAll) {
            setResumen(rawRes);
            setGrupos(rawGrupos);
            setEstados(rawEstadosList);
            setProximos(rawProximosList || []);
            return;
        }

        const configs = gestionesCodeArray.map(code => GESTION_MAP[code]).filter(Boolean);
        const gruposPermitidos = configs.map(c => c.grupo);
        const alcancesPermitidos = configs.reduce((acc, c) => [...acc, ...c.alcances], []);

        // Filtrar pendientes de ingresar por alcance o grupo asociado a la gestión
        const proximosFiltrados = (rawProximosList || []).filter(item => {
            if (item.alcance) return alcancesPermitidos.includes(item.alcance);
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

            console.log('>>> proveedorId Dashboard:', miProveedorId);

            const dataKpis = await obtenerCumplimientoGestion(miProveedorId);
            
            console.log('>>> dataKpis Dashboard:', dataKpis);            
            

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
            'RP': { 'GSG': 9, 'GMA': 1, 'GCA': 1, 'GPA': 1, 'GTR': 1 },
            'RM': { 'GSG': 7, 'GMA': 1, 'GCA': 1, 'GPA': 1, 'GTR': 1 }
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

            //const docsAlcance = docsFiltrados.filter(d => d.alcance === alcance);
            const docsAlcance = docsFiltrados.filter(d => d.alcance === alcance && d.estado_documento === 'V');


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

        // Documentos pendientes de ingresar para el proveedor logueado
        const regimenProv = rawCalificacion?.regimen_tributario_codigo || rawCalificacion?.regimen_tributario || proveedorInfo?.codigo_regimen_tributario || proveedorInfo?.regimen_tributario || 'RG';
        const nroTrabProv = proveedorInfo?.nro_trabajadores || '';
        const todosPendientes = calcularPendientesProveedor(regimenProv, nroTrabProv, acumuladoDocs, obtenerIdentidadProveedor());

        const alcancesPermitidos = isAll ? null : configs.reduce((acc, c) => [...acc, ...c.alcances], []);
        const pendientesFiltrados = isAll
            ? todosPendientes
            : todosPendientes.filter(item => alcancesPermitidos.includes(item.alcance));

        setProximos(pendientesFiltrados);

        const unDiaMs = 86400000;
        const hoyMas15 = new Date(hoy.getTime() + 15 * unDiaMs);

        const vencidosAbs = docsFiltrados.filter(d => {
            if (!d || !d.fecha_vigencia) return false;
            const f = new Date(d.fecha_vigencia);
            f.setHours(0, 0, 0, 0);
            return f < hoy;
        }).length;

        const porVencerAbs = docsFiltrados.filter(d => {
            if (!d || !d.fecha_vigencia) return false;
            const f = new Date(d.fecha_vigencia);
            f.setHours(0, 0, 0, 0);
            return f >= hoy && f <= hoyMas15;
        }).length;

        const vigentesAbs = docsFiltrados.filter(d => {
            if (!d || !d.fecha_vigencia) return false;
            const f = new Date(d.fecha_vigencia);
            f.setHours(0, 0, 0, 0);
            return f >= hoy;
        }).length;

        const pendientesCount = pendientesFiltrados.length;

        setEstadoExpediente({
            total_exigibles: totalExigibles,
            total_registrados: totalRegistrados,
            vigentes_para_porcentaje: totalVigentesCapped,
            vencidos: vencidosAbs,
            por_vencer: porVencerAbs,
            vigentes: vigentesAbs,
            pendientes: pendientesCount
        });

        // Gráficos de grupo según filtro
        if (!isAll && configs.length > 0) {
            const gruposEstadistica = configs.map(config => {
                const count = docsFiltrados.filter(d => {
                    if (d && d.alcance) return config.alcances.includes(d.alcance);
                    return d && d.grupo_documentos === config.grupo;
                }).length;
                return { descripcion: config.nombre, cantidad: count };
            });
            setGrupos(gruposEstadistica);
        } else {
            const estadisticaGrupos = CODIGOS_GRUPOS.map(grupoCode => {
                const count = (acumuladoDocs || []).filter(d => d && d.grupo_documentos === grupoCode).length;
                return { descripcion: NOMBRES_GRUPOS[grupoCode], cantidad: count };
            });
            setGrupos(estadisticaGrupos);
        }

        setEstados([
            { descripcion: 'VIGENTE', cantidad: vigentesCount },
            { descripcion: 'VENCIDO', cantidad: vencidosCount }
        ]);

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

                            //const docsAlcance = docsFiltrados.filter(d => d.alcance === alcance);
                            //const uniqueTypes = new Set(docsAlcance.map(d => d.tipo_documento_id));
                            //const countUploaded = uniqueTypes.size;

                            //totalCappedIngresados += Math.min(countUploaded, exigibleAlcance);
                            
                            const docsAlcance = docsFiltrados.filter(d => d.alcance === alcance && d.estado_documento === 'V');
                            const uniqueTypes = new Set(docsAlcance.map(d => d.tipo_documento_id));
                            const countVigentes = uniqueTypes.size;

                            totalCappedIngresados += Math.min(countVigentes,exigibleAlcance);

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

    // Documentos pendientes ordenados por proveedor, alcance y tipo de documento
    const proximosOrdenados = [...proximos].sort((a, b) => {
        if (a.proveedor !== b.proveedor) return String(a.proveedor || '').localeCompare(String(b.proveedor || ''));
        if (a.alcance !== b.alcance) return String(a.alcance || '').localeCompare(String(b.alcance || ''));
        return String(a.tipo_documento_id || '').localeCompare(String(b.tipo_documento_id || ''));
    });

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
                        {esProveedor
                            ? `Panel de Control - ${obtenerIdentidadProveedor()}`
                            : esConsultor
                                ? 'Panel de Control - Consultor'
                                : 'Dashboard ProvGestion'}
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
                        Por favor, complete su registro de Ficha Informativa en la sección de Mi Ficha para activar sus indicadores.
                    </div>
                </div>
            ) : (
                <>
                    {/* ── VISTA CONSULTOR: TARJETA GENERAL PROVEEDORES (Agrandada y Destacada) ─────────── */}
                    {esConsultor && (() => {
                        const totalP = Number(cumplimientoProveedores?.total_proveedores ?? resumen?.total_proveedores ?? 0);
                        const recP = Number(cumplimientoProveedores?.recomendados ?? 0);
                        const restP = Number(cumplimientoProveedores?.recomendados_con_restricciones ?? 0);
                        const noRecP = Number(cumplimientoProveedores?.no_recomendados ?? 0);

                        const recPct = totalP > 0 ? Math.round((recP / totalP) * 100) : 0;
                        const restPct = totalP > 0 ? Math.round((restP / totalP) * 100) : 0;
                        const noRecPct = totalP > 0 ? Math.round((noRecP / totalP) * 100) : 0;

                        return (
                            <div style={{
                                ...styles.card,
                                padding: '26px 30px',
                                borderLeft: `5px solid ${colors.primary}`,
                                borderRadius: '14px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                marginBottom: '28px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '22px',
                                    borderBottom: `1px solid ${colors.border}`,
                                    paddingBottom: '16px',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '10px',
                                            background: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: colors.primary,
                                            boxShadow: '0 2px 4px rgba(37,99,235,0.08)'
                                        }}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '18px', fontWeight: 800, color: colors.text, margin: 0, letterSpacing: '0.01em' }}>
                                                General Proveedores
                                            </h2>
                                            <p style={{ color: colors.textMuted, fontSize: '13px', margin: '3px 0 0 0' }}>
                                                Distribución global del cumplimiento y calificación de proveedores en el sistema.
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{
                                        background: '#eff6ff',
                                        color: colors.primary,
                                        fontWeight: 800,
                                        fontSize: '13.5px',
                                        padding: '6px 18px',
                                        borderRadius: '999px',
                                        border: '1px solid #bfdbfe',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 1px 2px rgba(37,99,235,0.05)'
                                    }}>
                                        <span>Total:</span>
                                        <strong style={{ fontSize: '15.5px' }}>{totalP}</strong>
                                    </span>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {/* 1. Recomendados */}
                                    <div style={{
                                        padding: '16px 18px',
                                        background: colors.successBg,
                                        border: '1px solid #a7f3d0',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '8px',
                                                    background: '#dcfce7',
                                                    border: '1px solid #bbf7d0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#16a34a',
                                                    flexShrink: 0
                                                }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                                        <polyline points="9 12 11 14 15 10"></polyline>
                                                    </svg>
                                                </div>
                                                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#166534' }}>Recomendados</span>
                                            </div>
                                            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: '999px', border: '1px solid #bbf7d0' }}>
                                                {recPct}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', background: '#bbf7d0', borderRadius: '999px', overflow: 'hidden', height: '7px' }}>
                                            <div style={{ width: `${recPct}%`, background: colors.success, height: '100%', transition: 'width 0.8s ease-in-out', borderRadius: '999px' }}></div>
                                        </div>
                                    </div>

                                    {/* 2. Recomendados con restricciones */}
                                    <div style={{
                                        padding: '16px 18px',
                                        background: '#fef3c7',
                                        border: '1px solid #fde68a',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '8px',
                                                    background: '#fef3c7',
                                                    border: '1px solid #fde68a',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#d97706',
                                                    flexShrink: 0
                                                }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                                    </svg>
                                                </div>
                                                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#92400e' }}>Recomendados con restricciones</span>
                                            </div>
                                            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '3px 10px', borderRadius: '999px', border: '1px solid #fde68a' }}>
                                                {restPct}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', background: '#fde68a', borderRadius: '999px', overflow: 'hidden', height: '7px' }}>
                                            <div style={{ width: `${restPct}%`, background: '#d97706', height: '100%', transition: 'width 0.8s ease-in-out', borderRadius: '999px' }}></div>
                                        </div>
                                    </div>

                                    {/* 3. No recomendados */}
                                    <div style={{
                                        padding: '16px 18px',
                                        background: colors.dangerBg,
                                        border: '1px solid #fecaca',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '8px',
                                                    background: '#fee2e2',
                                                    border: '1px solid #fecaca',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#dc2626',
                                                    flexShrink: 0
                                                }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                                    </svg>
                                                </div>
                                                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#991b1b' }}>No recomendados</span>
                                            </div>
                                            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '3px 10px', borderRadius: '999px', border: '1px solid #fecaca' }}>
                                                {noRecPct}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', background: '#fecaca', borderRadius: '999px', overflow: 'hidden', height: '7px' }}>
                                            <div style={{ width: `${noRecPct}%`, background: colors.danger, height: '100%', transition: 'width 0.8s ease-in-out', borderRadius: '999px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* ── VISTA CONSULTOR: TARJETAS RANKING DE PROVEEDORES Y ALERTAS / ATENCIÓN ─────────── */}
                    {esConsultor && (
                        <div className="consultor-grid">
                            {/* 1. TARJETA: RANKING DE PROVEEDORES */}
                            <div style={{
                                ...styles.card,
                                padding: '24px 26px',
                                borderLeft: `5px solid #2563eb`,
                                borderRadius: '14px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '18px',
                                        borderBottom: `1px solid ${colors.border}`,
                                        paddingBottom: '14px',
                                        flexWrap: 'wrap',
                                        gap: '10px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '10px',
                                                background: '#eff6ff',
                                                border: '1px solid #bfdbfe',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: colors.primary,
                                                boxShadow: '0 2px 4px rgba(37,99,235,0.08)'
                                            }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                                    <path d="M4 22h16"></path>
                                                    <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34"></path>
                                                    <path d="M18 14.66V17c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1v-2.34"></path>
                                                    <path d="M6 4h12v7a6 6 0 0 1-12 0V4Z"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 style={{ fontSize: '17px', fontWeight: 800, color: colors.text, margin: 0, letterSpacing: '0.01em' }}>
                                                    Ranking de Proveedores
                                                </h2>
                                                <p style={{ color: colors.textMuted, fontSize: '12.5px', margin: '2px 0 0 0' }}>
                                                    Top proveedores con las mejores calificaciones del sistema.
                                                </p>
                                            </div>
                                        </div>

                                        <span style={{
                                            background: '#f8fafc',
                                            color: '#475569',
                                            fontWeight: 700,
                                            fontSize: '12px',
                                            padding: '4px 12px',
                                            borderRadius: '999px',
                                            border: '1px solid #e2e8f0',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}>
                                            <span>Evaluados:</span>
                                            <strong style={{ color: '#1e293b' }}>{rankingCalculado.length}</strong>
                                        </span>
                                    </div>

                                    {/* Lista Top 1 a 3 */}
                                    {rankingCalculado.length === 0 ? (
                                        <div style={{ ...styles.emptyState, padding: '36px 16px' }}>
                                            No se encontraron proveedores registrados para el periodo y rubro seleccionados.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {rankingCalculado.slice(0, 3).map((prov, index) => {
                                                const pct = prov.puntaje_evaluado || 0;
                                                const badgeBg = pct > 90 ? '#dcfce7' : pct >= 75 ? '#fef3c7' : '#fee2e2';
                                                const badgeFg = pct > 90 ? '#15803d' : pct >= 75 ? '#b45309' : '#dc2626';
                                                const badgeBorder = pct > 90 ? '#bbf7d0' : pct >= 75 ? '#fde68a' : '#fecaca';
                                                const barColor = pct > 90 ? colors.success : pct >= 75 ? '#d97706' : colors.danger;

                                                // Medalla SVG formal por posición
                                                const medalBg = index === 0 ? '#fef3c7' : index === 1 ? '#f1f5f9' : '#ffedd5';
                                                const medalBorder = index === 0 ? '#fde68a' : index === 1 ? '#cbd5e1' : '#fed7aa';
                                                const medalColor = index === 0 ? '#d97706' : index === 1 ? '#475569' : '#c2410c';

                                                return (
                                                    <div
                                                        key={prov.proveedor_id || index}
                                                        style={{
                                                            background: '#ffffff',
                                                            border: `1px solid ${index === 0 ? '#fde68a' : '#e5e7eb'}`,
                                                            borderRadius: '12px',
                                                            padding: '14px 16px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '8px',
                                                            boxShadow: index === 0 ? '0 2px 6px rgba(217,119,6,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                                                            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                                                <div style={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: '8px',
                                                                    background: medalBg,
                                                                    border: `1px solid ${medalBorder}`,
                                                                    color: medalColor,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0,
                                                                    fontWeight: 800,
                                                                    fontSize: '13px'
                                                                }}>
                                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                                                                        <circle cx="12" cy="8" r="6"></circle>
                                                                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                                                                    </svg>
                                                                    {index + 1}º
                                                                </div>
                                                                <div style={{ minWidth: 0 }}>
                                                                    <h4 style={{
                                                                        fontSize: '14px',
                                                                        fontWeight: 750,
                                                                        color: colors.text,
                                                                        margin: 0,
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }}>
                                                                        {prov.proveedor_nombre}
                                                                    </h4>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '11.5px', color: colors.textMuted }}>
                                                                        <span>Doc: <strong>{prov.nro_documento || 'S/N'}</strong></span>
                                                                        {prov.regimen_tributario && (
                                                                            <span style={{
                                                                                background: '#f3f4f6',
                                                                                padding: '1px 6px',
                                                                                borderRadius: '4px',
                                                                                fontWeight: 600
                                                                            }}>
                                                                                {prov.regimen_tributario}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <span style={{
                                                                ...styles.badge(badgeBg, badgeFg),
                                                                border: `1px solid ${badgeBorder}`,
                                                                padding: '4px 10px',
                                                                fontSize: '13px',
                                                                fontWeight: 800,
                                                                flexShrink: 0
                                                            }}>
                                                                {pct}%
                                                            </span>
                                                        </div>

                                                        {/* Barra de progreso */}
                                                        <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden', height: '6px' }}>
                                                            <div style={{
                                                                width: `${Math.min(pct, 100)}%`,
                                                                background: barColor,
                                                                height: '100%',
                                                                borderRadius: '999px',
                                                                transition: 'width 0.8s ease-in-out'
                                                            }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Botón "Ver ranking completo" */}
                                <button
                                    type="button"
                                    onClick={() => setModalRankingOpen(true)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        background: '#f8fafc',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        padding: '11px 16px',
                                        fontSize: '13.5px',
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        marginTop: '18px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = '#eff6ff';
                                        e.currentTarget.style.borderColor = '#93c5fd';
                                        e.currentTarget.style.color = '#1d4ed8';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = '#f8fafc';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                        e.currentTarget.style.color = '#1e293b';
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="8" y1="6" x2="21" y2="6"></line>
                                        <line x1="8" y1="12" x2="21" y2="12"></line>
                                        <line x1="8" y1="18" x2="21" y2="18"></line>
                                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                    </svg>
                                    Ver ranking completo ({rankingCalculado.length})
                                </button>
                            </div>

                            {/* 2. TARJETA: ALERTAS / ATENCIÓN */}
                            <div style={{
                                ...styles.card,
                                padding: '24px 26px',
                                borderLeft: `5px solid #dc2626`,
                                borderRadius: '14px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '18px',
                                        borderBottom: `1px solid ${colors.border}`,
                                        paddingBottom: '14px',
                                        flexWrap: 'wrap',
                                        gap: '10px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '10px',
                                                background: '#fef2f2',
                                                border: '1px solid #fecaca',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: colors.danger,
                                                boxShadow: '0 2px 4px rgba(220,38,38,0.08)'
                                            }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 style={{ fontSize: '17px', fontWeight: 800, color: colors.text, margin: 0, letterSpacing: '0.01em' }}>
                                                    Alertas y Atención
                                                </h2>
                                                <p style={{ color: colors.textMuted, fontSize: '12.5px', margin: '2px 0 0 0' }}>
                                                    Monitoreo preventivo de proveedores e incidencias críticas.
                                                </p>
                                            </div>
                                        </div>

                                        <span style={{
                                            background: '#fef2f2',
                                            color: '#b91c1c',
                                            fontWeight: 700,
                                            fontSize: '12px',
                                            padding: '4px 12px',
                                            borderRadius: '999px',
                                            border: '1px solid #fecaca',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}>
                                            <span>Total incidencias:</span>
                                            <strong style={{ color: '#991b1b' }}>
                                                {alertasCalculadas.noRecomendadosCount + (alertasCalculadas.porVencerCount > 0 ? 1 : 0) + (alertasCalculadas.incompletosCount > 0 ? 1 : 0)}
                                            </strong>
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {/* Alerta 1: Proveedores No Recomendados */}
                                        <div
                                            onClick={() => setModalAlertaDetalle('NO_RECOMENDADOS')}
                                            style={{
                                                padding: '14px 16px',
                                                background: '#FEF2F2',
                                                border: '1px solid #FECACA',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.borderColor = '#f87171';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.borderColor = '#FECACA';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: '8px',
                                                    background: '#fee2e2',
                                                    border: '1px solid #fecaca',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#dc2626',
                                                    flexShrink: 0
                                                }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13.5px', fontWeight: 750, color: '#991B1B' }}>
                                                        Proveedores no recomendados
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '2px' }}>
                                                        Calificación menor al 75% de cumplimiento
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{
                                                    fontSize: '18px',
                                                    fontWeight: 800,
                                                    color: '#dc2626',
                                                    background: '#ffffff',
                                                    padding: '4px 14px',
                                                    borderRadius: '999px',
                                                    border: '1px solid #fecaca',
                                                    boxShadow: '0 1px 2px rgba(220,38,38,0.08)'
                                                }}>
                                                    {alertasCalculadas.noRecomendadosCount}
                                                </span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Alerta 2: Documentos por Vencer (< 15 días) */}
                                        <div
                                            onClick={() => setModalAlertaDetalle('POR_VENCER')}
                                            style={{
                                                padding: '14px 16px',
                                                background: '#FFFBEB',
                                                border: '1px solid #FDE68A',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.borderColor = '#fbbf24';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.borderColor = '#FDE68A';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: '8px',
                                                    background: '#fef3c7',
                                                    border: '1px solid #fde68a',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#d97706',
                                                    flexShrink: 0
                                                }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <polyline points="12 6 12 12 16 14"></polyline>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13.5px', fontWeight: 750, color: '#92400E' }}>
                                                        Documentos por vencer
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>
                                                        Vencimiento en menos de 15 días
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{
                                                    fontSize: '18px',
                                                    fontWeight: 800,
                                                    color: '#b45309',
                                                    background: '#ffffff',
                                                    padding: '4px 14px',
                                                    borderRadius: '999px',
                                                    border: '1px solid #fde68a',
                                                    boxShadow: '0 1px 2px rgba(217,119,6,0.08)'
                                                }}>
                                                    {alertasCalculadas.porVencerCount}
                                                </span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Alerta 3: Llenado Incompleto de Documentos */}
                                        <div
                                            onClick={() => setModalAlertaDetalle('INCOMPLETOS')}
                                            style={{
                                                padding: '14px 16px',
                                                background: '#EFF6FF',
                                                border: '1px solid #BFDBFE',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.borderColor = '#60a5fa';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.borderColor = '#BFDBFE';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: '8px',
                                                    background: '#eff6ff',
                                                    border: '1px solid #bfdbfe',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#2563eb',
                                                    flexShrink: 0
                                                }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                        <line x1="9" y1="15" x2="15" y2="15"></line>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13.5px', fontWeight: 750, color: '#1E40AF' }}>
                                                        Llenado incompleto de documentos
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '2px' }}>
                                                        Proveedores con carga documental pendiente
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{
                                                    fontSize: '18px',
                                                    fontWeight: 800,
                                                    color: '#1d4ed8',
                                                    background: '#ffffff',
                                                    padding: '4px 14px',
                                                    borderRadius: '999px',
                                                    border: '1px solid #bfdbfe',
                                                    boxShadow: '0 1px 2px rgba(37,99,235,0.08)'
                                                }}>
                                                    {alertasCalculadas.incompletosCount}
                                                </span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '16px',
                                    paddingTop: '12px',
                                    borderTop: `1px solid ${colors.border}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                    color: colors.textMuted
                                }}>
                                    <span>Haga clic en cualquier alerta para ver el detalle.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tarjetas de estadísticas y KPI (Solo Admin y Proveedor) ─────────────────────────── */}
                    {!esConsultor && (resumen || !esProveedor) && (
                        <div className={`stats-grid ${esProveedor ? 'proveedor' : ''}`}>

                            {!esProveedor ? (
                                <div style={styles.statCard(colors.primary)}>
                                    <p style={styles.statLabel}>Proveedores</p>
                                    <p style={styles.statValue(colors.text)}>{resumen?.total_proveedores ?? 0}</p>
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
                                                                        <div style={{ width: '100%', background: colors.border, borderRadius: '4px', overflow: 'hidden', height: '6px' }}>
                                                                            <div style={{ width: `${pct}%`, background: progressColor, height: '100%', transition: 'width 1s ease-in-out', borderRadius: '4px' }}></div>
                                                                        </div>
                                                                        {((kpi.gestion || '').toUpperCase().includes('SST') || (kpi.gestion || '').toUpperCase().includes('MA')) && kpi.documentos_registrados !== undefined && kpi.documentos_exigibles !== undefined && (
                                                                            <span style={{ fontSize: '11.5px', color: colors.textMuted, fontWeight: '600' }}>
                                                                                {kpi.documentos_registrados} de {kpi.documentos_exigibles} documentos
                                                                            </span>
                                                                        )}
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
                                        <p style={styles.statValue(colors.text)}>{resumen?.total_documentos ?? 0}</p>
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
                                                MI CALIFICACIÓN - <span style={{ color: colors.primary }}>{obtenerIdentidadProveedor()}</span>
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
                                        paddingTop: '18px',
                                        marginTop: '24px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            padding: '6px 16px',
                                            borderRadius: '999px',
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            color: '#1d4ed8',
                                            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.05)'
                                        }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            Cómo me ven los clientes
                                        </span>
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
                                            const pctRegistro = registrados > 0 ? Math.min((registrados / exigibles) * 100, 100).toFixed(0) : 0;
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
                                const registrados = resumen?.total_documentos || 0;
                                const vigentes = resumen?.documentos_vigentes || 0;
                                const porcentaje = registrados > 0 ? ((vigentes / registrados) * 100).toFixed(2) : '0.00';
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
                                    <p style={styles.statValue(colors.danger)}>{resumen?.documentos_vencidos ?? 0}</p>
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
                                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#b45309' }}>Por vencer(menos de 15 dias)</span>
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

                                            <button
                                                onClick={() => {
                                                    if (pendientesRef.current) {
                                                        pendientesRef.current.scrollIntoView({ behavior: 'smooth' });
                                                    }
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f3f4f6', border: `1px solid #e5e7eb`, borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Pendientes</span>
                                                    {(estadoExpediente.pendientes > 0) && (
                                                        <span style={{ background: '#6b7280', width: 8, height: 8, borderRadius: '50%' }}></span>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                                                    {estadoExpediente.pendientes ?? 0}
                                                </span>
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

                {/* ── Gráfico de torta: estado de documentos (Solo Admin y Proveedor) ───────────── */}
                {!esConsultor && estados.length > 0 && (
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

                {/* ── TARJETA: CUMPLIMIENTO POR GESTIÓN (Solo Consultor) ────────────── */}
                {esConsultor && (
                    <div style={{
                        ...styles.card,
                        marginTop: '30px',
                        padding: '24px 28px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ display: 'inline-block', width: '4px', height: '22px', background: colors.primary, borderRadius: '4px' }}></span>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: colors.text, letterSpacing: '0.02em' }}>
                                        CUMPLIMIENTO POR GESTIÓN
                                    </h3>
                                    <p style={{ color: colors.textMuted, fontSize: '13px', margin: '3px 0 0 0' }}>
                                        Indicadores de cumplimiento de los proveedores por cada área de gestión.
                                    </p>
                                </div>
                            </div>
                            {cumplimientoProveedores?.total_proveedores > 0 && (
                                <span style={{
                                    background: '#eff6ff',
                                    color: colors.primary,
                                    fontWeight: 700,
                                    fontSize: '12.5px',
                                    padding: '5px 14px',
                                    borderRadius: '999px',
                                    border: '1px solid #bfdbfe'
                                }}>
                                    {cumplimientoProveedores.total_proveedores} Proveedor{cumplimientoProveedores.total_proveedores === 1 ? '' : 'es'} evaluados
                                </span>
                            )}
                        </div>

                        <div className="table-scroll">
                            <table style={{ ...styles.table, marginTop: 0 }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...styles.th, width: '30%', padding: '12px 16px', background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>Gestión</th>
                                        <th style={{ ...styles.th, width: '55%', padding: '12px 16px', background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>Avance de Cumplimiento</th>
                                        <th style={{ ...styles.th, textAlign: 'center', width: '15%', padding: '12px 16px', background: '#f8fafc', borderBottom: `2px solid ${colors.border}` }}>Cumplimiento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(cumplimientoGlobal && cumplimientoGlobal.length > 0 ? cumplimientoGlobal : [
                                        { codigo: 'SST_MA', nombre: 'SST-MA', porcentaje: 0 },
                                        { codigo: 'CALIDAD', nombre: 'CALIDAD', porcentaje: 0 },
                                        { codigo: 'PATRIMONIAL', nombre: 'SEG. PATRIMONIAL', porcentaje: 0 },
                                        { codigo: 'ETICA', nombre: 'ETICA', porcentaje: 0 },
                                    ]).filter(item => {
                                        if (!gestionFiltro || gestionFiltro.length === 0 || gestionFiltro.includes('ALL')) return true;
                                        if ((item.codigo === 'SST_MA' || (item.nombre || '').includes('SST')) && (gestionFiltro.includes('GSG,GMA') || gestionFiltro.includes('GSG') || gestionFiltro.includes('GMA'))) return true;
                                        if ((item.codigo === 'CALIDAD' || (item.nombre || '').includes('CALIDAD')) && (gestionFiltro.includes('GCA') || gestionFiltro.includes('CALIDAD'))) return true;
                                        if ((item.codigo === 'PATRIMONIAL' || (item.nombre || '').includes('PATRIMONIAL')) && (gestionFiltro.includes('GPA') || gestionFiltro.includes('PATRIMONIAL'))) return true;
                                        if ((item.codigo === 'ETICA' || (item.nombre || '').includes('ETICA')) && (gestionFiltro.includes('GTR') || gestionFiltro.includes('ETICA'))) return true;
                                        return false;
                                    }).map((item, index) => {
                                        const pct = Number(item.porcentaje || 0);
                                        const progressColor = pct >= 90 ? colors.success : pct >= 75 ? '#d97706' : colors.danger;
                                        const badgeBg = pct >= 90 ? '#dcfce7' : pct >= 75 ? '#fef3c7' : '#fee2e2';
                                        const badgeFg = pct >= 90 ? '#15803d' : pct >= 75 ? '#b45309' : '#dc2626';
                                        const badgeBorder = pct >= 90 ? '#bbf7d0' : pct >= 75 ? '#fde68a' : '#fecaca';

                                        return (
                                            <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ ...styles.td, padding: '16px' }}>
                                                    <strong style={{ fontSize: '13.5px', color: colors.text }}>{item.nombre}</strong>
                                                </td>
                                                <td style={{ ...styles.td, padding: '16px' }}>
                                                    <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', height: '10px' }}>
                                                        <div style={{
                                                            width: `${Math.min(pct, 100)}%`,
                                                            background: progressColor,
                                                            height: '100%',
                                                            transition: 'width 1s ease-in-out',
                                                            borderRadius: '999px'
                                                        }}></div>
                                                    </div>
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center', padding: '16px' }}>
                                                    <span style={{
                                                        ...styles.badge(badgeBg, badgeFg),
                                                        padding: '5px 14px',
                                                        fontSize: '13px',
                                                        fontWeight: 800,
                                                        border: `1px solid ${badgeBorder}`,
                                                        borderRadius: '999px'
                                                    }}>
                                                        {pct.toFixed(2)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Tabla de pendientes de ingresar (Solo Proveedor y Admin, NO Consultor) ───────────────────────── */}
                {!esConsultor && (
                    <div ref={pendientesRef} style={{ ...styles.card, marginTop: '30px' }}>
                        <h2 style={styles.sectionTitle}>
                            {esProveedor
                                ? 'Mis Documentos Pendientes de Ingresar'
                                : 'Documentos Pendientes de Ingresar por Proveedor'}
                        </h2>

                        {proximosOrdenados.length === 0 ? (
                            <div style={styles.emptyState}>
                                No existen documentos pendientes de ingresar.
                            </div>
                        ) : (
                            <div className="table-scroll">
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            {!esProveedor && <th style={styles.th}>Proveedor</th>}
                                            <th style={styles.th}>Alcance</th>
                                            <th style={styles.th}>Gestión</th>
                                            <th style={styles.th}>Tipo Documento / Descripción</th>
                                            <th style={styles.th}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proximosOrdenados.map((item, index) => (
                                            <tr key={index}>
                                                {!esProveedor && <td style={styles.td}>{item.proveedor}</td>}
                                                <td style={styles.td}>
                                                    <span style={{
                                                        fontWeight: '600',
                                                        color: colors.primary,
                                                        background: '#e0e7ff',
                                                        padding: '3px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}>
                                                        {item.alcance_nombre || item.alcance}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>{item.gestion}</td>
                                                <td style={styles.td}>{item.tipo_documento}</td>
                                                <td style={styles.td}>
                                                    <span style={styles.badge('#fee2e2', '#dc2626')}>
                                                        {item.estado || 'Pendiente de ingresar'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TARJETA: DIRECTORIO DE CLIENTES POTENCIALES (Solo Proveedor) ────────────── */}
                {esProveedor && (
                    <div style={{ ...styles.card, marginTop: '30px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700', color: colors.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'inline-block', width: '4px', height: '18px', background: '#2563eb', borderRadius: '2px' }}></span>
                            DIRECTORIO DE CLIENTES POTENCIALES
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Bloque 1: Mis Clientes */}
                            <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: colors.textMuted, margin: 0, textTransform: 'uppercase' }}>
                                    MIS CLIENTES
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setMostrarConstruccion(true)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: colors.primary,
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 14px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = '#1d4ed8';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = colors.primary;
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(37, 99, 235, 0.2)';
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="8" y1="6" x2="21" y2="6"></line>
                                        <line x1="8" y1="12" x2="21" y2="12"></line>
                                        <line x1="8" y1="18" x2="21" y2="18"></line>
                                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                    </svg>
                                    Listar
                                </button>
                            </div>

                            {/* Bloque 2: Clientes Potenciales */}
                            <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px' }}>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: colors.textMuted, margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                                    CLIENTES POTENCIALES
                                </p>
                                <p style={{ fontSize: '14px', margin: 0, color: colors.text }}>
                                    Total disponible: <strong>{Math.max(0, 100 - (proveedorInfo?.clientes?.length || 0))}</strong>
                                </p>
                            </div>

                            {/* Breve descripción explicativa */}
                            <p style={{ fontSize: '13.5px', color: colors.textMuted, margin: 0, lineHeight: '1.4' }}>
                                Esta sección le permite visualizar las oportunidades comerciales disponibles. Acceda al directorio para conectar con nuevos clientes que buscan proveedores con sus mismas calificaciones y estándares de gestión.
                            </p>

                            {/* Recuadro destacado centrado */}
                            <div style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                textAlign: 'center',
                                marginTop: '8px'
                            }}>
                                {/* Ícono de candado */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px'
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>

                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>
                                    DIRECTORIO DE CLIENTES POTENCIALES
                                </h4>

                                <button
                                    type="button"
                                    onClick={() => setMostrarConstruccion(true)}
                                    style={{
                                        background: colors.primary,
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '10px 20px',
                                        fontSize: '13.5px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        textTransform: 'uppercase'
                                    }}
                                    onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
                                    onMouseOut={(e) => e.target.style.background = colors.primary}
                                >
                                    ACCEDER AL DIRECTORIO
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )}

            {/* ── MODAL: RANKING COMPLETO DE PROVEEDORES ────────────────────────── */}
            {modalRankingOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(3px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        maxWidth: '900px',
                        width: '100%',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }}>
                        {/* Header del Modal */}
                        <div style={{
                            padding: '20px 26px',
                            borderBottom: `1px solid ${colors.border}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8fafc'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '8px',
                                        background: '#eff6ff',
                                        border: '1px solid #bfdbfe',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: colors.primary
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                            <path d="M4 22h16"></path>
                                            <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34"></path>
                                            <path d="M18 14.66V17c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1v-2.34"></path>
                                            <path d="M6 4h12v7a6 6 0 0 1-12 0V4Z"></path>
                                        </svg>
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: colors.text }}>
                                        Ranking Completo de Proveedores
                                    </h3>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '12px', color: colors.textMuted }}>Filtros activos:</span>
                                    <span style={{ fontSize: '11.5px', background: '#eff6ff', color: colors.primary, padding: '2px 8px', borderRadius: '4px', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                                        Periodo: {periodoFiltro}
                                    </span>
                                    {rubroFiltro !== 'ALL' && (
                                        <span style={{ fontSize: '11.5px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, border: '1px solid #fde68a' }}>
                                            Rubro: {rubroFiltro}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '11.5px', background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, border: '1px solid #e5e7eb' }}>
                                        Gestión: {gestionFiltro.includes('ALL') ? 'Todas las gestiones' : GESTION_MAP[gestionFiltro[0]]?.nombre || gestionFiltro}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalRankingOpen(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: colors.textMuted,
                                    cursor: 'pointer',
                                    padding: '6px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = colors.text}
                                onMouseOut={(e) => e.currentTarget.style.color = colors.textMuted}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Cuerpo del Modal (Tabla) */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 26px' }}>
                            {rankingCalculado.length === 0 ? (
                                <div style={{ ...styles.emptyState, padding: '40px 16px' }}>
                                    No hay datos de proveedores para mostrar con los filtros seleccionados.
                                </div>
                            ) : (
                                <div className="table-scroll">
                                    <table style={{ ...styles.table, marginTop: 0 }}>
                                        <thead>
                                            <tr>
                                                <th style={{ ...styles.th, width: '8%', textAlign: 'center' }}>Pos.</th>
                                                <th style={{ ...styles.th, width: '36%' }}>Proveedor</th>
                                                <th style={{ ...styles.th, width: '16%' }}>RUC</th>
                                                <th style={{ ...styles.th, width: '16%', textAlign: 'center' }}>Régimen</th>
                                                <th style={{ ...styles.th, width: '24%', textAlign: 'center' }}>Calificación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rankingCalculado.map((prov, index) => {
                                                const pct = prov.puntaje_evaluado || 0;
                                                const badgeBg = pct > 90 ? '#dcfce7' : pct >= 75 ? '#fef3c7' : '#fee2e2';
                                                const badgeFg = pct > 90 ? '#15803d' : pct >= 75 ? '#b45309' : '#dc2626';
                                                const badgeBorder = pct > 90 ? '#bbf7d0' : pct >= 75 ? '#fde68a' : '#fecaca';
                                                const barColor = pct > 90 ? colors.success : pct >= 75 ? '#d97706' : colors.danger;

                                                const isTop1 = index === 0;
                                                const isTop2 = index === 1;
                                                const isTop3 = index === 2;

                                                return (
                                                    <tr key={prov.proveedor_id || index} style={{
                                                        background: isTop1 ? '#fffdf5' : isTop2 ? '#fbfcfe' : isTop3 ? '#fffaf5' : '#ffffff',
                                                        borderBottom: '1px solid #f1f5f9'
                                                    }}>
                                                        <td style={{ ...styles.td, textAlign: 'center', fontWeight: 800 }}>
                                                            {index < 3 ? (
                                                                <span style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: 28,
                                                                    height: 28,
                                                                    borderRadius: '6px',
                                                                    background: isTop1 ? '#fef3c7' : isTop2 ? '#f1f5f9' : '#ffedd5',
                                                                    border: `1px solid ${isTop1 ? '#fde68a' : isTop2 ? '#cbd5e1' : '#fed7aa'}`,
                                                                    color: isTop1 ? '#d97706' : isTop2 ? '#475569' : '#c2410c',
                                                                    fontSize: '12px',
                                                                    fontWeight: 800
                                                                }}>
                                                                    {index + 1}º
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: colors.textMuted }}>{index + 1}º</span>
                                                            )}
                                                        </td>
                                                        <td style={{ ...styles.td }}>
                                                            <strong style={{ fontSize: '13.5px', color: colors.text }}>
                                                                {prov.proveedor_nombre}
                                                            </strong>
                                                        </td>
                                                        <td style={{ ...styles.td, fontSize: '13px', color: colors.textMuted }}>
                                                            {prov.nro_documento || 'S/N'}
                                                        </td>
                                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                                            <span style={{ background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                                                {obtenerDescripcionRegimen(prov.regimen_tributario, prov.descripcion_regimen_tributario)}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...styles.td }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', height: '8px' }}>
                                                                    <div style={{
                                                                        width: `${Math.min(pct, 100)}%`,
                                                                        background: barColor,
                                                                        height: '100%',
                                                                        borderRadius: '999px'
                                                                    }}></div>
                                                                </div>
                                                                <span style={{
                                                                    ...styles.badge(badgeBg, badgeFg),
                                                                    border: `1px solid ${badgeBorder}`,
                                                                    padding: '2px 8px',
                                                                    fontSize: '12px',
                                                                    fontWeight: 800,
                                                                    minWidth: '45px',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    {pct}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer del Modal */}
                        <div style={{
                            padding: '14px 26px',
                            borderTop: `1px solid ${colors.border}`,
                            background: '#f8fafc',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '13px', color: colors.textMuted }}>
                                Total: <strong>{rankingCalculado.length}</strong> proveedores evaluados
                            </span>
                            <button
                                type="button"
                                onClick={() => setModalRankingOpen(false)}
                                style={{
                                    background: colors.primary,
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 20px',
                                    fontSize: '13.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: DETALLE DE ALERTAS / ATENCIÓN ────────────────────────── */}
            {modalAlertaDetalle && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(3px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        maxWidth: '900px',
                        width: '100%',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }}>
                        {/* Header del Modal */}
                        <div style={{
                            padding: '20px 26px',
                            borderBottom: `1px solid ${colors.border}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: modalAlertaDetalle === 'NO_RECOMENDADOS' ? '#FEF2F2' : modalAlertaDetalle === 'POR_VENCER' ? '#FFFBEB' : '#EFF6FF'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '8px',
                                    background: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: modalAlertaDetalle === 'NO_RECOMENDADOS' ? '#dc2626' : modalAlertaDetalle === 'POR_VENCER' ? '#d97706' : '#2563eb',
                                    border: `1px solid ${modalAlertaDetalle === 'NO_RECOMENDADOS' ? '#fecaca' : modalAlertaDetalle === 'POR_VENCER' ? '#fde68a' : '#bfdbfe'}`
                                }}>
                                    {modalAlertaDetalle === 'NO_RECOMENDADOS' && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="15" y1="9" x2="9" y2="15"></line>
                                            <line x1="9" y1="9" x2="15" y2="15"></line>
                                        </svg>
                                    )}
                                    {modalAlertaDetalle === 'POR_VENCER' && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                    )}
                                    {modalAlertaDetalle === 'INCOMPLETOS' && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="9" y1="15" x2="15" y2="15"></line>
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '17px',
                                        fontWeight: 800,
                                        color: modalAlertaDetalle === 'NO_RECOMENDADOS' ? '#991b1b' : modalAlertaDetalle === 'POR_VENCER' ? '#92400e' : '#1e40af'
                                    }}>
                                        {modalAlertaDetalle === 'NO_RECOMENDADOS' && 'Proveedores No Recomendados (Calificación < 75%)'}
                                        {modalAlertaDetalle === 'POR_VENCER' && 'Documentos por Vencer en Menos de 15 Días'}
                                        {modalAlertaDetalle === 'INCOMPLETOS' && 'Proveedores con Llenado Incompleto de Documentos'}
                                    </h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: colors.textMuted }}>
                                        {modalAlertaDetalle === 'NO_RECOMENDADOS' && 'Listado de proveedores que requieren regularización para alcanzar el estándar mínimo.'}
                                        {modalAlertaDetalle === 'POR_VENCER' && 'Documentos activos cuya vigencia caduca en los próximos 15 días.'}
                                        {modalAlertaDetalle === 'INCOMPLETOS' && 'Proveedores que aún no han completado el 100% de la carga de documentos exigibles.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalAlertaDetalle(null)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: colors.textMuted,
                                    cursor: 'pointer',
                                    padding: '6px',
                                    borderRadius: '6px'
                                }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Cuerpo del Modal */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 26px' }}>
                            {modalAlertaDetalle === 'NO_RECOMENDADOS' && (
                                alertasCalculadas.noRecomendadosList.length === 0 ? (
                                    <div style={{ ...styles.emptyState, padding: '40px 16px' }}>
                                        No hay proveedores no recomendados con los filtros activos.
                                    </div>
                                ) : (
                                    <div className="table-scroll">
                                        <table style={{ ...styles.table, marginTop: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ ...styles.th, width: '42%' }}>Proveedor</th>
                                                    <th style={{ ...styles.th, width: '18%' }}>RUC</th>
                                                    <th style={{ ...styles.th, width: '20%', textAlign: 'center' }}>Régimen</th>
                                                    <th style={{ ...styles.th, width: '20%', textAlign: 'center' }}>Calificación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alertasCalculadas.noRecomendadosList.map((prov, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ ...styles.td }}>
                                                            <strong style={{ fontSize: '13.5px' }}>{prov.proveedor_nombre}</strong>
                                                        </td>
                                                        <td style={{ ...styles.td, color: colors.textMuted, fontSize: '13px' }}>
                                                            {prov.nro_documento || 'S/N'}
                                                        </td>
                                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                                            <span style={{ background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                                                {obtenerDescripcionRegimen(prov.regimen_tributario, prov.descripcion_regimen_tributario)}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                                            <span style={{ ...styles.badge('#fee2e2', '#dc2626'), border: '1px solid #fecaca', padding: '3px 10px', fontSize: '12.5px', fontWeight: 800 }}>
                                                                {prov.puntaje_evaluado || 0}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}

                            {modalAlertaDetalle === 'POR_VENCER' && (
                                alertasCalculadas.porVencerList.length === 0 ? (
                                    <div style={{ ...styles.emptyState, padding: '40px 16px' }}>
                                        No existen documentos próximos a vencer en menos de 15 días.
                                    </div>
                                ) : (
                                    <div className="table-scroll">
                                        <table style={{ ...styles.table, marginTop: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ ...styles.th, width: '30%' }}>Proveedor</th>
                                                    <th style={{ ...styles.th, width: '20%' }}>Gestión</th>
                                                    <th style={{ ...styles.th, width: '25%' }}>Tipo Documento</th>
                                                    <th style={{ ...styles.th, width: '13%', textAlign: 'center' }}>Vencimiento</th>
                                                    <th style={{ ...styles.th, width: '12%', textAlign: 'center' }}>Urgencia</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alertasCalculadas.porVencerList.map((doc, index) => {
                                                    const dias = Number(doc.dias_restantes);
                                                    const urg = urgencia(dias >= 0 ? dias : 0);
                                                    return (
                                                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ ...styles.td }}>
                                                                <strong style={{ fontSize: '13px' }}>{doc.proveedor_nombre}</strong>
                                                                <div style={{ fontSize: '11.5px', color: colors.textMuted }}>Doc: {doc.nro_documento || 'S/N'}</div>
                                                            </td>
                                                            <td style={{ ...styles.td }}>
                                                                <span style={{ background: '#eff6ff', color: colors.primary, padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                                                                    {doc.gestion_nombre || doc.alcance}
                                                                </span>
                                                            </td>
                                                            <td style={{ ...styles.td, fontSize: '13px' }}>
                                                                {DOC_DESCRIPCIONES_DASHBOARD[doc.alcance]?.[String(doc.tipo_documento_id).padStart(2, '0')] || `Documento ${doc.tipo_documento_id}`}
                                                            </td>
                                                            <td style={{ ...styles.td, textAlign: 'center', fontSize: '13px' }}>
                                                                {formatearFechaLocal(doc.fecha_vigencia)}
                                                            </td>
                                                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                                                <span style={{ ...styles.badge(urg.bg, urg.fg), padding: '3px 8px', fontSize: '11.5px', fontWeight: 700 }}>
                                                                    {urg.label}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}

                            {modalAlertaDetalle === 'INCOMPLETOS' && (
                                alertasCalculadas.incompletosList.length === 0 ? (
                                    <div style={{ ...styles.emptyState, padding: '40px 16px' }}>
                                        Todos los proveedores han completado la carga de sus documentos exigibles.
                                    </div>
                                ) : (
                                    <div className="table-scroll">
                                        <table style={{ ...styles.table, marginTop: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ ...styles.th, width: '42%' }}>Proveedor</th>
                                                    <th style={{ ...styles.th, width: '18%' }}>RUC</th>
                                                    <th style={{ ...styles.th, width: '22%', textAlign: 'center' }}>Tipo Régimen</th>
                                                    <th style={{ ...styles.th, width: '18%', textAlign: 'center' }}>Pendientes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alertasCalculadas.incompletosList.map((prov, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ ...styles.td }}>
                                                            <strong style={{ fontSize: '13.5px' }}>{prov.proveedor_nombre}</strong>
                                                        </td>
                                                        <td style={{ ...styles.td, color: colors.textMuted, fontSize: '13px' }}>
                                                            {prov.nro_documento || 'S/N'}
                                                        </td>
                                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                                            <span style={{ background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                                                {obtenerDescripcionRegimen(prov.regimen_tributario, prov.descripcion_regimen_tributario)}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                                            <span style={{ ...styles.badge('#fee2e2', '#dc2626'), padding: '3px 10px', fontSize: '12px', fontWeight: 800 }}>
                                                                {prov.pendientes_evaluados} faltante{prov.pendientes_evaluados === 1 ? '' : 's'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Footer del Modal */}
                        <div style={{
                            padding: '14px 26px',
                            borderTop: `1px solid ${colors.border}`,
                            background: '#f8fafc',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                        }}>
                            <button
                                type="button"
                                onClick={() => setModalAlertaDetalle(null)}
                                style={{
                                    background: colors.primary,
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 20px',
                                    fontSize: '13.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mostrarConstruccion && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '30px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: '#fef3c7',
                            color: '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                            </svg>
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700', color: colors.text }}>
                            Página en Construcción
                        </h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: colors.textMuted, lineHeight: '1.5' }}>
                            Esta página se encuentra en construcción. Estamos trabajando para brindarle una mejor experiencia comercial.
                        </p>
                        <button
                            onClick={() => setMostrarConstruccion(false)}
                            style={{
                                background: colors.primary,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 24px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
                            onMouseOut={(e) => e.target.style.background = colors.primary}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}