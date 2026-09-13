import { useState } from 'react';

import MainLayout from '../layouts/MainLayout';

import {
    obtenerReporteDocumentos
} from '../services/reportes.service';

import {
    exportarExcel
} from '../utils/exportExcel';

const formatFecha = (fecha) => {

    if (!fecha) {
        return '';
    }

    const valor = String(fecha).substring(0, 10);

    const [yyyy, mm, dd] = valor.split('-');

    if (!yyyy || !mm || !dd) {
        return fecha;
    }

    return `${dd}/${mm}/${yyyy}`;
};


const formatFechaHora = (fecha) => {

    if (!fecha) {
        return '';
    }

    const valor = String(fecha);

    const fechaParte = valor.substring(0, 10);

    const horaParte = valor.substring(11, 19);

    const [yyyy, mm, dd] = fechaParte.split('-');

    if (!yyyy || !mm || !dd) {
        return fecha;
    }

    return `${dd}/${mm}/${yyyy} ${horaParte}`;
};


const styles = {

    page: {
        width: '100%',
    },

    card: {
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },

    title: {
        fontSize: '22px',
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 24px 0',
    },

    filters: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '24px',
    },

    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },

    label: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#374151',
    },

    input: {
        height: '40px',
        minWidth: '180px',
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#111827',
        background: '#ffffff',
        boxSizing: 'border-box',
    },

    select: {
        height: '40px',
        minWidth: '160px',
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#111827',
        background: '#ffffff',
        boxSizing: 'border-box',
    },

    button: {
        height: '40px',
        padding: '8px 18px',
        border: 'none',
        borderRadius: '8px',
        background: '#2563eb',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
    },

    buttonDisabled: {
        background: '#93c5fd',
        cursor: 'not-allowed',
    },

    error: {
        marginBottom: '20px',
        padding: '12px 16px',
        borderRadius: '8px',
        background: '#fee2e2',
        color: '#b91c1c',
        fontSize: '14px',
    },

    info: {
        marginBottom: '20px',
        padding: '12px 16px',
        borderRadius: '8px',
        background: '#eff6ff',
        color: '#1d4ed8',
        fontSize: '14px',
    },

    executionCard: {
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        marginBottom: '18px',
        overflow: 'hidden',
    },

    executionHeader: {
        background: '#f9fafb',
        padding: '16px',
    },

    executionTitle: {
        fontSize: '15px',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '14px',
    },

    headerGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
        gap: '14px',
    },

    headerItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },

    headerLabel: {
        fontSize: '11px',
        fontWeight: 700,
        color: '#6b7280',
        textTransform: 'uppercase',
    },

    headerValue: {
        fontSize: '14px',
        color: '#111827',
    },

    status: {
        display: 'inline-block',
        width: 'fit-content',
        padding: '4px 10px',
        borderRadius: '999px',
        background: '#d1fae5',
        color: '#047857',
        fontSize: '12px',
        fontWeight: 700,
    },

    detailSection: {
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
    },

    detailTitle: {
        fontSize: '14px',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '12px',
    },

    tableContainer: {
        width: '100%',
        overflowX: 'auto',
    },

    table: {
        width: '100%',
        minWidth: '950px',
        borderCollapse: 'collapse',
    },

    th: {
        textAlign: 'left',
        padding: '10px 12px',
        fontSize: '12px',
        fontWeight: 700,
        color: '#6b7280',
        background: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        whiteSpace: 'nowrap',
    },

    td: {
        padding: '10px 12px',
        fontSize: '13px',
        color: '#111827',
        borderBottom: '1px solid #e5e7eb',
        verticalAlign: 'top',
    },

    stateActual: {
        display: 'inline-block',
        padding: '4px 9px',
        borderRadius: '999px',
        background: '#fee2e2',
        color: '#b91c1c',
        fontSize: '11px',
        fontWeight: 700,
    },

    stateAnterior: {
        display: 'inline-block',
        padding: '4px 9px',
        borderRadius: '999px',
        background: '#d1fae5',
        color: '#047857',
        fontSize: '11px',
        fontWeight: 700,
    },

    emptyDetail: {
        fontSize: '13px',
        color: '#6b7280',
        margin: 0,
    },

    emptyResult: {
        padding: '30px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px',
        border: '1px dashed #d1d5db',
        borderRadius: '8px',
    },

};


export default function ReportsPage() {

    const [fechaEjecucion, setFechaEjecucion] =
        useState('');

    const [incluirDetalle, setIncluirDetalle] =
        useState('N');
    
    const [estado, setEstado] =
        useState('ALL');

    const [resultado, setResultado] =
        useState([]);

    const [cargando, setCargando] =
        useState(false);

    const [error, setError] =
        useState('');


    const generarReporte = async () => {

        if (!fechaEjecucion) {

            setError(
                'Debe seleccionar la fecha de ejecución.'
            );

            setResultado([]);

            return;
        }


        try {

            setCargando(true);

            setError('');

            const data =
                await obtenerReporteDocumentos(
                    fechaEjecucion,
                    estado,
                    incluirDetalle
                );


            setResultado(
                data.data || []
            );

        }
        catch (err) {

            console.error(
                'Error al generar reporte:',
                err
            );

            setResultado([]);

            setError(
                err.response?.data?.message ||
                'No fue posible generar el reporte.'
            );

        }
        finally {

            setCargando(false);

        }

    };
    
     const exportarReporteExcel = () => {

    const columnas = [

        {
            titulo: 'ID EJECUCIÓN',
            campo: 'id_ejecucion',
            ancho: 15
        },

        {
            titulo: 'FECHA EJECUCIÓN',
            campo: 'fecha_ejecucion',
            ancho: 18
        },

        {
            titulo: 'TIPO EJECUCIÓN',
            campo: 'tipo_ejecucion',
            ancho: 18
        },

        {
            titulo: 'USUARIO',
            campo: 'usuario',
            ancho: 20
        },

        {
            titulo: 'FECHA INICIO',
            campo: 'fecha_inicio',
            ancho: 22
        },

        {
            titulo: 'FECHA FIN',
            campo: 'fecha_fin',
            ancho: 22
        },

        {
            titulo: 'ESTADO',
            campo: 'estado_ejecucion',
            ancho: 15
        },

        {
            titulo: 'DOCUMENTOS EVALUADOS',
            campo: 'total_evaluados',
            ancho: 22
        },

        {
            titulo: 'DOCUMENTOS ACTUALIZADOS',
            campo: 'total_actualizados',
            ancho: 25
        }

    ];


    /*
     * Si el usuario solicita detalle,
     * agregamos las columnas correspondientes.
     */
    if (incluirDetalle === 'S') {

        columnas.push(

            {
                titulo: 'PROVEEDOR',
                campo: 'proveedor',
                ancho: 30
            },

            {
                titulo: 'GRUPO DOCUMENTO',
                campo: 'grupo_documentos',
                ancho: 25
            },

            {
                titulo: 'ALCANCE',
                campo: 'alcance',
                ancho: 20
            },

            {
                titulo: 'TIPO DOCUMENTO',
                campo: 'tipo_documento',
                ancho: 45
            },

            {
                titulo: 'FECHA VIGENCIA',
                campo: 'fecha_vigencia',
                ancho: 18
            },

            {
                titulo: 'ESTADO ACTUAL',
                campo: 'estado_actual',
                ancho: 18
            },

            {
                titulo: 'ESTADO ANTERIOR',
                campo: 'estado_anterior',
                ancho: 18
            }

        );

    }


    /*
     * Construcción de los datos para Excel.
     *
     * Cuando NO se incluye detalle:
     *   una fila por ejecución.
     *
     * Cuando SÍ se incluye detalle:
     *   una fila por documento afectado.
     */
    const datos = [];


    resultado.forEach(
        (ejecucion) => {

            const datosCabecera = {

                id_ejecucion:
                    ejecucion.id_ejecucion,

                fecha_ejecucion:
                    formatFecha(
                        ejecucion.fecha_inicio
                    ),

                tipo_ejecucion:
                    ejecucion.tipo_ejecucion,

                usuario:
                    ejecucion.usuario,

                fecha_inicio:
                    formatFechaHora(
                        ejecucion.fecha_inicio
                    ),

                fecha_fin:
                    formatFechaHora(
                        ejecucion.fecha_fin
                    ),

                estado_ejecucion:
                    ejecucion.estado_ejecucion,

                total_evaluados:
                    ejecucion.total_evaluados,

                total_actualizados:
                    ejecucion.total_actualizados

            };


            /*
             * Exportación SIN detalle.
             */
            if (incluirDetalle !== 'S') {

                datos.push(
                    datosCabecera
                );

                return;

            }


            /*
             * Exportación CON detalle.
             *
             * Una ejecución puede tener uno o
             * varios documentos afectados.
             */
            if (
                ejecucion.detalle &&
                ejecucion.detalle.length > 0
            ) {

                ejecucion.detalle.forEach(
                    (detalle) => {

                        datos.push({

                            ...datosCabecera,

                            proveedor:
                                detalle.proveedor || '',

                            grupo_documentos:
                                detalle.grupo_documentos || '',

                            alcance:
                                detalle.alcance || '',

                            tipo_documento:
                                detalle.tipo_documento || '',

                            fecha_vigencia:
                                formatFecha(
                                    detalle.fecha_vigencia
                                ),

                            estado_actual:
                                detalle.estado_actual || '',

                            estado_anterior:
                                detalle.estado_anterior || ''

                        });

                    }
                );

            }
            else {

                /*
                 * La ejecución no tiene documentos
                 * afectados. Se conserva la ejecución
                 * en el reporte y las columnas de
                 * detalle quedan vacías.
                 */
                datos.push({

                    ...datosCabecera,

                    proveedor: '',

                    grupo_documentos: '',

                    alcance: '',

                    tipo_documento: '',

                    fecha_vigencia: '',

                    estado_actual: '',

                    estado_anterior: ''

                });

            }

        }
    );


    exportarExcel({

        nombreArchivo:
            'Reporte_Documentos',

        nombreHoja:
            incluirDetalle === 'S'
                ? 'Ejecuciones_Detalle'
                : 'Ejecuciones',

        titulo:
            'Reporte de Documentos',

        subtitulo:
            `Fecha de Ejecución: ${formatFecha(
                fechaEjecucion
            )}`,

        columnas,

        datos

    });

};  

    return (

        <MainLayout>

            <div style={styles.page}>

                <div style={styles.card}>

                    <h1 style={styles.title}>
                        Reporte de Documentos
                    </h1>


                    <div style={styles.filters}>

                        <div style={styles.field}>

                            <label style={styles.label}>
                                Fecha de Ejecución
                            </label>

                            <input
                                type="date"
                                value={fechaEjecucion}
                                onChange={(e) =>
                                    setFechaEjecucion(
                                        e.target.value
                                    )
                                }
                                style={styles.input}
                            />

                        </div>

                         <div style={styles.field}>

    <label style={styles.label}>
        Estado
    </label>

    <select
        value={estado}
        onChange={(e) =>
            setEstado(e.target.value)
        }
        style={styles.select}
    >

        <option value="ALL">
            Todos
        </option>

        <option value="OK">
            Ejecutados Correctamente
        </option>

        <option value="ERROR">
            Ejecutados con Errores
        </option>

    </select>

</div>           

                        <div style={styles.field}>

                            <label style={styles.label}>
                                Incluir Detalle
                            </label>

                            <select
                                value={incluirDetalle}
                                onChange={(e) =>
                                    setIncluirDetalle(
                                        e.target.value
                                    )
                                }
                                style={styles.select}
                            >

                                <option value="N">
                                    N - No
                                </option>

                                <option value="S">
                                    S - Sí
                                </option>

                            </select>

                        </div>


                        <button
                            type="button"
                            onClick={generarReporte}
                            disabled={cargando}
                            style={{
                                ...styles.button,
                                ...(cargando
                                    ? styles.buttonDisabled
                                    : {})
                            }}
                        >

                            {cargando
                                ? 'Generando...'
                                : 'Generar Reporte'}

                        </button>

                    </div>


                    {error && (

                        <div style={styles.error}>
                            {error}
                        </div>

                    )}


                    {resultado.length > 0 && (

                        <div style={styles.info}>

                            Se encontraron{' '}
                            <strong>
                                {resultado.length}
                            </strong>{' '}
                            ejecuciones para la fecha
                            seleccionada.

                        </div>

                    )}

                    {resultado.length > 0 && (

    <div
        style={{
            marginBottom: '16px'
        }}
    >

        <button
            type="button"
            onClick={exportarReporteExcel}
            style={styles.button}
        >
            Exportar Excel
        </button>

    </div>

)}


                    {resultado.length === 0 &&
                        !cargando &&
                        !error && (

                            <div style={styles.emptyResult}>
                                Seleccione una fecha y genere
                                el reporte.
                            </div>

                        )}


                    {resultado.map(
                        (ejecucion) => (

                            <div
                                key={ejecucion.id_ejecucion}
                                style={styles.executionCard}
                            >

                                <div
                                    style={
                                        styles.executionHeader
                                    }
                                >

                                    <div
                                        style={
                                            styles.executionTitle
                                        }
                                    >
                                        Ejecución #
                                        {ejecucion.id_ejecucion}
                                    </div>


                                    <div
                                        style={
                                            styles.headerGrid
                                        }
                                    >

                                        <div
                                            style={
                                                styles.headerItem
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.headerLabel
                                                }
                                            >
                                                ID EJECUCIÓN
                                            </span>

                                            <span
                                                style={
                                                    styles.headerValue
                                                }
                                            >
                                                {
                                                    ejecucion
                                                        .id_ejecucion
                                                }
                                            </span>
                                        </div>


                                        <div
                                            style={
                                                styles.headerItem
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.headerLabel
                                                }
                                            >
                                                FECHA EJECUCIÓN
                                            </span>

                                            <span
                                                style={
                                                    styles.headerValue
                                                }
                                            >
                                                {
                                                    formatFecha(
                                                        ejecucion
                                                            .fecha_inicio
                                                    )
                                                }
                                            </span>
                                        </div>


                                        <div
                                            style={
                                                styles.headerItem
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.headerLabel
                                                }
                                            >
                                                TIPO EJECUCIÓN
                                            </span>

                                            <span
                                                style={
                                                    styles.headerValue
                                                }
                                            >
                                                {
                                                    ejecucion
                                                        .tipo_ejecucion
                                                }
                                            </span>
                                        </div>


                                        <div
                                            style={
                                                styles.headerItem
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.headerLabel
                                                }
                                            >
                                                USUARIO
                                            </span>

                                            <span
                                                style={
                                                    styles.headerValue
                                                }
                                            >
                                                {
                                                    ejecucion
                                                        .usuario
                                                }
                                            </span>
                                        </div>


                                        <div
                                            style={
                                                styles.headerItem
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.headerLabel
                                                }
                                            >
                                                FECHA INICIO
                                            </span>

                                            <span
                                                style={
                                                    styles.headerValue
                                                }
                                            >
                                                {
                                                    formatFechaHora(
                                                        ejecucion
                                                            .fecha_inicio
                                                    )
                                                }
                                            </span>
                                        </div>


                                        <div
                                            style={
                                                styles.headerItem
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.headerLabel
                                                }
                                            >
                                                FECHA FIN
                                            </span>

                                            <span
                                                style={
                                                    styles.headerValue
                                                }
                                            >
                                                {
                                                    formatFechaHora(
                                                        ejecucion
                                                            .fecha_fin
                                                    )
                                                }
                                            </span>
                                        </div>


                                        <div
                                            style={
                                                styles.headerItem
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.headerLabel
                                                }
                                            >
                                                ESTADO
                                            </span>

                                            <span
                                                style={
                                                    styles.status
                                                }
                                            >
                                                {
                                                    ejecucion
                                                        .estado_ejecucion
                                                }
                                            </span>
                                        </div>


                                        <div
                                            style={
                                                styles.headerItem
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.headerLabel
                                                }
                                            >
                                                DOCUMENTOS EVALUADOS
                                            </span>

                                            <span
                                                style={
                                                    styles.headerValue
                                                }
                                            >
                                                {
                                                    ejecucion
                                                        .total_evaluados
                                                }
                                            </span>
                                        </div>


                                        <div
                                            style={
                                                styles.headerItem
                                            }
                                        >
                                            <span
                                                style={
                                                    styles.headerLabel
                                                }
                                            >
                                                DOCUMENTOS ACTUALIZADOS
                                            </span>

                                            <span
                                                style={
                                                    styles.headerValue
                                                }
                                            >
                                                {
                                                    ejecucion
                                                        .total_actualizados
                                                }
                                            </span>
                                        </div>

                                    </div>

                                </div>


                                {incluirDetalle === 'S' && (

                                    <div
                                        style={
                                            styles.detailSection
                                        }
                                    >

                                        <div
                                            style={
                                                styles.detailTitle
                                            }
                                        >
                                            Detalle de documentos
                                        </div>


                                        {ejecucion.detalle &&
                                            ejecucion.detalle.length > 0 ? (

                                            <div
                                                style={
                                                    styles.tableContainer
                                                }
                                            >

                                                <table
                                                    style={
                                                        styles.table
                                                    }
                                                >

                                                    <thead>

                                                        <tr>

                                                            <th
                                                                style={
                                                                    styles.th
                                                                }
                                                            >
                                                                PROVEEDOR
                                                            </th>

                                                            <th
                                                                style={
                                                                    styles.th
                                                                }
                                                            >
                                                                GRUPO DOCUMENTO
                                                            </th>

                                                            <th
                                                                style={
                                                                    styles.th
                                                                }
                                                            >
                                                                ALCANCE
                                                            </th>

                                                            <th
                                                                style={
                                                                    styles.th
                                                                }
                                                            >
                                                                TIPO DOCUMENTO
                                                            </th>

                                                            <th
                                                                style={
                                                                    styles.th
                                                                }
                                                            >
                                                                FECHA VIGENCIA
                                                            </th>

                                                            <th
                                                                style={
                                                                    styles.th
                                                                }
                                                            >
                                                                ESTADO ACTUAL
                                                            </th>

                                                            <th
                                                                style={
                                                                    styles.th
                                                                }
                                                            >
                                                                ESTADO ANTERIOR
                                                            </th>

                                                        </tr>

                                                    </thead>


                                                    <tbody>

                                                        {ejecucion.detalle.map(
                                                            (
                                                                detalle,
                                                                index
                                                            ) => (

                                                                <tr
                                                                    key={`${ejecucion.id_ejecucion}-${index}`}
                                                                >

                                                                    <td
                                                                        style={
                                                                            styles.td
                                                                        }
                                                                    >
                                                                        {
                                                                            detalle.proveedor
                                                                        }
                                                                    </td>

                                                                    <td
                                                                        style={
                                                                            styles.td
                                                                        }
                                                                    >
                                                                        {
                                                                            detalle.grupo_documentos
                                                                        }
                                                                    </td>

                                                                    <td
                                                                        style={
                                                                            styles.td
                                                                        }
                                                                    >
                                                                        {
                                                                            detalle.alcance
                                                                        }
                                                                    </td>

                                                                    <td
                                                                        style={
                                                                            styles.td
                                                                        }
                                                                    >
                                                                        {
                                                                            detalle.tipo_documento
                                                                        }
                                                                    </td>

                                                                    <td
                                                                        style={
                                                                            styles.td
                                                                        }
                                                                    >
                                                                        {
                                                                            formatFecha(
                                                                                detalle.fecha_vigencia
                                                                            )
                                                                        }
                                                                    </td>

                                                                    <td
                                                                        style={
                                                                            styles.td
                                                                        }
                                                                    >
                                                                        <span
                                                                            style={
                                                                                styles.stateActual
                                                                            }
                                                                        >
                                                                            {
                                                                                detalle.estado_actual
                                                                            }
                                                                        </span>
                                                                    </td>

                                                                    <td
                                                                        style={
                                                                            styles.td
                                                                        }
                                                                    >
                                                                        <span
                                                                            style={
                                                                                styles.stateAnterior
                                                                            }
                                                                        >
                                                                            {
                                                                                detalle.estado_anterior
                                                                            }
                                                                        </span>
                                                                    </td>

                                                                </tr>

                                                            )
                                                        )}

                                                    </tbody>

                                                </table>

                                            </div>

                                        ) : (

                                            <p
                                                style={
                                                    styles.emptyDetail
                                                }
                                            >
                                                No se encontraron
                                                documentos afectados
                                                en esta ejecución.
                                            </p>

                                        )}

                                    </div>

                                )}

                            </div>

                        )
                    )}

                </div>

            </div>

        </MainLayout>

    );

}