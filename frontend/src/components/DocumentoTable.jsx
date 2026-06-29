export default function DocumentoTable({

    documentos,
    onAgregar,
    onVer,
    onEditar

}){

    return (

        <>

            <div
                style={{
                    marginBottom:'15px'
                }}
            >

                <button
                    className="btn-primary"
                    onClick={onAgregar}
                >
                    Agregar Documento
                </button>

            </div>

            <table
                className="table"
            >

                <thead>

                    <tr>

                        <th>
                            Tipo Documento
                        </th>

                        <th>
                            Fecha Vigencia
                        </th>

                        <th>
                            Estado
                        </th>

                        <th>
                            Acciones
                        </th>

                    </tr>

                </thead>

                <tbody>

                {
                    documentos.length === 0 ?

                    (

                        <tr>

                            <td
                                colSpan={4}
                                style={{
                                    textAlign:'center'
                                }}
                            >
                                No existen documentos registrados.
                            </td>

                        </tr>

                    )

                    :

                    (

                        documentos.map(
                            documento => (

                                <tr
                                    key={
                                        documento.documento_id
                                    }
                                >

                                    <td>

                                        {
                                            documento.descripcion_tipo_documento ||

                                            documento.tipo_documento
                                        }

                                    </td>

                                    <td>

                                        {
                                            new Date(
                                                documento.fecha_vigencia
                                            ).toLocaleDateString(
                                                'es-PE'
                                            )
                                        }

                                    </td>

                                    <td>

                                        {
                                            documento.estado_documento
                                        }

                                    </td>

                                    <td>

                                        <button
                                            onClick={()=>
                                                onVer(
                                                    documento
                                                )
                                            }
                                        >
                                            Ver
                                        </button>

                                        <button
                                            style={{
                                                marginLeft:'5px'
                                            }}
                                            onClick={()=>
                                                onEditar(
                                                    documento
                                                )
                                            }
                                        >
                                            Editar
                                        </button>

                                    </td>

                                </tr>

                            )
                        )

                    )

                }

                </tbody>

            </table>

        </>

    );

}