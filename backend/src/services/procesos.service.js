const repository =
require('../repositories/procesos.repository');

const actualizarEstadosDocumentos =
async () => {

    return await repository
        .actualizarEstadosDocumentos();

};

module.exports = {
    actualizarEstadosDocumentos
};