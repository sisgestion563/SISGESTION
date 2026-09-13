const repository =
    require('../repositories/procesos.repository');


const actualizarEstadosDocumentos =
async (
    usuarioId
) => {

    return await repository
        .actualizarEstadosDocumentos(
            usuarioId
        );

};


module.exports = {
    actualizarEstadosDocumentos
};