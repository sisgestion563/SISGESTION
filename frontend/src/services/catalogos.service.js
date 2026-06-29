import axios from 'axios';

const API_URL =
'http://localhost:3000/api';

export const obtenerCatalogo =
async (
    codGrupo,
    tipoGrupo
) => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.get(
            `${API_URL}/catalogos/${codGrupo}/${tipoGrupo}`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};