const repository =
require('../repositories/dashboard.repository');

const obtenerResumen =
async (periodo) => {

    return await repository
        .obtenerResumen(periodo);

};

const obtenerDocumentosPorGrupo =
async (periodo) => {

    return await repository
        .obtenerDocumentosPorGrupo(periodo);

};

const obtenerDocumentosPorEstado =
async (periodo) => {

    return await repository
        .obtenerDocumentosPorEstado(periodo);

};

const obtenerProveedoresVencidos =
async (periodo) => {

    return await repository
        .obtenerProveedoresVencidos(periodo);

};

const obtenerDocumentosProximosVencer =
async (periodo) => {

    return await repository
        .obtenerDocumentosProximosVencer(periodo);

};
const obtenerCumplimientoPorGestion = async (proveedorId) => {
    return await repository.obtenerCumplimientoPorGestion(proveedorId);
};

const obtenerEstadoExpediente = async (proveedorId) => {
    return await repository.obtenerEstadoExpediente(proveedorId);
};

const obtenerCalificacionProveedor = async (proveedorId) => {
    return await repository.obtenerCalificacionProveedor(proveedorId);
};

module.exports = {
    obtenerResumen,
    obtenerDocumentosPorGrupo,
    obtenerDocumentosPorEstado,
    obtenerProveedoresVencidos,
    obtenerDocumentosProximosVencer,
    obtenerCumplimientoPorGestion,
    obtenerEstadoExpediente,
    obtenerCalificacionProveedor
};