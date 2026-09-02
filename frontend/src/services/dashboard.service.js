import api from './api';

const getHeaders = () => ({

    headers: {

        Authorization:
        `Bearer ${localStorage.getItem('token')}`

    }

});

export const obtenerResumen =
async (periodo) => {

    const response =
        await api.get(
            '/dashboard/resumen',
            {
                ...getHeaders(),
                params: { periodo }
            }
        );

    return response.data.data;

};

export const obtenerDocumentosPorGrupo =
async (periodo) => {

    const response =
        await api.get(
            '/dashboard/documentos-por-grupo',
            {
                ...getHeaders(),
                params: { periodo }
            }
        );

    return response.data.data;

};

export const obtenerDocumentosPorEstado =
async (periodo) => {

    const response =
        await api.get(
            '/dashboard/documentos-por-estado',
            {
                ...getHeaders(),
                params: { periodo }
            }
        );

    return response.data.data;

};

export const obtenerProximosVencer =
async (periodo) => {

    const response =
        await api.get(
            '/dashboard/proximos-vencer',
            {
                ...getHeaders(),
                params: { periodo }
            }
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

export const obtenerResumenProveedoresCumplimiento =
    async (periodo, rubro) => {
        const response = await api.get(
            '/dashboard/proveedores-cumplimiento',
            {
                ...getHeaders(),
                params: { periodo, rubro }
            }
        );
        return response.data.data;
    };

export const obtenerCumplimientoGlobalPorGestion =
    async (periodo, rubro) => {
        const response = await api.get(
            '/dashboard/cumplimiento-global-gestion',
            {
                ...getHeaders(),
                params: { periodo, rubro }
            }
        );
        return response.data.data;
    };

export const obtenerRankingProveedores =
    async (periodo, rubro) => {
        const response = await api.get(
            '/dashboard/consultor-ranking',
            {
                ...getHeaders(),
                params: { periodo, rubro }
            }
        );
        return response.data.data;
    };

export const obtenerAlertasConsultor =
    async (periodo, rubro) => {
        const response = await api.get(
            '/dashboard/consultor-alertas',
            {
                ...getHeaders(),
                params: { periodo, rubro }
            }
        );
        return response.data.data;
    };