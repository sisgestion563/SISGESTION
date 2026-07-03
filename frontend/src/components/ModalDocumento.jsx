import {
    useState,
    useEffect
}
from 'react';

import {

    crearDocumento,
    actualizarDocumento

} from '../services/documentos.service';

import {
    obtenerCatalogo
}
from '../services/catalogos.service';

export default function ModalDocumento({

    visible,
    onClose,
    onSuccess,

    proveedorId,
    grupoDocumento,

    modo = 'NUEVO',

    documento = null

}) {
	
	const formInicial = {

    tipo_documento_id: '',
    tipo_documento: '',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_vigencia: '',
    alcance: '',
    ruta_documento: '',
    observaciones: ''

};

const [form, setForm] = useState(formInicial);
const [fechaVigenciaDisplay, setFechaVigenciaDisplay] = useState('');

    

const [
    tiposDocumento,
    setTiposDocumento
] = useState([]);

const [alcances, setAlcances] = useState([]);

const cargarCatalogos = async () => {

    try {

        if (grupoDocumento === 'DOC_NOR') {

            const tipos = await obtenerCatalogo(
                '0001',
                'TIPO_DOC_NORMATIVO'
            );

            setTiposDocumento(tipos);

        }
        else {

            setTiposDocumento([]);

        }

        const alc = await obtenerCatalogo(
            '0099',
            'TIPO_GESTION'
        );

        setAlcances(alc);

    }
    catch (error) {

        console.error(error);

    }

};

const cargarFormulario = () => {

    if (!documento) {

        setForm(formInicial);

        return;

    }

    setForm({

        tipo_documento_id: documento.tipo_documento_id || '',
        tipo_documento: documento.tipo_documento || '',
        fecha_inicio: formatearFecha(documento.fecha_inicio) || '',
        fecha_fin: formatearFecha(documento.fecha_fin) || '',
        fecha_vigencia: formatearFecha(documento.fecha_vigencia) || '',
        alcance: documento.alcance || '',
        ruta_documento: documento.ruta_documento || '',
        observaciones: documento.observaciones || ''

    });

    setFechaVigenciaDisplay(
        formatearFechaDisplay(documento.fecha_vigencia)
    );

};

const formatearFecha = (fecha) => {

    if (!fecha) return '';

    return new Date(fecha)
        .toISOString()
        .split('T')[0];

};

// Para mostrar en pantalla (modo Consultar), no para inputs de tipo date
const formatearFechaDisplay = (fecha) => {

    const iso = formatearFecha(fecha);

    if (!iso) return '';

    const [anio, mes, dia] = iso.split('-');

    return `${dia}/${mes}/${anio}`;

};

// Máscara dd/mm/yyyy para el campo de texto de Fecha Vigencia.
// Guarda el texto visible en fechaVigenciaDisplay y, cuando la fecha
// queda completa y es válida, actualiza form.fecha_vigencia en ISO
// (formato que espera el backend).
const handleFechaVigenciaChange = (e) => {

    const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 8);

    let formateado = soloNumeros;

    if (soloNumeros.length > 4) {
        formateado = `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2, 4)}/${soloNumeros.slice(4)}`;
    }
    else if (soloNumeros.length > 2) {
        formateado = `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2)}`;
    }

    setFechaVigenciaDisplay(formateado);

    if (soloNumeros.length === 8) {

        const dia = soloNumeros.slice(0, 2);
        const mes = soloNumeros.slice(2, 4);
        const anio = soloNumeros.slice(4, 8);

        const iso = `${anio}-${mes}-${dia}`;
        const fechaValidada = new Date(iso);

        const esValida =
            fechaValidada.getFullYear() === Number(anio) &&
            fechaValidada.getMonth() + 1 === Number(mes) &&
            fechaValidada.getDate() === Number(dia);

        setForm(prev => ({
            ...prev,
            fecha_vigencia: esValida ? iso : ''
        }));

    }
    else {

        setForm(prev => ({
            ...prev,
            fecha_vigencia: ''
        }));

    }

};

useEffect(() => {

    if (!visible) {

        return;

    }

    cargarCatalogos();

    if (modo === 'NUEVO') {

        setForm(formInicial);
        setFechaVigenciaDisplay('');

    }
    else {

        cargarFormulario();

    }

}, [

    visible,
    grupoDocumento,
    modo,
    documento

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
				
const datosDocumento = {
    ...form,
    proveedor_id: proveedorId,
    grupo_documentos: grupoDocumento,
	
	fecha_inicio: form.fecha_inicio || null,
    fecha_fin: form.fecha_fin || null,
    update_by: usuario.usuario_id
};

if (grupoDocumento === 'DOC_NOR') {
    datosDocumento.tipo_documento = '';
} else {
    datosDocumento.tipo_documento_id = '';
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

const soloLectura = modo === 'VER';

const TITULOS = {

    NUEVO:'Nuevo Documento',

    EDITAR:'Editar Documento',

    VER:'Consultar Documento'

};

<h2>

{

TITULOS[modo]

}

 - {

GRUPOS_DOCUMENTOS[grupoDocumento]

}

</h2>
	
if (modo === 'VER') {

    return (

        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999
            }}
        >

            <div
                className="card"
                style={{
                    width: '700px',
                    padding: '30px'
                }}
            >

                <h2>
                    Consultar Documento - {GRUPOS_DOCUMENTOS[grupoDocumento]}
                </h2>

                <label className="form-label"style={{ fontWeight: 'bold' }}>
                    Tipo Documento
                </label>

                <div className="campo-consulta">
                    {
                        documento.tipo_documento ||
                        documento.descripcion_tipo_documento
                    }
                </div>

                <br />

                <label className="form-label"style={{ fontWeight: 'bold' }}>
                    Estado
                </label>

                <div className="campo-consulta">
                    {documento.desc_estado_documento}
                </div>

                <br />

                <label className="form-label"style={{ fontWeight: 'bold' }}>
                    Fecha Vigencia
                </label>

                <div className="campo-consulta">
                    {formatearFechaDisplay(documento.fecha_vigencia)}
                </div>

                <br />

                <label className="form-label"style={{ fontWeight: 'bold' }}>
                    Alcance
                </label>

                <div className="campo-consulta">
                    {documento.descripcion_alcance}
                </div>

                <br />

                <label className="form-label"style={{ fontWeight: 'bold' }}>
                    Ruta Documento
                </label>

                <div className="campo-consulta">
                    {documento.ruta_documento}
                </div>

                <br />

                <label className="form-label"style={{ fontWeight: 'bold' }}>
                    Observaciones
                </label>

                <div
                    className="campo-consulta"
                    style={{
                        minHeight: '100px',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {documento.observaciones}
                </div>

                <br />

                <button
                    className="btn-primary"
                    onClick={cerrarModal}
                >
                    Cerrar
                </button>

            </div>

        </div>

    );

}


const renderConsulta = () => (

    <div className="modal-overlay">

        <div className="modal modal-consulta">

            ...

        </div>

    </div>

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
                <label
    className="form-label"
        style={{
        marginRight: "8px",
        display: "inline-block",
        fontWeight: 600
    }}
>
    Tipo Documento
</label>
				
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
                <br/><br/>



<label className="form-label"    style={{
        marginRight: "8px",
        display: "inline-block",
        fontWeight: 600
    }}>
    Fecha Vigencia       
</label>

                <input
                    type="text"
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    inputMode="numeric"
					disabled={soloLectura}
                    value={fechaVigenciaDisplay}
                    onChange={handleFechaVigenciaChange}
                />

                <br/><br/>
				
				<label className="form-label"    style={{
        marginRight: "8px",
        display: "inline-block",
        fontWeight: 600
    }}>
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
				
				
<label className="form-label"    style={{
        marginRight: "8px",
        display: "inline-block",
        fontWeight: 600
    }}>
    Ruta Documento       
</label>		

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


<label className="form-label"    style={{
        marginRight: "8px",
        display: "inline-block",
        fontWeight: 600
    }}>
    Observaciones       
</label>		
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