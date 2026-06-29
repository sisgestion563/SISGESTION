const repository =
require('../repositories/dashboard.repository');

const obtenerResumen =
async () => {

    return await repository
        .obtenerResumen();

};

const obtenerDocumentosPorGrupo =
async () => {

    return await repository
        .obtenerDocumentosPorGrupo();

};

const obtenerDocumentosPorEstado =
async () => {

    return await repository
        .obtenerDocumentosPorEstado();

};

const obtenerProveedoresVencidos =
async () => {

    return await repository
        .obtenerProveedoresVencidos();

};

const obtenerDocumentosProximosVencer =
async () => {

    return await repository
        .obtenerDocumentosProximosVencer();

};

module.exports = {
    obtenerResumen,
    obtenerDocumentosPorGrupo,
    obtenerDocumentosPorEstado,
    obtenerProveedoresVencidos,
    obtenerDocumentosProximosVencer
};