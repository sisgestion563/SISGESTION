import api from './api';

export const actualizarEstadosDocumentos =
    async () => {

        const response =
            await api.post(
                '/procesos/documentos/actualizarEstadosDocumentos'
            );

        return response.data;

    };