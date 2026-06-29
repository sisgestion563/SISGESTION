import {useState} from 'react';
import {buscarProveedor} from '../services/providers.service';
import {listarPorGrupo} from '../services/documentos.service';
import ModalDocumento from '../components/ModalDocumento';

export default function DocumentsPage()
	{
		const [tipoBusqueda,setTipoBusqueda] = useState('DOCUMENTO');
		const [valorBusqueda,setValorBusqueda] = useState('');
		const [proveedores,setProveedores] = useState([]);
		const [proveedorSeleccionado,setProveedorSeleccionado] = useState(null);
		const [grupoSeleccionado,setGrupoSeleccionado] = useState('DOCUMENTOS NORMATIVOS');
		const [documentos,setDocumentos] = useState([]);
		
		const buscar = async () => 
			{	try 
					{
						const data =await buscarProveedor(tipoBusqueda,valorBusqueda);
						if(tipoBusqueda === 'DOCUMENTO')
							{
								setProveedorSeleccionado(data);
								setProveedores([]);
								await cargarDocumentos(data.proveedor_id,grupoSeleccionado);
							}
						else
							{
								setProveedores(data);
								setProveedorSeleccionado(null);
							}
					}
				catch(error)
					{
						alert(error.response?.data?.message ||error.message);
					}
			};

		const cargarDocumentos = async (proveedorId,grupo) => 
			{
				try 
					{
						const data =await listarPorGrupo(proveedorId,grupo);
						setDocumentos(data);
					}
				catch(error)
					{
						console.error(error);
					}
			};

		const [modalDocumentoVisible,setModalDocumentoVisible] = useState(false);
		
		const [modoDocumento, setModoDocumento] = useState('NUEVO');

		const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
		
		
		const grupos = [

{
codigo:'DOC_NOR',
nombre:'Doc. Normativos'
},

{
codigo:'DOC_EXT_NOR',
nombre:'Doc. Extra Normativos'
},

{
codigo:'DOC_REQ_ESTATAL',
nombre:'Doc. Req. Estatal'
},

{
codigo:'DOC_OTROS',
nombre:'Doc. Otros'
}

];

console.log(
    'DOCUMENTOS:',
    documentos
);


console.log(modoDocumento);

		return (
					<>
						<div className="card">
						
							<h2>Documentos</h2>
							
							<div>
							
								<label>
									<input type="radio" checked={tipoBusqueda ==='DOCUMENTO'} onChange={()=>setTipoBusqueda('DOCUMENTO')}/>
									Documento
								</label>
								
								<label style={{marginLeft:'20px'}}>
									<input type="radio"checked={tipoBusqueda ==='RAZON'}onChange={()=>setTipoBusqueda('RAZON')}/>
									Razón Social
								</label>
								
							</div>
							
							<br/>
							
							<input value={valorBusqueda} onChange={(e)=> setValorBusqueda(e.target.value)} placeholder="Valor búsqueda"/>
							
							<button onClick={buscar} > Buscar </button>
							
							{
								proveedores.length > 0 &&

								<table className="table" style={{marginTop:'20px'}}>
									
									<thead>		
										<tr>
											<th>Documento</th>
											<th>Razón Social</th>
											<th>Acción</th>
										</tr>
									</thead>
									
									<tbody>
										{proveedores.map(item => (	<tr key={item.proveedor_id}>
																		<td>{item.nro_documento}</td>
																		<td>
																				{
																					item.razon_social ||
																					`${item.nombre || ''} ${item.apellido_paterno || ''} ${item.apellido_materno || ''}`
																				}
																		</td>
																		
																		<td>
																			<button className="btn-primary" onClick={async ()=>{setProveedorSeleccionado(item);await cargarDocumentos(item.proveedor_id,grupoSeleccionado);}}>
																				Seleccionar                            
																			</button>
																		</td>
																	</tr>
																)																
														)
										}
									</tbody>
								</table>
							}
							
		{
    proveedorSeleccionado &&

    <>

        <div
            style={{
                marginTop:'20px'
            }}
        >

            <p>
                <b>Razón Social:</b>{' '}
                {
                    proveedorSeleccionado.razon_social ||
                    `${proveedorSeleccionado.nombre || ''} ${proveedorSeleccionado.apellido_paterno || ''} ${proveedorSeleccionado.apellido_materno || ''}`
                }
            </p>

            <p>
                <b>CIIU:</b>{' '}
                {proveedorSeleccionado.ciiu}
                {' - '}
                {proveedorSeleccionado.descripcion_ciiu}
            </p>

            <p>
                <b>UBIGEO:</b>{' '}
                {proveedorSeleccionado.ubigeo}
                {' - '}
                {proveedorSeleccionado.departamento}
                {' / '}
                {proveedorSeleccionado.provincia}
                {' / '}
                {proveedorSeleccionado.ciudad}
            </p>

        </div>

        <hr/>

        <h3>
            Documentos del Proveedor
        </h3>

        <div
            style={{
                display:'flex',
                gap:'10px',
                marginBottom:'20px'
            }}
        >

            <button
                onClick={async ()=>{

                    setGrupoSeleccionado(
                        'DOC_NOR'
                    );

                    await cargarDocumentos(
                        proveedorSeleccionado.proveedor_id,
                        'DOC_NOR'
                    );

                }}
            >
                Doc. Normativos
            </button>

            <button
                onClick={async ()=>{

                    setGrupoSeleccionado(
                        'DOC_EXT_NOR'
                    );

                    await cargarDocumentos(
                        proveedorSeleccionado.proveedor_id,
                        'DOC_EXT_NOR'
                    );

                }}
            >
                Doc. Extra Normativos
            </button>

            <button
                onClick={async ()=>{

                    setGrupoSeleccionado(
                        'DOC_REQ_ESTATAL'
                    );

                    await cargarDocumentos(
                        proveedorSeleccionado.proveedor_id,
                        'DOC_REQ_ESTATAL'
                    );

                }}
            >
                Doc. Req. Estatal
            </button>

            <button
                onClick={async ()=>{

                    setGrupoSeleccionado(
                        'DOC_OTROS'
                    );

                    await cargarDocumentos(
                        proveedorSeleccionado.proveedor_id,
                        'DOC_OTROS'
                    );

                }}
            >
                Doc. Otros
            </button>

        </div>

        <button
    className="btn-primary"
    onClick={() => {

        setDocumentoSeleccionado(null);

        setModoDocumento('NUEVO');

        setModalDocumentoVisible(true);

    }}
>
    Agregar Documento
</button>

        <table
            style={{
                width:'100%',
                marginTop:'20px'
            }}
        >

            <thead>

                <tr>
                    <th>Tipo Documento</th>
					<th>Alcance</th>
                    <th>Fecha Vigencia</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>

            </thead>

            <tbody>

            {
                documentos.map(
                    item => (

                        <tr
                            key={
                                item.documento_id
                            }
                        >

<td>
{
    item.descripcion_tipo_documento ||
    item.tipo_documento ||
    item.tipo_documento_id
}
</td>

<td>

    {item.descripcion_alcance} 
</td>

                          <td>

{
new Date(
    item.fecha_vigencia
).toLocaleDateString(
    'es-PE'
)
}

</td>

                            <td>

{
item.estado_documento === 'V'
    ? 'VIGENTE'
    : 'VENCIDO'
}

</td>
                            <td>

                                <button

    onClick={() => {

        setDocumentoSeleccionado(item);

        setModoDocumento('VER');

        setModalDocumentoVisible(true);

    }}

>

    Ver

</button>

                                <button

    style={{
        marginLeft:'5px'
    }}

    onClick={() => {

        setDocumentoSeleccionado(item);

        setModoDocumento('EDITAR');

        setModalDocumentoVisible(true);

    }}

>

Editar

</button>

                            </td>

                        </tr>

                    )
                )
            }

            </tbody>

        </table>


    </>
	 

}					
      

        {
    modalDocumentoVisible && (

        <ModalDocumento

    visible={true}

    modo={modoDocumento}

    documento={documentoSeleccionado}

    proveedorId={proveedorSeleccionado?.proveedor_id}

    grupoDocumento={grupoSeleccionado}

    onClose={() =>

        setModalDocumentoVisible(false)

    }

    onSuccess={async () => {

        await cargarDocumentos(

            proveedorSeleccionado.proveedor_id,

            grupoSeleccionado

        );

    }}

/>

    )
}

        </div>

    </>


);
	}