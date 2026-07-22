
import {
    useEffect,
    useState
} from 'react';

import MainLayout from '../layouts/MainLayout';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
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
    obtenerProximosVencer
} from '../services/dashboard.service';

// Reutilizamos el servicio para listar los expedientes por grupo corporativo
import { listarPorGrupo } from '../services/documentos.service';

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
    @media (max-width: 900px) {
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
        .stats-grid { grid-template-columns: 1fr; }
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
    'DOC_NOR':        'Gestion SST-MA',
    'DOC_EXT_NOR':    'Gestion de Calidad',
    'DOC_REQ_ESTATAL':'Gestion Seg. Patrimonial',
    'DOC_OTROS':      'Gestion Transporte'
};

export default function DashboardPage() {

    const [resumen, setResumen] = useState(null);
    const [grupos, setGrupos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [proximos, setProximos] = useState([]);
    const [loadingProveedor, setLoadingProveedor] = useState(true);

    // ── Identidad del usuario logueado ──────────────────────────────────────
    const usuarioLogueado = obtenerUsuario();
    const rolCodigo       = usuarioLogueado?.rol_codigo || '';
    const esProveedor     = rolCodigo === 'PROVEEDOR';
    const esConsultor     = rolCodigo === 'CONSULTOR';
    const miProveedorId   = usuarioLogueado?.proveedor_id;

    useEffect(() => {
        if (esProveedor) {
            cargarDashboardProveedor();
        } else {
            // ADMIN y CONSULTOR ven el dashboard general
            cargarDashboardAdmin();
        }
    }, [esProveedor, miProveedorId]);

    // ── Dashboard ADMIN / CONSULTOR ──────────────────────────────────────────
    const cargarDashboardAdmin = async () => {
        try {
            const resumenData  = await obtenerResumen();
            const gruposData   = await obtenerDocumentosPorGrupo();
            const estadosData  = await obtenerDocumentosPorEstado();
            const proximosData = await obtenerProximosVencer();

            setResumen(resumenData);
            setGrupos(gruposData.map(item => ({ ...item, cantidad: Number(item.cantidad) })));
            setEstados(estadosData.map(item => ({ ...item, cantidad: Number(item.cantidad) })));
            setProximos(proximosData);
        } catch (error) {
            console.error(error);
        }
    };

    // ── Dashboard PROVEEDOR (solo sus propios documentos) ────────────────────
    const cargarDashboardProveedor = async () => {
        if (!miProveedorId) {
            setLoadingProveedor(false);
            return;
        }
        try {
            let acumuladoDocs   = [];
            let estadisticaGrupos = [];

            // Consultamos secuencialmente los 4 grupos documentales del proveedor logueado
            for (const grupoCode of CODIGOS_GRUPOS) {
                const dataDocs = await listarPorGrupo(miProveedorId, grupoCode);
                if (dataDocs && dataDocs.length > 0) {
                    acumuladoDocs = [...acumuladoDocs, ...dataDocs];
                    estadisticaGrupos.push({ descripcion: NOMBRES_GRUPOS[grupoCode], cantidad: dataDocs.length });
                } else {
                    estadisticaGrupos.push({ descripcion: NOMBRES_GRUPOS[grupoCode], cantidad: 0 });
                }
            }

            // Separación de documentos por estatus
            const vigentesCount = acumuladoDocs.filter(d => d.estado_documento === 'V').length;
            const vencidosCount = acumuladoDocs.filter(d => d.estado_documento === 'C').length;

            setResumen({
                total_proveedores: 'N/A',
                documentos_vigentes: vigentesCount,
                documentos_vencidos: vencidosCount,
                total_documentos: acumuladoDocs.length
            });

            setGrupos(estadisticaGrupos);

            setEstados([
                { descripcion: 'VIGENTE', cantidad: vigentesCount },
                { descripcion: 'VENCIDO', cantidad: vencidosCount }
            ]);

            // Filtrado de alertas: documentos vigentes próximos a vencer en los siguientes 90 días
            const alertasVencimiento = acumuladoDocs.filter(d => {
                if (d.estado_documento !== 'V') return false;
                const diasRestantes = Math.ceil((new Date(d.fecha_vigencia) - new Date()) / 86400000);
                return diasRestantes > 0 && diasRestantes <= 90;
            }).map(d => ({
                proveedor: d.descripcion_tipo_documento || d.tipo_documento || 'Documento',
                fecha_vigencia: d.fecha_vigencia
            }));

            setProximos(alertasVencimiento);
        } catch (error) {
            console.error("Error consolidando indicadores de proveedor:", error);
        } finally {
            setLoadingProveedor(false);
        }
    };

    // Próximos a vencer, ordenados por fecha más cercana primero
    const proximosOrdenados = [...proximos].sort(
        (a, b) => new Date(a.fecha_vigencia) - new Date(b.fecha_vigencia)
    );

    return (
        <MainLayout>
            <style>{responsiveCSS}</style>

            {/* ── Encabezado dinámico por rol ─────────────────────────────── */}
            <h1 style={styles.heading}>
                {esProveedor
                    ? `Panel de Control - ${usuarioLogueado?.username}`
                    : 'Dashboard SISGESTION'}
            </h1>
            <p style={{ color: colors.textMuted, margin: '5px 0 0 0', fontSize: '14px' }}>
                {esProveedor
                    ? 'Resumen analítico y alertas del estado de vigencia de sus expedientes cargados.'
                    : esConsultor
                        ? 'Vista general del sistema. Acceso de solo lectura para auditorías corporativas.'
                        : 'Vista general del sistema para gestión de auditorías corporativas.'}
            </p>

            {/* ── PROVEEDOR sin ficha → aviso ──────────────────────────────── */}
            {esProveedor && !miProveedorId && !loadingProveedor ? (
                <div style={{ ...styles.card, marginTop: '30px' }}>
                    <div style={styles.emptyState}>
                        Por favor, complete su registro de Ficha Informativa en la sección de Proveedores para activar sus indicadores.
                    </div>
                </div>
            ) : (
                <>
                    {/* ── Tarjetas de estadísticas ─────────────────────────── */}
                    {resumen && (
                        <div className="stats-grid">

                            {/* Primer stat: Proveedores (ADMIN/CONSULTOR) o Total Docs (PROVEEDOR) */}
                            {!esProveedor ? (
                                <div style={styles.statCard(colors.primary)}>
                                    <p style={styles.statLabel}>Proveedores</p>
                                    <p style={styles.statValue(colors.text)}>{resumen.total_proveedores}</p>
                                </div>
                            ) : (
                                <div style={styles.statCard(colors.primary)}>
                                    <p style={styles.statLabel}>Total Documentos Cargados</p>
                                    <p style={styles.statValue(colors.text)}>{resumen.total_documentos}</p>
                                </div>
                            )}

                            <div style={styles.statCard(colors.success)}>
                                <p style={styles.statLabel}>Documentos Vigentes</p>
                                <p style={styles.statValue(colors.success)}>{resumen.documentos_vigentes}</p>
                            </div>

                            <div style={styles.statCard(colors.danger)}>
                                <p style={styles.statLabel}>Documentos Vencidos</p>
                                <p style={styles.statValue(colors.danger)}>{resumen.documentos_vencidos}</p>
                            </div>

                        </div>
                    )}

                    {/* ── Gráfico de barras: documentos por grupo ──────────── */}
                    {grupos.length > 0 && (
                        <div style={{ ...styles.card, marginTop: '30px' }}>
                            <h2 style={styles.sectionTitle}>
                                {esProveedor ? 'Mis Documentos por Grupo' : 'Documentos por Grupo'}
                            </h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={grupos}>
                                    <XAxis
                                        dataKey="descripcion"
                                        tick={{ fill: colors.textMuted, fontSize: 12 }}
                                    />
                                    <YAxis
                                        tick={{ fill: colors.textMuted, fontSize: 12 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="cantidad" fill={colors.primary} radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
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
