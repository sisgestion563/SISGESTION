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

const [
    errors,
    setErrors
] = useState({});

useEffect(() => {
    if (visible) {
        setErrors({});
    }
}, [visible]);

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

// ── Validar formulario en español ──────────────────────────────────────────
const validarForm = () => {
    const newErrors = {};
    const soloNumeros = /^\d+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.tipo_documento) {
        newErrors.tipo_documento = 'El tipo de documento es obligatorio.';
    }

    if (!form.nro_documento || !form.nro_documento.trim()) {
        newErrors.nro_documento = 'El número de documento es obligatorio.';
    } else {
        if (form.tipo_documento === '06') {
            if (form.nro_documento.length !== 11 || !soloNumeros.test(form.nro_documento)) {
                newErrors.nro_documento = 'El RUC debe tener exactamente 11 dígitos numéricos.';
            }
        } else if (form.tipo_documento === '01') {
            if (form.nro_documento.length !== 8 || !soloNumeros.test(form.nro_documento)) {
                newErrors.nro_documento = 'El DNI debe tener exactamente 8 dígitos numéricos.';
            }
        } else {
            if (!soloNumeros.test(form.nro_documento)) {
                newErrors.nro_documento = 'El número de documento debe contener solo números.';
            }
        }
    }

    if (form.tipo_documento === '06') {
        if (!form.razon_social || !form.razon_social.trim()) {
            newErrors.razon_social = 'La razón social es obligatoria.';
        }
        if (!form.representante_legal || !form.representante_legal.trim()) {
            newErrors.representante_legal = 'El representante legal es obligatorio.';
        }
    } else {
        if (!form.nombre || !form.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio.';
        }
        if (!form.apellido_paterno || !form.apellido_paterno.trim()) {
            newErrors.apellido_paterno = 'El apellido paterno es obligatorio.';
        }
        if (!form.apellido_materno || !form.apellido_materno.trim()) {
            newErrors.apellido_materno = 'El apellido materno es obligatorio.';
        }
    }

    if (!form.correo || !form.correo.trim()) {
        newErrors.correo = 'El correo electrónico es obligatorio.';
    } else if (!emailRegex.test(form.correo)) {
        newErrors.correo = 'Ingrese un correo electrónico válido.';
    }

    if (!form.telefono || !form.telefono.trim()) {
        newErrors.telefono = 'El teléfono es obligatorio.';
    } else if (!soloNumeros.test(form.telefono)) {
        newErrors.telefono = 'El teléfono debe contener solo números.';
    } else if (form.telefono.length < 7 || form.telefono.length > 9) {
        newErrors.telefono = 'El teléfono debe tener entre 7 y 9 dígitos.';
    }

    if (!form.departamento) {
        newErrors.departamento = 'El departamento es obligatorio.';
    }
    if (!form.provincia) {
        newErrors.provincia = 'La provincia es obligatoria.';
    }
    if (!form.ubigeo) {
        newErrors.ubigeo = 'El distrito es obligatorio.';
    }
    if (!form.direccion || !form.direccion.trim()) {
        newErrors.direccion = 'La dirección es obligatoria.';
    }
    if (!form.ciiu) {
        newErrors.ciiu = 'La actividad económica (CIIU) es obligatoria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

if(!visible){
    return null;
}

    const guardar =
async () => {

    setErrors({});
    if (!validarForm()) {
        return;
    }

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

            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    guardar();
                }}
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
    Tipo Documento *
</label>

<select
    required
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.tipo_documento ? '5px' : '15px'
    }}
    value={form.tipo_documento}
    onChange={(e)=>{
        setForm({
            ...form,
            tipo_documento:e.target.value
        });
        setErrors(prev => ({ ...prev, tipo_documento: null, nro_documento: null }));
    }}
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
{errors.tipo_documento && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.tipo_documento}</span>}

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Nro. Documento *
</label>

<input
    required
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.nro_documento ? '5px' : '15px'
    }}
    value={form.nro_documento}
    onChange={(e)=>{
        setForm({
            ...form,
            nro_documento:e.target.value
        });
        setErrors(prev => ({ ...prev, nro_documento: null }));
    }}
/>
{errors.nro_documento && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.nro_documento}</span>}

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
    Razón Social *
</label>

<input
    required
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.razon_social ? '5px' : '15px'
    }}
    value={form.razon_social}
    onChange={(e)=>{
        setForm({
            ...form,
            razon_social:e.target.value
        });
        setErrors(prev => ({ ...prev, razon_social: null }));
    }}
/>
{errors.razon_social && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.razon_social}</span>}
    </>
    :
    <>
<label style={{display:'block',marginBottom:'5px',fontWeight:'600'}}>
    Nombres *
</label>

<input
    required
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.nombre ? '5px' : '15px'
    }}
    value={form.nombre}
    onChange={(e)=>{
        setForm({
            ...form,
            nombre:e.target.value
        });
        setErrors(prev => ({ ...prev, nombre: null }));
    }}
/>
{errors.nombre && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.nombre}</span>}

<label style={{display:'block',marginBottom:'5px',fontWeight:'600'}}>
    Apellido Paterno *
</label>

<input
    required
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.apellido_paterno ? '5px' : '15px'
    }}
    value={form.apellido_paterno}
    onChange={(e)=>{
        setForm({
            ...form,
            apellido_paterno:e.target.value
        });
        setErrors(prev => ({ ...prev, apellido_paterno: null }));
    }}
/>
{errors.apellido_paterno && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.apellido_paterno}</span>}

<label style={{display:'block',marginBottom:'5px',fontWeight:'600'}}>
    Apellido Materno *
</label>

<input
    required
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.apellido_materno ? '5px' : '15px'
    }}
    value={form.apellido_materno}
    onChange={(e)=>{
        setForm({
            ...form,
            apellido_materno:e.target.value
        });
        setErrors(prev => ({ ...prev, apellido_materno: null }));
    }}
/>
{errors.apellido_materno && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.apellido_materno}</span>}
    </>
}

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Correo Contacto *
</label>

<input
    required
    type="email"
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.correo ? '5px' : '15px'
    }}
    value={form.correo}
    onChange={(e)=>{
        setForm({
            ...form,
            correo:e.target.value
        });
        setErrors(prev => ({ ...prev, correo: null }));
    }}
/>
{errors.correo && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.correo}</span>}

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Teléfono *
</label>

<input
    required
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.telefono ? '5px' : '15px'
    }}
    value={form.telefono}
    onChange={(e)=>{
        setForm({
            ...form,
            telefono:e.target.value
        });
        setErrors(prev => ({ ...prev, telefono: null }));
    }}
/>
{errors.telefono && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.telefono}</span>}
	
<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Página Web
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

{esEmpresa && (
    <>
        <label
            style={{
                display:'block',
                marginBottom:'5px',
                fontWeight:'600'
            }}
        >
            Representante Legal *
        </label>

        <input
            required
            style={{
                width:'100%',
                padding:'10px',
                border:'1px solid #D1D5DB',
                borderRadius:'6px',
                marginBottom: errors.representante_legal ? '5px' : '15px'
            }}
            value={form.representante_legal}
            onChange={(e)=>{
                setForm({
                    ...form,
                    representante_legal:e.target.value
                });
                setErrors(prev => ({ ...prev, representante_legal: null }));
            }}
        />
        {errors.representante_legal && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.representante_legal}</span>}
    </>
)}

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Departamento *
</label>

<select
    required
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.departamento ? '5px' : '15px'
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
        setErrors(prev => ({ ...prev, departamento: null, provincia: null, ubigeo: null }));

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
{errors.departamento && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.departamento}</span>}

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Provincia *
</label>

<select
    required
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.provincia ? '5px' : '15px'
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
        setErrors(prev => ({ ...prev, provincia: null, ubigeo: null }));

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
{errors.provincia && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.provincia}</span>}

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Distrito / Ciudad *
</label>

<select
    required
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.ubigeo ? '5px' : '15px'
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
        setErrors(prev => ({ ...prev, ubigeo: null }));

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
{errors.ubigeo && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.ubigeo}</span>}

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Dirección *
</label>

<textarea
    required
    value={form.direccion}
    onChange={(e)=>{
        setForm({
            ...form,
            direccion:e.target.value
        });
        setErrors(prev => ({ ...prev, direccion: null }));
    }}
    rows={3}
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        resize:'none',
        marginBottom: errors.direccion ? '5px' : '15px'
    }}
/>
{errors.direccion && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.direccion}</span>}

<label
    style={{
        display:'block',
        marginBottom:'5px',
        fontWeight:'600'
    }}
>
    Actividad Económica (CIIU) *
</label>
	
<select
    required
    value={form.ciiu || ''}
    onChange={(e)=>{
        setForm({
            ...form,
            ciiu:e.target.value
        });
        setErrors(prev => ({ ...prev, ciiu: null }));
    }}
    style={{
        width:'100%',
        padding:'10px',
        border:'1px solid #D1D5DB',
        borderRadius:'6px',
        marginBottom: errors.ciiu ? '5px' : '15px'
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
{errors.ciiu && <span style={{ color: '#dc2626', fontSize: '12.5px', marginBottom: '15px', display: 'block', fontWeight: '500' }}>{errors.ciiu}</span>}

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


               <div
    style={{
        marginTop:'25px',
        display:'flex',
        gap:'10px'
    }}
>


    <button
        type="submit"
        className="btn-primary"
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
        type="button"
        onClick={onClose}
    >
        Cancelar
    </button>

</div>

            </form>

        </div>

    );
	

}