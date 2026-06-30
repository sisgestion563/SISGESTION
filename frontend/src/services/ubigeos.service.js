import api from './api';

export const obtenerDepartamentos =
async () => {

    const response =
        await api.get(
            '/ubigeos/departamentos'
        );

    return response.data.data;

};

export const obtenerProvincias =
async (departamento) => {

    const response =
        await api.get(
            `/ubigeos/provincias/${departamento}`
        );

    return response.data.data;

};

export const obtenerDistritos =
async (
    departamento,
    provincia
) => {

    const response =
        await api.get(
            `/ubigeos/distritos/${departamento}/${provincia}`
        );

    return response.data.data;

};