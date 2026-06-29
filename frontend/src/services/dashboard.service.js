import axios from 'axios';

const API_URL =
'http://localhost:3000/api';

export const obtenerResumen =
async () => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.get(
            `${API_URL}/dashboard/resumen`,
            {
                headers: {
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};

export const obtenerDocumentosPorGrupo =
async () => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.get(
            `${API_URL}/dashboard/documentos-por-grupo`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};

export const obtenerDocumentosPorEstado =
async () => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.get(
            `${API_URL}/dashboard/documentos-por-estado`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};

export const obtenerProximosVencer =
async () => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.get(
            `${API_URL}/dashboard/proximos-vencer`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};