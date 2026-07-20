import {
    useState,
    useEffect
}
from 'react';

import {
    obtenerDepartamentos,
    obtenerProvincias,
    obtenerDistritos
}
from '../services/ubigeos.service';

import {
    obtenerCatalogo
}
from '../services/catalogos.service';


import {
    crearProveedor,
    actualizarProveedor
}
from '../services/providers.service';

export default function ModalProveedor({
    visible,
    onClose,
    onSuccess,
    proveedorEditar
}) {


    const [form,setForm] = useState({

    tipo_documento:'06',

    nro_documento:'',

    nombre:'',

    apellido_paterno:'',

    apellido_materno:'',

    razon_social:'',
	pagina_web:'',

    representante_legal:'',

    correo:'',

    telefono:'',

    departamento:'',

    provincia:'',

    ciudad:'',

    ubigeo:'',

    direccion:'',

    ciiu:'',

    calificacion:'R',

    status:'A'

});


const [
    departamentos,
    setDepartamentos
] = useState([]);

const [
    provincias,
    setProvincias
] = useState([]);

const [
    ciudades,
    setCiudades
] = useState([]);

const [
    ciius,
    setCiius
] = useState([]);

useEffect(() => {

    cargarInicial();

}, []);

useEffect(() => {

    const cargarProveedorEditar =
    async () => {

        if(!proveedorEditar){
            return;
        }

        setForm({

            tipo_documento:
                proveedorEditar.tipo_documento || '06',

            nro_documento:
                proveedorEditar.nro_documento || '',

            nombre:
                proveedorEditar.nombre || '',

            apellido_paterno:
                proveedorEditar.apellido_paterno || '',

            apellido_materno:
                proveedorEditar.apellido_materno || '',

            razon_social:
                proveedorEditar.razon_social || '',
			pagina_web:
                proveedorEditar.pagina_web || '',	

            representante_legal:
                proveedorEditar.representante_legal || '',

            correo:
                proveedorEditar.correo || '',

            telefono:
                proveedorEditar.telefono || '',

            departamento:
                proveedorEditar.departamento || '',

            provincia:
                proveedorEditar.provincia || '',

            ciudad:
                proveedorEditar.ciudad || '',

            ubigeo:
                String(
                    proveedorEditar.ubigeo || ''
                ),

            direccion:
                proveedorEditar.direccion || '',

            ciiu:
                proveedorEditar.ciiu || '',

            calificacion:
                proveedorEditar.calificacion || 'R',

            status:
                proveedorEditar.status || 'A'
        });

        const provinciasData =
            await obtenerProvincias(
                proveedorEditar.departamento
            );

        setProvincias(
            provinciasData
        );

        const ciudadesData =
            await obtenerDistritos(
                proveedorEditar.departamento,
                proveedorEditar.provincia
            );

        setCiudades(
            ciudadesData
        );

    };

    cargarProveedorEditar();

}, [proveedorEditar]);


const cargarInicial =
async () => {

    try {

        const deps =
            await obtenerDepartamentos();
			console.log(
    'DEPARTAMENTOS',
    deps
);

        setDepartamentos(deps);

        const ciiu =
            await obtenerCatalogo(
                '0002',
                'CODIGO_CIIU_SUNAT'
            );

console.log(
    'CIIUS',
    ciiu
);
        setCiius(ciiu);

    }
    catch(error){

        console.error(error);

    }

};

const esEmpresa = form.tipo_documento === '06';

const usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
const esProveedorLogueado = usuarioLogueado?.rol_codigo === 'PROVEEDOR';

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
			
		console.log(
    'DATOS A GRABAR',
    form
);	

        if(proveedorEditar){

    await actualizarProveedor(
        proveedorEditar.proveedor_id,
        {
            ...form,
            create_by:
                usuario.usuario_id
        }
    );

}
else{

    await crearProveedor({
        ...form,
        create_by:
            usuario.usuario_id
    });

}
		
		setForm({

    tipo_documento:'06',

    nro_documento:'',

    nombre:'',

    apellido_paterno:'',

    apellido_materno:'',

    razon_social:'',
	pagina_web:'',

    representante_legal:'',

    correo:'',

    telefono:'',

    departamento:'',

    provincia:'',

    ciudad:'',

    direccion:'',

    calificacion:'R',

    status:'A'

});
		
		
        alert(
    proveedorEditar
        ? 'Proveedor actualizado correctamente'
        : 'Proveedor registrado correctamente'
);
        onSuccess();

        onClose();

    }
    catch(error){

        alert(
            error.response?.data?.message ||
            error.message
        );

    }

};

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
                alignItems:'center'
            }}
        >

            <div
    className="card"
    style={{
        width:'800px',
        maxHeight:'90vh',
        overflowY:'auto',
        padding:'30px'
    }}
>

<h2>
{
    proveedorEditar
    ?
    'Editar Proveedor'
    :
    'Nuevo Proveedor'
}
</h2>

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Tipo Documento
</label>

<select
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.tipo_documento}
    onChange={(e)=>
        setForm({
            ...form,
            tipo_documento:e.target.value
        })
    }
>

    <option value="06">
        RUC
    </option>

    <option value="01">
        DNI
    </option>

    <option value="04">
        Carnet Extranjería
    </option>

    <option value="07">
        Pasaporte
    </option>

    <option value="A0">
        Cédula Diplomática
    </option>

</select>

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Nro. Documento
</label>

<input
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.nro_documento}
    onChange={(e)=>
        setForm({
            ...form,
            nro_documento:e.target.value
        })
    }
/>

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Pagina Web
</label>		

<input
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.pagina_web}
    onChange={(e)=>
        setForm({
            ...form,
            pagina_web:e.target.value
        })
    }
/>

				{
    esEmpresa
    ?
    <>
        <label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Razón Social
</label>

<input
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.razon_social}
    onChange={(e)=>
        setForm({
            ...form,
            razon_social:e.target.value
        })
    }
/>
        <br/><br/>

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Representante Legal
</label>

<input
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.representante_legal}
    onChange={(e)=>
        setForm({
            ...form,
            representante_legal:e.target.value
        })
    }
/>

        <br/><br/>
    </>
    :
    <>
<label style={{display:'block',marginBottom:'5px',fontWeight:'600'}}>
    Nombres
</label>

<input
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.nombre}
    onChange={(e)=>
        setForm({
            ...form,
            nombre:e.target.value
        })
    }
/>

        <br/><br/>

<label style={{display:'block',marginBottom:'5px',fontWeight:'600'}}>
    Apellido Paterno
</label>

<input
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.apellido_paterno}
    onChange={(e)=>
        setForm({
            ...form,
            apellido_paterno:e.target.value
        })
    }
/>

        <br/><br/>

<label style={{display:'block',marginBottom:'5px',fontWeight:'600'}}>
    Apellido Materno
</label>

<input
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.apellido_materno}
    onChange={(e)=>
        setForm({
            ...form,
            apellido_materno:e.target.value
        })
    }
/>

        <br/><br/>
    </>
}

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Correo
</label>

<input
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.correo}
    onChange={(e)=>
        setForm({
            ...form,
            correo:e.target.value
        })
    }
/>

                <br/><br/>

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Teléfono
</label>

<input
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.telefono}
    onChange={(e)=>
        setForm({
            ...form,
            telefono:e.target.value
        })
    }
/>

                <br/><br/>
	
<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    CIIU
</label>
	
<select
    value={form.ciiu || ''}
    onChange={(e)=>
        setForm({
            ...form,
            ciiu:e.target.value
        })
    }
style={{
    width:'100%',
    padding:'10px',
    border:'1px solid #D1D5DB',
    borderRadius:'6px',
    marginBottom:'15px'
}}
>

<option value="">
Seleccione CIIU
</option>

{
    ciius.map(
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
                } - {
                    item.descripcion
                }
            </option>

        )
    )
}

</select>	
<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Departamento
</label>

<select
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.departamento}
    onChange={async (e)=>{

        const departamento = e.target.value;

        setForm({
            ...form,
            departamento,
            provincia:'',
            ciudad:'',
            ubigeo:''
        });

        const data =
            await obtenerProvincias(
                departamento
            );

        setProvincias(data);
        setCiudades([]);

    }}
>

    <option value="">
        Seleccione Departamento
    </option>

    {
        departamentos.map(item => (

            <option
                key={item.departamento}
                value={item.departamento}
            >
                {item.departamento}
            </option>

        ))
    }

</select>

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Provincia
</label>

<select
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.provincia}
    onChange={async (e)=>{

        const provincia = e.target.value;

        setForm({
            ...form,
            provincia,
            ciudad:'',
            ubigeo:''
        });

        const data =
            await obtenerDistritos(
                form.departamento,
                provincia
            );

        setCiudades(data);

    }}
>

    <option value="">
        Seleccione Provincia
    </option>

    {
        provincias.map(item => (

            <option
                key={item.provincia}
                value={item.provincia}
            >
                {item.provincia}
            </option>

        ))
    }

</select>

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Distrito
</label>

<select
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.ubigeo || ''}
    onChange={(e)=>{

        const ubigeo = e.target.value;

        const ciudadSeleccionada =
            ciudades.find(
                item =>
                    item.ubigeo_inei === ubigeo
            );

        setForm({
            ...form,
            ciudad:
                ciudadSeleccionada?.distrito || '',
            ubigeo
        });

    }}
>

    <option value="">
        Seleccione Distrito
    </option>

    {
        ciudades.map(item => (

            <option
                key={item.ubigeo_inei}
                value={item.ubigeo_inei}
            >
                {item.distrito}
            </option>

        ))
    }

</select>

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Ubigeo
</label>

<input
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom:'15px'
    }}
    value={form.ubigeo || ''}
    onChange={(e)=>
        setForm({
            ...form,
            ubigeo:e.target.value
        })
    }
/>

{!esProveedorLogueado && (
    <>
        <label style={{display:'block',marginBottom:'5px',fontWeight:'600'}}>
            Estado Proveedor
        </label>
        <select
            style={{width:'100%',padding:'10px',border:'1px solid #D1D5DB',borderRadius:'6px',marginBottom:'15px'}}
            value={form.status}
            onChange={(e)=>setForm({...form,status:e.target.value})}>
            <option value="A">Activo</option>
            <option value="I">Inactivo</option>	
        </select>
    </>
)}


<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Dirección
</label>

<textarea
    value={form.direccion}
    onChange={(e)=>
        setForm({
            ...form,
            direccion:e.target.value
        })
    }
    rows={3}
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        resize:'none',
        marginBottom:'15px'
    }}
/>


               <div
    style={{
        marginTop:'25px',
        display:'flex',
        gap:'10px'
    }}
>


    <button
        className="btn-primary"
        onClick={guardar}
    >
        {
    proveedorEditar
    ?
    'Actualizar'
    :
    'Guardar'
}
    </button>

    <button
        onClick={onClose}
    >
        Cancelar
    </button>

</div>

            </div>

        </div>

    );
	

}