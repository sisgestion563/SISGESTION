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

    regimen_tributario:'',

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
    regimenesTributarios,
    setRegimenesTributarios
] = useState([]);

const [
    nroTrabajadoresList,
    setNroTrabajadoresList
] = useState([]);

const [
    errors,
    setErrors
] = useState({});

const [tiposDocumentoClie, setTiposDocumentoClie] = useState([]);
const [clientes, setClientes] = useState([]);
const [nuevoCliente, setNuevoCliente] = useState({
    tipo_documento_clie: '',
    nro_documento_clie: '',
    razon_social_nombres_apellidos: '',
    ciuu_cliente: ''
});
const [clienteError, setClienteError] = useState('');

useEffect(() => {
    if (visible) {
        setErrors({});
        if (!proveedorEditar) {
            setForm({
                regimen_tributario: '',
                tipo_documento: '06',
                nro_documento: '',
                nombre: '',
                apellido_paterno: '',
                apellido_materno: '',
                razon_social: '',
                pagina_web: '',
                representante_legal: '',
                correo: '',
                telefono: '',
                departamento: '',
                provincia: '',
                ciudad: '',
                ubigeo: '',
                direccion: '',
                ciiu: '',
                calificacion: 'R',
                status: 'A',
                nro_trabajadores: ''
            });
            setProvincias([]);
            setCiudades([]);
        }
    }
}, [visible, proveedorEditar]);

useEffect(() => {

    cargarInicial();

}, []);

useEffect(() => {

    const cargarProveedorEditar =
    async () => {

        if(!proveedorEditar){
            setForm({
                regimen_tributario: '',
                tipo_documento: '06',
                nro_documento: '',
                nombre: '',
                apellido_paterno: '',
                apellido_materno: '',
                razon_social: '',
                pagina_web: '',
                representante_legal: '',
                correo: '',
                telefono: '',
                departamento: '',
                provincia: '',
                ciudad: '',
                ubigeo: '',
                direccion: '',
                ciiu: '',
                calificacion: 'R',
                status: 'A',
                nro_trabajadores: ''
            });
            setProvincias([]);
            setCiudades([]);
            setClientes([]);
            return;
        }

        setForm({

            regimen_tributario:
                proveedorEditar.regimen_tributario || proveedorEditar.codigo_regimen_tributario || '',

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
                proveedorEditar.status || 'A',
                
            nro_trabajadores:
                proveedorEditar.nro_trabajadores || ''
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
        setClientes(proveedorEditar.clientes || []);

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

        setCiius(ciiu);

        const regTrib =
            await obtenerCatalogo(
                '0100',
                'TIPO_REGIMEN'
            );

        setRegimenesTributarios(regTrib);

        const nroTrab =
            await obtenerCatalogo(
                '0101',
                'TIPO_NRO_TRABAJADORES'
            );
        
        setNroTrabajadoresList(nroTrab);

        const docs = await obtenerCatalogo('0001', 'TIPO_DOC_SUNAT');
        setTiposDocumentoClie(docs);

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

    if (!form.regimen_tributario) {
        newErrors.regimen_tributario = 'El tipo de empresa es obligatorio.';
    }

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

const agregarClienteDirectamente = async () => {
    setClienteError('');
    if (!nuevoCliente.tipo_documento_clie) {
        setClienteError('El tipo de documento es obligatorio.');
        return;
    }
    if (!nuevoCliente.nro_documento_clie || !nuevoCliente.nro_documento_clie.trim()) {
        setClienteError('El número de documento es obligatorio.');
        return;
    }
    if (!/^\d+$/.test(nuevoCliente.nro_documento_clie)) {
        setClienteError('El número de documento debe contener solo dígitos.');
        return;
    }
    if (!nuevoCliente.razon_social_nombres_apellidos || !nuevoCliente.razon_social_nombres_apellidos.trim()) {
        setClienteError('La razón social o nombres es obligatorio.');
        return;
    }
    if (!nuevoCliente.ciuu_cliente) {
        setClienteError('La actividad económica (CIIU) es obligatoria.');
        return;
    }
    
    const existe = clientes.some(c => c.tipo_documento_clie === nuevoCliente.tipo_documento_clie && c.nro_documento_clie === nuevoCliente.nro_documento_clie);
    if (existe) {
        setClienteError('Este cliente ya se encuentra en la lista.');
        return;
    }

    try {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        const nuevosClientes = [...clientes, nuevoCliente];
        
        if (proveedorEditar) {
            // Guardamos inmediatamente en la base de datos
            await actualizarProveedor(proveedorEditar.proveedor_id, {
                ...form,
                clientes: nuevosClientes,
                update_by: usuario.usuario_id,
                create_by: usuario.usuario_id
            });
            alert('Cliente recomendado agregado y guardado correctamente.');
        }
        
        setClientes(nuevosClientes);
        setNuevoCliente({
            tipo_documento_clie: '',
            nro_documento_clie: '',
            razon_social_nombres_apellidos: '',
            ciuu_cliente: ''
        });
    } catch (error) {
        alert('Error al guardar el cliente recomendado: ' + (error.response?.data?.message || error.message));
    }
};

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
            clientes,
            update_by: usuario.usuario_id,
            create_by: usuario.usuario_id
        }
    );

}
else{

    await crearProveedor({
        ...form,
        clientes,
        create_by:
            usuario.usuario_id
    });

}
		
		setForm({

    regimen_tributario:'',

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
		
		setClientes([]);
		setNuevoCliente({
			tipo_documento_clie: '',
			nro_documento_clie: '',
			razon_social_nombres_apellidos: '',
			ciuu_cliente: ''
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
                <h2>{proveedorEditar ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                
                {/* --- GRUPO 1: IDENTIDAD --- */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '15px' }}>
    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tipo Empresa *</label>
        <select
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.regimen_tributario ? '5px' : '0' }}
            value={form.regimen_tributario}
            onChange={(e) => {
                setForm({ ...form, regimen_tributario: e.target.value });
                setErrors(prev => ({ ...prev, regimen_tributario: null }));
            }}
        >
            <option value="">Seleccione...</option>
            {regimenesTributarios.map(item => (
                <option key={item.codigo_valor} value={item.codigo_valor}>
                    {item.codigo_valor ? `${item.codigo_valor} - ${item.descripcion}` : item.descripcion}
                </option>
            ))}
        </select>
        {errors.regimen_tributario && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.regimen_tributario}</span>}
    </div>

    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nro. Trabajadores</label>
        <select
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
            value={form.nro_trabajadores}
            onChange={(e) => {
                setForm({ ...form, nro_trabajadores: e.target.value });
            }}
        >
            <option value="">Seleccione...</option>
            {nroTrabajadoresList.map(item => (
                <option key={item.codigo_valor} value={item.codigo_valor}>
                    {item.codigo_valor ? `${item.codigo_valor} - ${item.descripcion}` : item.descripcion}
                </option>
            ))}
        </select>
    </div>

    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tipo Documento *</label>
        <select
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.tipo_documento ? '5px' : '0' }}
            value={form.tipo_documento}
            onChange={(e)=>{
                setForm({ ...form, tipo_documento: e.target.value });
                setErrors(prev => ({ ...prev, tipo_documento: null, nro_documento: null }));
            }}
        >
            <option value="06">RUC</option>
            <option value="01">DNI</option>
            <option value="04">Carnet Extranjería</option>
            <option value="07">Pasaporte</option>
            <option value="A0">Cédula Diplomática</option>
        </select>
        {errors.tipo_documento && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.tipo_documento}</span>}
    </div>

    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nro. Documento *</label>
        <input
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.nro_documento ? '5px' : '0' }}
            value={form.nro_documento}
            onChange={(e)=>{
                setForm({ ...form, nro_documento: e.target.value });
                setErrors(prev => ({ ...prev, nro_documento: null }));
            }}
        />
        {errors.nro_documento && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.nro_documento}</span>}
    </div>
</div>

{esEmpresa ? (
    <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Razón Social *</label>
        <input
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.razon_social ? '5px' : '0' }}
            value={form.razon_social}
            onChange={(e)=>{
                setForm({ ...form, razon_social: e.target.value });
                setErrors(prev => ({ ...prev, razon_social: null }));
            }}
        />
        {errors.razon_social && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.razon_social}</span>}
    </div>
) : (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
        <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nombres *</label>
            <input
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.nombre ? '5px' : '0' }}
                value={form.nombre}
                onChange={(e)=>{
                    setForm({ ...form, nombre: e.target.value });
                    setErrors(prev => ({ ...prev, nombre: null }));
                }}
            />
            {errors.nombre && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.nombre}</span>}
        </div>
        <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Apellido Paterno *</label>
            <input
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.apellido_paterno ? '5px' : '0' }}
                value={form.apellido_paterno}
                onChange={(e)=>{
                    setForm({ ...form, apellido_paterno: e.target.value });
                    setErrors(prev => ({ ...prev, apellido_paterno: null }));
                }}
            />
            {errors.apellido_paterno && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.apellido_paterno}</span>}
        </div>
        <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Apellido Materno *</label>
            <input
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.apellido_materno ? '5px' : '0' }}
                value={form.apellido_materno}
                onChange={(e)=>{
                    setForm({ ...form, apellido_materno: e.target.value });
                    setErrors(prev => ({ ...prev, apellido_materno: null }));
                }}
            />
            {errors.apellido_materno && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.apellido_materno}</span>}
        </div>
    </div>
)}

{/* --- GRUPO 2: CONTACTO --- */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Correo Contacto *</label>
        <input
            required
            type="email"
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.correo ? '5px' : '0' }}
            value={form.correo}
            onChange={(e)=>{
                setForm({ ...form, correo: e.target.value });
                setErrors(prev => ({ ...prev, correo: null }));
            }}
        />
        {errors.correo && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.correo}</span>}
    </div>
    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Teléfono *</label>
        <input
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.telefono ? '5px' : '0' }}
            value={form.telefono}
            onChange={(e)=>{
                setForm({ ...form, telefono: e.target.value });
                setErrors(prev => ({ ...prev, telefono: null }));
            }}
        />
        {errors.telefono && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.telefono}</span>}
    </div>
    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Página Web</label>
        <input
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
            value={form.pagina_web}
            onChange={(e) => setForm({ ...form, pagina_web: e.target.value })}
        />
    </div>
</div>

{/* --- GRUPO 3: LEGAL --- */}
{esEmpresa && (
    <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Representante Legal *</label>
        <input
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.representante_legal ? '5px' : '0' }}
            value={form.representante_legal}
            onChange={(e)=>{
                setForm({ ...form, representante_legal: e.target.value });
                setErrors(prev => ({ ...prev, representante_legal: null }));
            }}
        />
        {errors.representante_legal && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.representante_legal}</span>}
    </div>
)}

{/* --- GRUPO 4: UBICACIÓN --- */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Departamento *</label>
        <select
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.departamento ? '5px' : '0' }}
            value={form.departamento}
            onChange={async (e)=>{
                const departamento = e.target.value;
                setForm({ ...form, departamento, provincia: '', ciudad: '', ubigeo: '' });
                setErrors(prev => ({ ...prev, departamento: null, provincia: null, ubigeo: null }));
                const data = await obtenerProvincias(departamento);
                setProvincias(data);
                setCiudades([]);
            }}
        >
            <option value="">Seleccione Departamento</option>
            {departamentos.map(item => (
                <option key={item.departamento} value={item.departamento}>{item.departamento}</option>
            ))}
        </select>
        {errors.departamento && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.departamento}</span>}
    </div>
    
    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Provincia *</label>
        <select
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.provincia ? '5px' : '0' }}
            value={form.provincia}
            onChange={async (e)=>{
                const provincia = e.target.value;
                setForm({ ...form, provincia, ciudad: '', ubigeo: '' });
                setErrors(prev => ({ ...prev, provincia: null, ubigeo: null }));
                const data = await obtenerDistritos(form.departamento, provincia);
                setCiudades(data);
            }}
        >
            <option value="">Seleccione Provincia</option>
            {provincias.map(item => (
                <option key={item.provincia} value={item.provincia}>{item.provincia}</option>
            ))}
        </select>
        {errors.provincia && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.provincia}</span>}
    </div>
    
    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Distrito / Ciudad *</label>
        <select
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.ubigeo ? '5px' : '0' }}
            value={form.ubigeo || ''}
            onChange={(e)=>{
                const ubigeo = e.target.value;
                const ciudadSeleccionada = ciudades.find(item => item.ubigeo_inei === ubigeo);
                setForm({ ...form, ciudad: ciudadSeleccionada?.distrito || '', ubigeo });
                setErrors(prev => ({ ...prev, ubigeo: null }));
            }}
        >
            <option value="">Seleccione Distrito</option>
            {ciudades.map(item => (
                <option key={item.ubigeo_inei} value={item.ubigeo_inei}>{item.distrito}</option>
            ))}
        </select>
        {errors.ubigeo && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.ubigeo}</span>}
    </div>

    <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Ubigeo *</label>
        <input
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.ubigeo ? '5px' : '0' }}
            value={form.ubigeo || ''}
            onChange={(e)=>{
                setForm({ ...form, ubigeo: e.target.value });
                setErrors(prev => ({ ...prev, ubigeo: null }));
            }}
        />
    </div>
</div>

{/* --- GRUPO 5: DIRECCIÓN --- */}
<div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Dirección *</label>
    <textarea
        required
        value={form.direccion}
        onChange={(e)=>{
            setForm({ ...form, direccion: e.target.value });
            setErrors(prev => ({ ...prev, direccion: null }));
        }}
        rows={3}
        style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', resize: 'none', marginBottom: errors.direccion ? '5px' : '0' }}
    />
    {errors.direccion && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.direccion}</span>}
</div>

{/* --- GRUPO 6: ACTIVIDAD ECONÓMICA --- */}
<div style={{ marginBottom: '25px' }}>
    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Actividad Económica (CIIU) *</label>
    <select
        required
        value={form.ciiu || ''}
        onChange={(e)=>{
            setForm({ ...form, ciiu: e.target.value });
            setErrors(prev => ({ ...prev, ciiu: null }));
        }}
        style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', marginBottom: errors.ciiu ? '5px' : '0' }}
    >
        <option value="">Seleccione CIIU</option>
        {ciius.map(item => (
            <option key={item.codigo_valor} value={item.codigo_valor}>
                {item.codigo_valor} - {item.descripcion}
            </option>
        ))}
    </select>
    {errors.ciiu && <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', fontWeight: '500', marginTop: '5px' }}>{errors.ciiu}</span>}
</div>

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


{/* --- SECCIÓN: CLIENTES RECOMENDADOS --- */}
{proveedorEditar ? (
    <div style={{ marginTop: '25px', padding: '20px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '4px', height: '18px', background: '#3b82f6', borderRadius: '2px' }}></span>
            Clientes Recomendados
        </h3>
        
        {clientes.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                        <th style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Razón Social / Nombres</th>
                        <th style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Número RUC</th>
                        <th style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>CIIU</th>
                        <th style={{ padding: '10px 8px', width: '50px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map((c, index) => {
                        const tipoDesc = tiposDocumentoClie.find(td => td.codigo_valor === c.tipo_documento_clie)?.descripcion || c.tipo_documento_clie || '';
                        const ciiuDesc = ciius.find(ci => ci.codigo_valor === c.ciuu_cliente)?.descripcion || c.ciuu_cliente || '';
                        return (
                            <tr key={index} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                <td style={{ padding: '10px 8px', fontSize: '13.5px', color: '#111827', fontWeight: '500' }}>{c.razon_social_nombres_apellidos}</td>
                                <td style={{ padding: '10px 8px', fontSize: '13.5px', color: '#4B5563' }}>{c.nro_documento_clie}</td>
                                <td style={{ padding: '10px 8px', fontSize: '13.5px', color: '#4B5563' }}>{c.ciuu_cliente ? `${c.ciuu_cliente} - ${ciiuDesc}` : ''}</td>
                                <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setClientes(clientes.filter((_, idx) => idx !== index));
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#EF4444',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            padding: '0 5px'
                                        }}
                                        title="Quitar cliente"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        ) : (
            <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '0 0 20px 0', fontStyle: 'italic', background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                Proceda a registrar sus clientes referidos.
            </p>
        )}
        
        <div style={{ background: '#FFFFFF', padding: '20px', border: '1px dashed #D1D5DB', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                REFERENCIA DE CLIENTES:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#4B5563', marginBottom: '4px', fontWeight: '500' }}>Razón Social / Nombre *</label>
                    <input
                        style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                        value={nuevoCliente.razon_social_nombres_apellidos}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, razon_social_nombres_apellidos: e.target.value })}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#4B5563', marginBottom: '4px', fontWeight: '500' }}>Número RUC *</label>
                    <input
                        style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                        value={nuevoCliente.nro_documento_clie}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, nro_documento_clie: e.target.value })}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#4B5563', marginBottom: '4px', fontWeight: '500' }}>CIIU *</label>
                    <select
                        style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
                        value={nuevoCliente.ciuu_cliente}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, ciuu_cliente: e.target.value })}
                    >
                        <option value="">Seleccione...</option>
                        {ciius.map(item => (
                            <option key={item.codigo_valor} value={item.codigo_valor}>
                                {item.codigo_valor} - {item.descripcion}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#4B5563', marginBottom: '4px', fontWeight: '500' }}>Tipo Doc. *</label>
                    <select
                        disabled
                        style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', background: '#f3f4f6', color: '#9ca3af' }}
                        value="06"
                        onChange={() => {}}
                    >
                        <option value="06">RUC</option>
                    </select>
            </div>
            
            {clienteError && (
                <span style={{ color: '#dc2626', fontSize: '12.5px', display: 'block', marginBottom: '12px', fontWeight: '500' }}>
                    {clienteError}
                </span>
            )}
            
            <button
                type="button"
                className="btn-secondary"
                style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
                onMouseOut={(e) => e.target.style.background = '#2563eb'}
                onClick={agregarClienteDirectamente}
            >
                + Guardar Cliente
            </button>
        </div>
    </div>
) : (
    <div style={{
        marginTop: '25px',
        padding: '20px',
        border: '1px dashed #3b82f6',
        borderRadius: '8px',
        background: '#eff6ff',
        color: '#1e40af',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
    }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <span>Para registrar clientes recomendados, primero debe crear y guardar la ficha del proveedor.</span>
    </div>
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
        className="btn-secondary"
        style={{
            marginLeft: '10px'
        }}
        onClick={onClose}
    >
        Cancelar
    </button>

</div>

            </form>

        </div>

    );
	

}