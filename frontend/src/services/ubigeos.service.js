import axios from 'axios';

const API_URL =
'http://localhost:3000/api';

const getToken = () => {

    return {
        headers:{
            Authorization:
            `Bearer ${
                localStorage.getItem(
                    'token'
                )
            }`
        }
    };

};

export const obtenerDepartamentos =
async () => {

    const response =
        await axios.get(
            `${API_URL}/ubigeos/departamentos`,
            getToken()
        );

    return response.data.data;

};

export const obtenerProvincias =
async (departamento) => {

    const response =
        await axios.get(
            `${API_URL}/ubigeos/provincias/${departamento}`,
            getToken()
        );

    return response.data.data;

};

export const obtenerDistritos =
async (
    departamento,
    provincia
) => {

    const response =
        await axios.get(
            `${API_URL}/ubigeos/distritos/${departamento}/${provincia}`,
            getToken()
        );

    return response.data.data;

};