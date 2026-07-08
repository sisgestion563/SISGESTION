import {
    useEffect,
    useState
}
from 'react';

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
    background: ok ? '#DCFCE7' : '#FEE2E2',
    color: ok ? '#15803D' : '#DC2626',
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
	
};

const CAMPOS_BUSQUEDA = [

    {
        value: 'ALL',
        label: 'Todos los campos'
    },

    {
        value: 'proveedor',
        label: 'Razón Social'
    },

    {
        value: 'nro_documento',
        label: 'N° Documento'
    },

    {
        value: 'tipo_documento',
        label: 'Tipo Documento'
    },

    {
        value: 'actividad_economica',
        label: 'Actividad Económica'
    },

    {
        value: 'estado_documentos',
        label: 'Estado Documentos'
    },

    {
        value: 'status',
        label: 'Estado'
    }

];


export default function ProvidersPage(){

    const [
        proveedores,
        setProveedores
    ] = useState([]);

    const [
    campoBusqueda,
    setCampoBusqueda
] = useState('ALL');

const [
    valorBusqueda,
    setValorBusqueda
] = useState('');

useEffect(() => {

    const timer = setTimeout(() => {

        cargarProveedores(
            campoBusqueda,
            valorBusqueda
        );

    }, valorBusqueda.trim() === '' ? 0 : 400);

    return () => clearTimeout(timer);

}, [
    campoBusqueda,
    valorBusqueda
]);

   const cargarProveedores =
async (
    campo = 'ALL',
    valor = ''
) => {

    try {

        const data =
            await obtenerProveedores(
                campo,
                valor
            );

        setProveedores(data);

    }
    catch(error){

        console.error(error);

    }

};

   const proveedoresFiltrados =
    proveedores;

    

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

        <>

            <h1 style={styles.heading}>
                Proveedores
            </h1>

            <div style={{...styles.card, marginTop:'20px'}}>

                <div style={styles.toolbarRow}>

                    <div style={styles.toolbarSection}>

                        <p style={styles.toolbarLabel}>Búsqueda</p>



                       <div style={styles.searchControls}>

    <select

        value={campoBusqueda}

        onChange={(e)=>

            setCampoBusqueda(
                e.target.value
            )

        }

        style={styles.searchSelect}

    >

        {

            CAMPOS_BUSQUEDA.map(

                campo => (

                    <option

                        key={campo.value}

                        value={campo.value}

                    >

                        {campo.label}

                    </option>

                )

            )

        }

    </select>

    <input

        type="text"

        placeholder="Ingrese criterio de búsqueda..."

        value={valorBusqueda}

        onChange={(e)=>

            setValorBusqueda(
                e.target.value
            )

        }

        style={styles.searchInput}

    />

</div>
						
						
						
						

                    </div>

                    <div style={styles.toolbarDivider} />

                    <div style={styles.toolbarSection}>

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
                                <td colSpan={5} style={styles.emptyState}>
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
    <span
        style={{
            background: item.doc_vencidos > 0 ? 'red' : 'green',
            color: 'white',
            padding: '5px 12px',
            borderRadius: '20px',
            fontWeight: 'bold'
        }}
    >
        {item.doc_vencidos > 0 ? 'VENCIDOS' : 'VIGENTES'}
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

			<ModalProveedor
    visible={modalVisible}
    proveedorEditar={proveedorEditar}
    onClose={() => {

        setModalVisible(false);
        setProveedorEditar(null);

    }}
    onSuccess={() =>
        cargarProveedores(
            campoBusqueda,
            valorBusqueda
        )
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

        </>

    );

}
