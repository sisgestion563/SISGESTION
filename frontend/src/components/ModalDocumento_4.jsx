import {
    useState,
    useEffect
}
from 'react';

import {
    crearDocumento
}
from '../services/documentos.service';

import {
    obtenerCatalogo
}
from '../services/catalogos.service';

export default function ModalDocumento({

    visible,
    onClose,
    onSuccess,
    proveedorId,
    grupoDocumento

}) {

    const [form,setForm] =
useState({

    tipo_documento_id:'',
    tipo_documento:'',
    fecha_inicio:'',
    fecha_fin:'',
    fecha_vigencia:'',
    ruta_documento:'',
    observaciones:'',
    alcance:''

});

const [
    tiposDocumento,
    setTiposDocumento
] = useState([]);

useEffect(() => {

    if(!visible){
        return;
    }

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

    const cargarTipos = async() => {

        if(grupoDocumento === 'DOC_NOR'){

            const data =
                await obtenerCatalogo(
                    '0001',
                    'TIPO_DOC_NORMATIVO'
                );

            setTiposDocumento(data);

        }

    };

    cargarTipos();

}, [
    grupoDocumento,
    visible
]);

if(!visible){
    return null;
}

    const guardar =
    async () => {

        try {
			
			
			
			
			

            const usuario =
                JSON.parse(
                    localStorage.getItem(
                        'usuario'
                    )
                );
				
				const documento = {

    ...form,

    proveedor_id:
        proveedorId,

    grupo_documentos:
        grupoDocumento,

    create_by:
        usuario.usuario_id

};


if(grupoDocumento === 'DOC_NOR'){

    documento.tipo_documento = '';

}
else{

    documento.tipo_documento_id = '';

}

            await crearDocumento(documento);

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
	
const obtenerNombreGrupo = () => {

    switch(grupoDocumento){

        case 'DOC_NOR':
            return 'DOCUMENTOS NORMATIVOS';

        case 'DOC_EXT_NOR':
            return 'DOCUMENTOS EXTRA NORMATIVOS';

        case 'DOC_REQ_ESTATAL':
            return 'DOCUMENTOS REQUERIMIENTO ESTATAL';

        case 'DOC_OTROS':
            return 'DOCUMENTOS OTROS';

        default:
            return grupoDocumento;

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

console.log(
    'VALOR REAL grupoDocumento =',
    grupoDocumento
);

console.log(
    'COMPARACION DOC_NOR =',
    grupoDocumento === 'DOC_NOR'
);


	
	


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
    value={form.tipo_documento_id}
    onChange={(e)=>
        setForm({
            ...form,
            tipo_documento_id:
                e.target.value
        })
    }
>

<option value="">
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

                <br/><br/>

                <input
                    type="date"
                    value={form.fecha_inicio}
                    onChange={(e)=>
                        setForm({
                            ...form,
                            fecha_inicio:
                                e.target.value
                        })
                    }
                />

                <br/><br/>

                <input
                    type="date"
                    value={form.fecha_fin}
                    onChange={(e)=>
                        setForm({
                            ...form,
                            fecha_fin:
                                e.target.value
                        })
                    }
                />

                <br/><br/>

                <input
                    type="date"
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

                <input
                    placeholder="Ruta Documento"
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

                <button
                    className="btn-primary"
                    onClick={guardar}
                >
                    Guardar
                </button>

                <button
                    style={{
                        marginLeft:'10px'
                    }}
                    onClick={cerrarModal}
                >
                    Cancelar
                </button>

            </div>

        </div>

    );

}