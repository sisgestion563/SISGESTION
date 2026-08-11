import api from './api';

const getHeaders = () => ({

    headers: {

        Authorization:
        `Bearer ${localStorage.getItem('token')}`

    }

});

export const obtenerResumen =
async () => {

    const response =
        await api.get(
            '/dashboard/resumen',
            getHeaders()
        );

    return response.data.data;

};

export const obtenerDocumentosPorGrupo =
async () => {

    const response =
        await api.get(
            '/dashboard/documentos-por-grupo',
            getHeaders()
        );

    return response.data.data;

};

export const obtenerDocumentosPorEstado =
async () => {

    const response =
        await api.get(
            '/dashboard/documentos-por-estado',
            getHeaders()
        );

    return response.data.data;

};

export const obtenerProximosVencer =
async () => {

    const response =
        await api.get(
            '/dashboard/proximos-vencer',
            getHeaders()
        );

    return response.data.data;

};

export const obtenerCumplimientoGestion =
    async (proveedorId) => {
        const response = await api.get(
            `/dashboard/cumplimiento-gestion/${proveedorId}`,
            getHeaders()
        );
        return response.data.data;
    };

export const obtenerEstadoExpediente =
    async (proveedorId) => {
        const response = await api.get(
            `/dashboard/estado-expediente/${proveedorId}`,
            getHeaders()
        );
        return response.data.data;
    };

export const obtenerCalificacionProveedor =
    async (proveedorId) => {
        const response = await api.get(
            `/dashboard/calificacion-proveedor/${proveedorId}`,
            getHeaders()
        );
        return response.data.data;
    };