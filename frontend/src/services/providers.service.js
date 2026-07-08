import api from './api';

export const obtenerProveedores =
async () => {

    const token =
        localStorage.getItem('token');
		

    const response =
        await api.get(
            '/proveedores',
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
        await api.post(
            '/proveedores',
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
        await api.get(
            `/proveedores/${id}`,
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
        await api.put(
            `/proveedores/${proveedorId}`,
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
        await api.get(
            `/proveedores/busqueda/${tipo}/${valor}`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

    return response.data.data;

};