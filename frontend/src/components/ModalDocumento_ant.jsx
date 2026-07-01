import { useEffect, useState } from 'react';
import './ModalDocumento.css';
import {crearDocumento,actualizarDocumento} from '../services/documentos.service';
import {obtenerCatalogo} from '../services/catalogos.service';

const FORM_INICIAL = {	tipo_documento_id: '',
						tipo_documento: '',
						fecha_inicio: '',
						fecha_fin: '',
						fecha_vigencia: '',
						alcance: '',
						ruta_documento: '',
						observaciones: ''};

const GRUPOS_DOCUMENTOS = { DOC_NOR: 'DOCUMENTOS NORMATIVOS',
							DOC_EXT_NOR: 'DOCUMENTOS EXTRA NORMATIVOS',
							DOC_REQ_ESTATAL: 'DOCUMENTOS REQUERIMIENTO ESTATAL',
							DOC_OTROS: 'DOCUMENTOS OTROS'};

const TITULOS = {NUEVO: 'Nuevo Documento',EDITAR: 'Editar Documento',VER: 'Consulta Documento'};

export default function ModalDocumento({visible,
										onClose,
										onSuccess,
										proveedorId,
										grupoDocumento,
										modo = 'NUEVO',
										documento = null})
{
	
	const formInicial = {	tipo_documento_id: '',
							tipo_documento: '',
							fecha_inicio: '',
							fecha_fin: '',
							fecha_vigencia: '',
							alcance: '',
							ruta_documento: '',
							observaciones: ''};

	const [form, setForm] = useState(FORM_INICIAL);    

	const [tiposDocumento,setTiposDocumento] = useState([]);

	const [alcances, setAlcances] = useState([]);

	const formatearFecha = (fecha) => {

		if (!fecha) return '';
		return new Date(fecha)
        .toISOString()
        .split('T')[0];	}

	const cargarCatalogos = async () => {

		try {
				if (grupoDocumento === 'DOC_NOR') 
					{
						const catalogo = await obtenerCatalogo('0001','TIPO_DOC_NORMATIVO');
						setTiposDocumento(catalogo);
					} 
				else {
						setTiposDocumento([]);
					}

				const catalogoAlcance = await obtenerCatalogo('0099','TIPO_GESTION');
				setAlcances(catalogoAlcance);

			} 
			catch (error) 
				{
					console.error(error);
				}
			};

	const cargarFormulario = () => {
		
		if (!documento) 
			{
				setForm(FORM_INICIAL);
				return;
			}

		setForm({	tipo_documento_id: documento.tipo_documento_id ?? '',
					tipo_documento: documento.tipo_documento ?? '',
					fecha_inicio: formatearFecha(documento.fecha_inicio),
					fecha_fin: formatearFecha(documento.fecha_fin),
					fecha_vigencia: formatearFecha(documento.fecha_vigencia),
					alcance: documento.alcance ?? '',
					ruta_documento: documento.ruta_documento ?? '',
					observaciones: documento.observaciones ?? ''});
		};


	useEffect(() => {

			if (!visible) return;
			cargarCatalogos();

			if (modo === 'NUEVO')
				{
					setForm(FORM_INICIAL);
				} 
			else
				{
					cargarFormulario();
				}},[visible,grupoDocumento,modo,documento]);

			if(!visible){return null;}

			const guardar = async () => {
				try 
					{
						const usuario = JSON.parse(localStorage.getItem('usuario'));
				
const datosDocumento = {
    ...form,
    proveedor_id: proveedorId,
    grupo_documentos: grupoDocumento,
    update_by: usuario.usuario_id
};


if(grupoDocumento === 'DOC_NOR'){

    documento.tipo_documento = '';

}
else{

    documento.tipo_documento_id = '';

}

if (modo === 'NUEVO') {

    await crearDocumento(datosDocumento);

}
else {

    await actualizarDocumento(
    documento.documento_id,
    datosDocumento
);

}
			
			
			
			

            alert(
                'Documento registrado correctamente'
            );

            onSuccess();

            cerrarModal();

        }
        catch(error){

            alert(
                error.response?.data?.message ||
                error.message
            );

        }

    };
	
	

const GRUPOS_DOCUMENTOS = {

    DOC_NOR:
        'DOCUMENTOS NORMATIVOS',

    DOC_EXT_NOR:
        'DOCUMENTOS EXTRA NORMATIVOS',

    DOC_REQ_ESTATAL:
        'DOCUMENTOS REQUERIMIENTO ESTATAL',

    DOC_OTROS:
        'DOCUMENTOS OTROS'

};

const cerrarModal = () => {

    setForm({

        tipo_documento_id:'',
        tipo_documento:'',
        fecha_inicio:'',
        fecha_fin:'',
        fecha_vigencia:'',
        ruta_documento:'',
        observaciones:'',
        alcance:''

    });

    onClose();

};

	
	
if (modo === 'VER') {

    return (

        <div className="modal-overlay">

            <div className="modal modal-consulta-documento">

                <div className="consulta-header">

                    <h2>📄 Consulta Documento</h2>

                </div>

                <div className="consulta-grid">

                    <div className="consulta-item">
                        <label>Grupo Documento</label>
                        <span>
                            {GRUPOS_DOCUMENTOS[grupoDocumento]}
                        </span>
                    </div>

                    <div className="consulta-item">
                        <label>Estado</label>

                        <span
                            className={
                                documento.estado_documento === 'VENCIDO'
                                    ? 'badge-danger'
                                    : 'badge-success'
                            }
                        >
                            {documento.estado_documento}
                        </span>

                    </div>

                    <div className="consulta-item">
                        <label>Tipo Documento</label>

                        <span>

                            {

                                documento.tipo_documento ||

                                documento.descripcion_tipo_documento

                            }

                        </span>

                    </div>

                    <div className="consulta-item">
                        <label>Alcance</label>

                        <span>

                            {

                                documento.descripcion_alcance

                            }

                        </span>

                    </div>

                    <div className="consulta-item">
                        <label>Fecha Inicio</label>

                        <span>

                            {

                                formatearFecha(

                                    documento.fecha_inicio

                                )

                            }

                        </span>

                    </div>

                    <div className="consulta-item">
                        <label>Ruta Documento</label>

                        <span>

                            {

                                documento.ruta_documento

                            }

                        </span>

                    </div>

                    <div className="consulta-item">
                        <label>Fecha Fin</label>

                        <span>

                            {

                                formatearFecha(

                                    documento.fecha_fin

                                )

                            }

                        </span>

                    </div>

                    <div className="consulta-item">
                        <label>Fecha Vigencia</label>

                        <span>

                            {

                                formatearFecha(

                                    documento.fecha_vigencia

                                )

                            }

                        </span>

                    </div>

                </div>

                <div className="consulta-observacion">

                    <label>

                        Observaciones

                    </label>

                    <div className="observacion-box">

                        {

                            documento.observaciones

                        }

                    </div>

                </div>

                <div className="consulta-footer">

                    <button

                        className="btn-primary"

                        onClick={cerrarModal}

                    >

                        Cerrar

                    </button>

                </div>

            </div>

        </div>

    );

}



    return (

        <div
            style={{
                position:'fixed',
                top:0,
                left:0,
                right:0,
                bottom:0,
                background:'rgba(0,0,0,0.4)',
                display:'flex',
                justifyContent:'center',
                alignItems:'center',
                zIndex:999
            }}
        >

            <div
                className="card"
                style={{
                    width:'700px',
                    padding:'30px'
                }}
            >

				<h2>
    Nuevo Documento - {
        GRUPOS_DOCUMENTOS[grupoDocumento]
    }
</h2>
                {
grupoDocumento ===
'DOC_NOR'

?

<select
disabled={soloLectura}
    value={form.tipo_documento_id}
    onChange={(e)=>
        setForm({
            ...form,
            tipo_documento_id:
                e.target.value
        })
    }
>
Seleccione
</option>

{
tiposDocumento.map(
item => (

<option
    key={
        item.codigo_valor
    }
    value={
        item.codigo_valor
    }
>
{
item.codigo_valor
}
 -
{
item.descripcion
}
</option>

))
}

</select>

:

<input
    value={
        form.tipo_documento
    }
	disabled={soloLectura}
    onChange={(e)=>
        setForm({
            ...form,
            tipo_documento:
                e.target.value
        })
    }
    placeholder="Tipo Documento"
/>

}

<label className="form-label"style={{ marginRight: "8px", display: "inline-block" }}>
    Fecha Vigencia       
</label>
                <input
                    type="date"
					disabled={soloLectura}
                    value={form.fecha_vigencia}
                    onChange={(e)=>
                        setForm({
                            ...form,
                            fecha_vigencia:
                                e.target.value
                        })
                    }
                />

                <br/><br/>
				
				<label className="form-label">
    Alcance  
</label>

<select
    className="form-control"
    value={form.alcance}
    disabled={soloLectura}
    onChange={(e)=>
        setForm({
            ...form,
            alcance:e.target.value
        })
    }
>

    <option value="">
        Seleccione...
    </option>

    {
        alcances.map(item=>(

            <option
                key={item.codigo_valor}
                value={item.codigo_valor}
            >
                {item.descripcion}
            </option>

        ))
    }

</select>

<br/><br/>
				
				
				
				
				
				
				

                <input
                    placeholder="Ruta Documento"
					disabled={soloLectura}
                    value={form.ruta_documento}
                    onChange={(e)=>
                        setForm({
                            ...form,
                            ruta_documento:
                                e.target.value
                        })
                    }
                />

                <br/><br/>

                <textarea
                    rows={4}
                    placeholder="Observaciones"
					disabled={soloLectura}
                    value={form.observaciones}
                    onChange={(e)=>
                        setForm({
                            ...form,
                            observaciones:
                                e.target.value
                        })
                    }
                    style={{
                        width:'100%'
                    }}
                />

                <br/><br/>

               
				
				{
    modo !== 'VER' && (

        <button

            className="btn-primary"

            onClick={guardar}

        >

            {

            modo === 'NUEVO'

            ?

            'Guardar'

            :

            'Actualizar'

            }

        </button>

    )
}

<button

    style={{

        marginLeft:'10px'

    }}

    onClick={cerrarModal}

>

    {

    modo === 'VER'

    ?

    'Cerrar'

    :

    'Cancelar'

    }

</button>

            </div>

        </div>

    );

}