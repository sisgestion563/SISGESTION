export default function ModalVerProveedor({
    visible,
    proveedor,
    onClose
}) {

    if (!visible || !proveedor) {
        return null;
    }

    const esEmpresa = proveedor.tipo_documento === '06' || proveedor.tipo_documento === 'RUC';

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

                        {proveedor.periodo && (
                            <tr>
                                <td><b>Periodo</b></td>
                                <td>{proveedor.periodo}</td>
                            </tr>
                        )}

                        <tr>
                            <td><b>Tipo Empresa</b></td>
                            <td>
                                {
                                    proveedor.codigo_regimen_tributario || proveedor.regimen_tributario
                                    ? `${proveedor.codigo_regimen_tributario || proveedor.regimen_tributario} - ${proveedor.descripcion_regimen_tributario || ''}`
                                    : (proveedor.descripcion_regimen_tributario || proveedor.regimen_tributario || '')
                                }
                            </td>
                        </tr>

                        <tr>
                            <td><b>Nro. Trabajadores</b></td>
                            <td>
                                {
                                    proveedor.nro_trabajadores
                                    ? `${proveedor.nro_trabajadores} - ${proveedor.descripcion_nro_trabajadores || ''}`
                                    : (proveedor.descripcion_nro_trabajadores || proveedor.nro_trabajadores || '')
                                }
                            </td>
                        </tr>

                        <tr>
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
                        </tr>

                        <tr>
                            <td><b>Nro Documento</b></td>
                            <td>{proveedor.nro_documento}</td>
                        </tr>

                        {esEmpresa ? (
                            <tr>
                                <td><b>Razón Social</b></td>
                                <td>{proveedor.razon_social}</td>
                            </tr>
                        ) : (
                            <>
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
                            </>
                        )}

                        <tr>
                            <td><b>Correo</b></td>
                            <td>{proveedor.correo}</td>
                        </tr>

                        <tr>
                            <td><b>Teléfono</b></td>
                            <td>{proveedor.telefono}</td>
                        </tr>

                        <tr>
                            <td><b>Página Web</b></td>
                            <td>{proveedor.pagina_web}</td>
                        </tr>

                        {esEmpresa && (
                            <tr>
                                <td><b>Nombre del Contacto</b></td>
                                <td>{proveedor.representante_legal}</td>
                            </tr>
                        )}

                        <tr>
                            <td><b>Departamento</b></td>
                            <td>{proveedor.departamento}</td>
                        </tr>

                        <tr>
                            <td><b>Provincia</b></td>
                            <td>{proveedor.provincia}</td>
                        </tr>

                        <tr>
                            <td><b>Distrito / Ciudad</b></td>
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
                            <td><b>CIIU</b></td>
                            <td>
                                {proveedor.ciiu} - {proveedor.descripcion_ciiu}
                            </td>
                        </tr>

                        <tr>
                            <td><b>Estado Proveedor</b></td>
                            <td>
                                {proveedor.status} - {proveedor.descripcion_status_prov}
                            </td>
                        </tr>

                    </tbody>

                </table>

                {/* --- SECCIÓN: CLIENTES RECOMENDADOS (SÓLO LECTURA) --- */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '15px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                        Clientes Recomendados
                    </h3>
                    {proveedor.clientes && proveedor.clientes.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                                    <th style={{ padding: '6px', fontWeight: '600', color: '#374151' }}>Tipo Doc.</th>
                                    <th style={{ padding: '6px', fontWeight: '600', color: '#374151' }}>Nro. Doc.</th>
                                    <th style={{ padding: '6px', fontWeight: '600', color: '#374151' }}>Razón Social / Nombre</th>
                                    <th style={{ padding: '6px', fontWeight: '600', color: '#374151' }}>CIIU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proveedor.clientes.map((c, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '6px', color: '#4B5563' }}>{c.descripcion_tipo_documento || c.tipo_documento_clie}</td>
                                        <td style={{ padding: '6px', color: '#4B5563' }}>{c.nro_documento_clie}</td>
                                        <td style={{ padding: '6px', color: '#111827', fontWeight: '500' }}>{c.razon_social_nombres_apellidos}</td>
                                        <td style={{ padding: '6px', color: '#4B5563' }}>{c.ciuu_cliente} - {c.descripcion_ciiu || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic', margin: 0 }}>
                            No hay clientes recomendados registrados.
                        </p>
                    )}
                </div>

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