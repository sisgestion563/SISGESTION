const repository =
require('../repositories/ubigeos.repository');

const obtenerDepartamentos =
async () => {

    return await repository
        .obtenerDepartamentos();

};

const obtenerProvincias =
async (departamento) => {

    return await repository
        .obtenerProvincias(
            departamento
        );

};

const obtenerDistritos =
async (
    departamento,
    provincia
) => {

    return await repository
        .obtenerDistritos(
            departamento,
            provincia
        );

};

module.exports = {
    obtenerDepartamentos,
    obtenerProvincias,
    obtenerDistritos
};