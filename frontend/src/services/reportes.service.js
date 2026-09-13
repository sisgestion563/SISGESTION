import api from './api';


export const obtenerReporteDocumentos = async (
    fechaEjecucion,
    estado,
    incluirDetalle
) => {

    const response =
        await api.post(
            '/reportes/documentos',
            {
                fecha_ejecucion: fechaEjecucion,
                estado: estado,
                incluir_detalle: incluirDetalle
            }
        );

    return response.data;
};