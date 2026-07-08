export default function ModalVerProveedor({
    visible,
    proveedor,
    onClose
}) {

    if (!visible || !proveedor) {
        return null;
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
                    Consulta de Proveedor
                </h2>

                <table
                    style={{
                        width:'100%'
                    }}
                >

                    <tbody>

                        <tr>
                            <td><b>Código</b></td>
                            <td>{proveedor.proveedor_id}</td>
                        </tr>

<td><b>Tipo Documento</b></td>                        
						<td>
        {
            proveedor.tipo_documento
            ?
            `${proveedor.tipo_documento} - ${proveedor.descripcion_tipo_documento || ''}`
            :
            ''
        }
    </td>
						

                        <tr>
                            <td><b>Nro Documento</b></td>
                            <td>{proveedor.nro_documento}</td>
                        </tr>

                        <tr>
                            <td><b>Razón Social</b></td>
                            <td>{proveedor.razon_social}</td>
                        </tr>
						
						<tr>
                            <td><b>Representante Legal</b></td>
                            <td>{proveedor.representante_legal}</td>
                        </tr>

                        <tr>
                            <td><b>Nombres</b></td>
                            <td>{proveedor.nombre}</td>
                        </tr>

                        <tr>
                            <td><b>Apellido Paterno</b></td>
                            <td>{proveedor.apellido_paterno}</td>
                        </tr>

                        <tr>
                            <td><b>Apellido Materno</b></td>
                            <td>{proveedor.apellido_materno}</td>
                        </tr>

                        <tr>
                            <td><b>Correo</b></td>
                            <td>{proveedor.correo}</td>
                        </tr>

                        <tr>
                            <td><b>Teléfono</b></td>
                            <td>{proveedor.telefono}</td>
                        </tr>
						
                        <tr>
                            <td><b>Departamento</b></td>
                            <td>{proveedor.departamento}</td>
                        </tr>

                        <tr>
                            <td><b>Provincia</b></td>
                            <td>{proveedor.provincia}</td>
                        </tr>

                        <tr>
                            <td><b>Ciudad</b></td>
                            <td>{proveedor.ciudad}</td>
                        </tr>

						<tr>
                            <td><b>Ubigeo</b></td>
                            <td>{proveedor.ubigeo}</td>
                        </tr>

                        <tr>
                            <td><b>Dirección</b></td>
                            <td>{proveedor.direccion}</td>
                        </tr>
												

                        <tr>
    <td>
        <b>CIIU</b>
    </td>

    <td>
        {
            proveedor.ciiu
        } - {
            proveedor.descripcion_ciiu
        }
    </td>
</tr>

<tr>
    <td>
        <b>Estado</b>
    </td>

    <td>
        {
            proveedor.status
        } - {
            proveedor.descripcion_status_prov
        }
    </td>
</tr>
                    </tbody>

                </table>

                <div
                    style={{
                        marginTop:'20px'
                    }}
                >

                    <button
                        className="btn-primary"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>

                </div>

            </div>

        </div>

    );

}