const repository =
require('../repositories/catalogos.repository');

const obtenerGrupos = async () => {

    return await repository.obtenerGrupos();

};

const obtenerValores = async (
    codGrupo,
    tipoGrupo
) => {

    return await repository.obtenerValores(
        codGrupo,
        tipoGrupo
    );

};

module.exports = {
    obtenerGrupos,
    obtenerValores
};