import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const obtenerProveedores =
async () => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.get(
            `${API_URL}/proveedores`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};

export const crearProveedor =
async (proveedor) => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.post(
            `${API_URL}/proveedores`,
            proveedor,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data;

};

export const obtenerProveedorPorId =
async (id) => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.get(
            `${API_URL}/proveedores/${id}`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};

export const actualizarProveedor =
async (
    proveedorId,
    proveedor
) => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.put(
            `${API_URL}/proveedores/${proveedorId}`,
            proveedor,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data;

};

export const buscarProveedor =
async (
    tipo,
    valor
) => {

    const token =
        localStorage.getItem('token');

    const response =
        await axios.get(
            `${API_URL}/proveedores/busqueda/${tipo}/${valor}`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};