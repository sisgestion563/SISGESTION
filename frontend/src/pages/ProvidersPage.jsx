import {
    useEffect,
    useState
}
from 'react';

import MainLayout
from '../layouts/MainLayout';

import {
    obtenerProveedores
}
from '../services/providers.service';

import ModalProveedor
from '../components/ModalProveedor';

import ModalVerProveedor
from '../components/ModalVerProveedor';

import {
    obtenerProveedorPorId
}
from '../services/providers.service';

// Misma paleta usada en Documentos y Dashboard
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
    searchWrap: {
        position: 'relative',
        width: '100%',
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
    emptyState: {
        padding: '32px 16px',
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: '14px',
    },
};

const responsiveCSS = `
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
`;

export default function ProvidersPage(){

    const [
        proveedores,
        setProveedores
    ] = useState([]);

    const [
        filtro,
        setFiltro
    ] = useState('');

    useEffect(() => {

        cargarProveedores();

    }, []);

    const cargarProveedores =
    async () => {

        try {

            const data =
                await obtenerProveedores();

            setProveedores(data);

        }
        catch(error){

            console.error(error);

        }

    };

    const proveedoresFiltrados =
    proveedores.filter(
        item =>
            (
                item.proveedor || ''
            )
            .toLowerCase()
            .includes(
                filtro.toLowerCase()
            )
    );

	const [
    modalVisible,
    setModalVisible
] = useState(false);

const [
    modalConsultaVisible,
    setModalConsultaVisible
] = useState(false);

const [
    proveedorSeleccionado,
    setProveedorSeleccionado
] = useState(null);

const consultarProveedor =
async (proveedorId) => {

    try {

        const data =
            await obtenerProveedorPorId(
                proveedorId
            );

        setProveedorSeleccionado(
            data
        );

        setModalConsultaVisible(
            true
        );

    }
    catch(error){

        console.error(error);

    }

};



const [
    proveedorEditar,
    setProveedorEditar
] = useState(null);

const editarProveedor =
async (proveedorId) => {

    try {

        const data =
            await obtenerProveedorPorId(
                proveedorId
            );

        setProveedorEditar(
            data
        );

        setModalVisible(
            true
        );

    }
    catch(error){

        console.error(error);

    }

};

    return (

        <MainLayout>

            <style>{responsiveCSS}</style>

            <h1 style={styles.heading}>
                Proveedores
            </h1>

            <div style={{...styles.card, marginTop:'20px'}}>

                <div style={styles.toolbarRow}>

                    <div className="toolbar-section" style={styles.toolbarSection}>

                        <p style={styles.toolbarLabel}>Búsqueda</p>

                        <div style={styles.searchWrap}>
                            <input
                                type="text"
                                placeholder="Buscar Razón Social..."
                                value={filtro}
                                onChange={
                                    (e)=>
                                    setFiltro(
                                        e.target.value
                                    )
                                }
                                style={styles.searchInput}
                            />
                        </div>

                    </div>

                    <div className="toolbar-divider" style={styles.toolbarDivider} />

                    <div className="toolbar-section" style={styles.toolbarSection}>

                        <p style={styles.toolbarLabel}>Nuevo Registro</p>

                        <button
                            style={{...styles.btnPrimary, alignSelf:'flex-start'}}
                            onClick={() => {

                                setModalVisible(true);

                            }}
                        >
                            + Nuevo Proveedor
                        </button>

                    </div>

                </div>

            </div>

            <div style={{...styles.card, marginTop:'20px', padding:0}}>

              <div className="table-scroll">

                <table style={styles.table}>

                    <thead>

                        <tr>

                             <th style={styles.th}>
                                Tipo Documento
                            </th>

                             <th style={styles.th}>
                                Nro Documento
                            </th>

                             <th style={styles.th}>
                                Razón Social
                            </th>
							<th style={styles.th}>Actividad Económica</th>

							<th style={styles.th}>
								Estado Documentos
							</th>

                             <th style={styles.th}>
                                Estado
                            </th>

							<th style={styles.th}>
                                Acciones
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                    {
                        proveedoresFiltrados.length === 0 ? (

                            <tr>
                                <td colSpan={7} style={styles.emptyState}>
                                    No se encontraron proveedores.
                                </td>
                            </tr>

                        ) : proveedoresFiltrados.map(
                            item => (

                                <tr
                                    key={
                                        item.proveedor_id
                                    }
                                >

                                    <td style={styles.td}>
								{item.tipo_documento}
							</td>

							<td style={styles.td}>
								{item.nro_documento}
							</td>

							<td style={styles.td}>
								{item.proveedor}
							</td>
							
							<td style={styles.td}>{item.actividad_economica}</td>

							<td style={styles.td}>
								<span style={styles.badge(Number(item.doc_vencidos) === 0)}>
									{Number(item.doc_vencidos) > 0 ? 'VENCIDOS' : 'VIGENTES'}
								</span>
							</td>

							<td style={styles.td}>
								<span style={styles.badge(item.status === 'A')}>
									{item.status === 'A' ? 'ACTIVO' : 'INACTIVO'}
								</span>
							</td>

							<td style={styles.td}>

							<div style={styles.rowActions}>

								<button
									style={styles.linkBtn}
									onClick={() =>
										consultarProveedor(
											item.proveedor_id
										)
									}
								>
									Ver
								</button>

								<button
									style={styles.linkBtnAmber}
									onClick={() =>
										editarProveedor(
											item.proveedor_id
										)
									}
								>
									Editar
								</button>

							</div>

							</td>

                                </tr>

                            )
                        )
                    }

                    </tbody>

                </table>

              </div>

            </div>

			<ModalProveedor
    visible={modalVisible}
    proveedorEditar={
        proveedorEditar
    }
    onClose={() => {

        setModalVisible(false);

        setProveedorEditar(
            null
        );

    }}
    onSuccess={
        cargarProveedores
    }
/>

<ModalVerProveedor

    visible={
        modalConsultaVisible
    }

    proveedor={
        proveedorSeleccionado
    }

    onClose={() =>
        setModalConsultaVisible(
            false
        )
    }

/>

        </MainLayout>

    );

}
