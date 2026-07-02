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

            <h1>
                Proveedores
            </h1>

            <div
                className="card"
                style={{
                    marginTop:'20px',
                    padding:'20px'
                }}
            >

               			
				<button
    className="btn-primary"
    onClick={() => {

        console.log(
            'CLICK NUEVO PROVEEDOR'
        );

        setModalVisible(true);

    }}
>
    Nuevo Proveedor
</button>

                <div
                    style={{
                        marginTop:'20px'
                    }}
                >

                    <input
                        type="text"
                        placeholder="Buscar proveedor..."
                        value={filtro}
                        onChange={
                            (e)=>
                            setFiltro(
                                e.target.value
                            )
                        }
                        style={{
                            width:'300px',
                            padding:'10px'
                        }}
                    />

                </div>

            </div>

            <div
                className="card"
                style={{
                    marginTop:'20px',
                    padding:'20px'
                }}
            >

                <table
                    style={{
                        width:'100%',
                        borderCollapse:'collapse'
                    }}
                >

                    <thead>

                        <tr>

                            <th style={{
									textAlign:'left',
									padding:'12px'
									}}>
								Documento ID
							</th>

                            <th style={{
									textAlign:'left',
									padding:'12px'
									}}>
								Tipo Documento
							</th>

                             <th style={{
									textAlign:'left',
									padding:'12px'
									}}>
                                Documento
                            </th>

                             <th style={{
									textAlign:'left',
									padding:'12px'
									}}>
                                Razón Social
                            </th>

                             <th style={{
									textAlign:'left',
									padding:'12px'
									}}>
                                Estado
                            </th>
							
							<th
    style={{
        textAlign:'left',
        padding:'12px'
    }}
>
    Acciones
</th>

                        </tr>

                    </thead>

                    <tbody>

                    {
                        proveedoresFiltrados.map(
                            item => (

                                <tr
                                    key={
                                        item.proveedor_id
                                    }
									style={{
										borderTop:'1px solid #E5E7EB'
										}}
                                >

                                    <td style={{padding:'12px'}}>
    {item.proveedor_id}
</td>

<td style={{padding:'12px'}}>
    {item.nro_documento}
</td>

<td style={{padding:'12px'}}>
    {item.proveedor}
</td>

<td>
    {
        item.status === 'A'
        ?
        <span
            style={{
                background:'#DCFCE7',
                color:'#166534',
                padding:'12px',
                borderRadius:'20px',
                fontWeight:'600'
            }}
        >
            ACTIVO
        </span>
        :
        <span
            style={{
                background:'#FEE2E2',
                color:'#991B1B',
                padding:'12px',
                borderRadius:'20px',
                fontWeight:'600'
            }}
        >
            INACTIVO
        </span>
    }
</td>

<td
    style={{
        padding:'12px'
    }}
>

  <div
    style={{
        display:'flex',
        gap:'8px'
    }}
>

    <button
        className="btn-primary"
        onClick={() =>
            consultarProveedor(
                item.proveedor_id
            )
        }
    >
        Ver
    </button>

    <button
        style={{
            background:'#F59E0B',
            color:'white',
            border:'none',
            padding:'8px 12px',
            borderRadius:'6px',
            cursor:'pointer'
        }}
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