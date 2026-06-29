import axios from 'axios';

const API_URL =
'http://localhost:3000/api';

export const listarPorGrupo =
async (
    proveedorId,
    grupo
) => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.get(
            `${API_URL}/documentos/proveedor/${proveedorId}/grupo/${grupo}`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};

export const crearDocumento =
async (documento) => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.post(
            `${API_URL}/documentos`,
            documento,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data;

};

export const actualizarDocumento = async (
    documentoId,
    documento
) => {

    const token = localStorage.getItem('token');

    const response = await axios.put(

        `${API_URL}/documentos/${documentoId}`,

        documento,

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.data;

};

export const obtenerDocumentoPorId =
async (documentoId) => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.get(
            `${API_URL}/documentos/${documentoId}`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};