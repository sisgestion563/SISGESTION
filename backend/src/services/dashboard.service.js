const repository =
require('../repositories/dashboard.repository');

const obtenerResumen = async (periodo, rubro, proveedorId) => {
    return await repository.obtenerResumen(periodo, rubro, proveedorId);
};

const obtenerDocumentosPorGrupo = async (periodo, rubro, proveedorId) => {
    return await repository.obtenerDocumentosPorGrupo(periodo, rubro, proveedorId);
};

const obtenerDocumentosPorEstado = async (periodo, rubro, proveedorId) => {
    return await repository.obtenerDocumentosPorEstado(periodo, rubro, proveedorId);
};

const obtenerProveedoresVencidos = async (periodo, rubro, proveedorId) => {
    return await repository.obtenerProveedoresVencidos(periodo, rubro, proveedorId);
};

const obtenerDocumentosProximosVencer = async (periodo, rubro, proveedorId) => {
    return await repository.obtenerDocumentosProximosVencer(periodo, rubro, proveedorId);
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

const obtenerResumenProveedoresCumplimiento = async (periodo, rubro, proveedorId) => {
    return await repository.obtenerResumenProveedoresCumplimiento(periodo, rubro, proveedorId);
};

const obtenerCumplimientoGlobalPorGestion = async (periodo, rubro, proveedorId) => {
    return await repository.obtenerCumplimientoGlobalPorGestion(periodo, rubro, proveedorId);
};

const obtenerRankingProveedores = async (periodo, rubro, proveedorId) => {
    return await repository.obtenerRankingProveedores(periodo, rubro, proveedorId);
};

const obtenerAlertasConsultor = async (periodo, rubro, proveedorId) => {
    return await repository.obtenerAlertasConsultor(periodo, rubro, proveedorId);
};

module.exports = {
    obtenerResumen,
    obtenerDocumentosPorGrupo,
    obtenerDocumentosPorEstado,
    obtenerProveedoresVencidos,
    obtenerDocumentosProximosVencer,
    obtenerCumplimientoPorGestion,
    obtenerEstadoExpediente,
    obtenerCalificacionProveedor,
    obtenerResumenProveedoresCumplimiento,
    obtenerCumplimientoGlobalPorGestion,
    obtenerRankingProveedores,
    obtenerAlertasConsultor
};