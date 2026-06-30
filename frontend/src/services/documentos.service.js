import api from './api';

export const listarPorGrupo = async (
    proveedorId,
    grupo
) => {

    const response =
        await api.get(
            `/documentos/proveedor/${proveedorId}/grupo/${grupo}`
        );

    return response.data.data;

};

export const crearDocumento = async (documento) => {

    const response =
        await api.post(
            '/documentos',
            documento
        );

    return response.data;

};

export const actualizarDocumento = async (
    documentoId,
    documento
) => {

    const response =
        await api.put(
            `/documentos/${documentoId}`,
            documento
        );

    return response.data;

};

export const obtenerDocumentoPorId = async (documentoId) => {

    const response =
        await api.get(
            `/documentos/${documentoId}`
        );

    return response.data.data;

};