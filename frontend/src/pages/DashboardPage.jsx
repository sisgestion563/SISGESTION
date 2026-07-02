import {
    useEffect,
    useState
} from 'react';

import MainLayout
from '../layouts/MainLayout';


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
}
from '../services/dashboard.service';

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

export default function DashboardPage() {

    const [
        resumen,
        setResumen
    ] = useState(null);

    useEffect(() => {

        cargarDashboard();

    }, []);


	const [
    grupos,
    setGrupos
] = useState([]);

const [
    estados,
    setEstados
] = useState([]);

const [
    proximos,
    setProximos
] = useState([]);




    const cargarDashboard =
async () => {

    try {

        const resumenData =
            await obtenerResumen();

        const gruposData =
            await obtenerDocumentosPorGrupo();

        const estadosData =
            await obtenerDocumentosPorEstado();

        const proximosData =
            await obtenerProximosVencer();

        setResumen(resumenData);

        setGrupos(
    gruposData.map(
        item => ({
            ...item,
            cantidad: Number(item.cantidad)
        })
    )
);

setEstados(
    estadosData.map(
        item => ({
            ...item,
            cantidad: Number(item.cantidad)
        })
    )
);

        setProximos(proximosData);

    }
    catch(error){

        console.error(error);

    }

};

    // Próximos a vencer, ordenados por fecha más cercana primero
    const proximosOrdenados = [...proximos].sort(
        (a, b) => new Date(a.fecha_vigencia) - new Date(b.fecha_vigencia)
    );

    return (

        <MainLayout>

            <h1 style={styles.heading}>
                Dashboard SISGESTION
            </h1>

            {
                resumen && (

                    <div
                        style={{
                            display:'grid',
                            gridTemplateColumns:'repeat(3,1fr)',
                            gap:'20px',
                            marginTop:'30px'
                        }}
                    >

                        <div style={styles.statCard(colors.primary)}>
                            <p style={styles.statLabel}>Proveedores</p>
                            <p style={styles.statValue(colors.text)}>
                                {resumen.total_proveedores}
                            </p>
                        </div>

                        <div style={styles.statCard(colors.success)}>
                            <p style={styles.statLabel}>Documentos Vigentes</p>
                            <p style={styles.statValue(colors.success)}>
                                {resumen.documentos_vigentes}
                            </p>
                        </div>

                        <div style={styles.statCard(colors.danger)}>
                            <p style={styles.statLabel}>Documentos Vencidos</p>
                            <p style={styles.statValue(colors.danger)}>
                                {resumen.documentos_vencidos}
                            </p>
                        </div>

                    </div>

                )
            }

			{
    grupos.length > 0 && (

        <div style={{...styles.card, marginTop:'30px'}}>

            <h2 style={styles.sectionTitle}>
                Documentos por Grupo
            </h2>

            <ResponsiveContainer
                width="100%"
                height={300}
            >

                <BarChart
                    data={grupos}
                >

                    <XAxis
                        dataKey="descripcion"
                        tick={{ fill: colors.textMuted, fontSize: 12 }}
                    />

                    <YAxis
                        tick={{ fill: colors.textMuted, fontSize: 12 }}
                        allowDecimals={false}
                    />

                    <Tooltip />

                    <Bar
                        dataKey="cantidad"
                        fill={colors.primary}
                        radius={[6, 6, 0, 0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    )
}
{
    estados.length > 0 && (

        <div style={{...styles.card, marginTop:'30px'}}>

            <h2 style={styles.sectionTitle}>
                Estado de Documentos
            </h2>

            <div
                style={{
                    display:'flex',
                    justifyContent:'center',
                    alignItems:'center'
                }}
            >

                <ResponsiveContainer
                    width="60%"
                    height={300}
                >

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

                            {
                                estados.map((item, index) => (
                                    <Cell
                                        key={index}
                                        fill={esVigente(item) ? colors.success : colors.danger}
                                    />
                                ))
                            }

                        </Pie>

                        <Tooltip />

                    </PieChart>

                </ResponsiveContainer>

            </div>
        </div>

    )
}

<div style={{...styles.card, marginTop:'30px'}}>

    <h2 style={styles.sectionTitle}>
        Proveedores con documentos próximos a vencer
    </h2>

    {
        proximosOrdenados.length === 0
        ?
        (
            <div style={styles.emptyState}>
                No existen documentos próximos a vencer.
            </div>
        )
        :
        (
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Proveedor</th>
                        <th style={styles.th}>Fecha Vencimiento</th>
                        <th style={styles.th}>Días Restantes</th>
                    </tr>
                </thead>

                <tbody>

                {
                    proximosOrdenados.map(
                        (item,index) => {

                            const dias = Math.ceil(
                                (new Date(item.fecha_vigencia) - new Date()) / 86400000
                            );

                            const u = urgencia(dias);

                            return (
                                <tr key={index}>
                                    <td style={styles.td}>
                                        {item.proveedor}
                                    </td>


                                    <td style={styles.td}>
                                        {new Date(item.fecha_vigencia).toLocaleDateString('es-PE')}
                                    </td>

                                    <td style={styles.td}>
                                        <span style={styles.badge(u.bg, u.fg)}>
                                            {u.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        }
                    )
                }

                </tbody>

            </table>
        )
    }

</div>
        </MainLayout>

    );

}
