const repository = require('../repositories/proveedores.repository');
const pool = require('../config/db');

const listar = async (
    campo = 'ALL',
    valor = ''
) => {

    return await repository.listar(
        campo,
        valor
    );

};

const obtenerPorId = async (
    proveedorId
) => {

    return await repository.obtenerPorId(
        proveedorId
    );

};

const crear = async (
    proveedor
) => {

    const existe =
        await repository.existeProveedor(
            proveedor.tipo_documento,
            proveedor.nro_documento
        );

    if (existe) {

        throw new Error(
            'Ya existe un proveedor registrado con ese tipo y número de documento.'
        );

    }

    return await repository.crear(
        proveedor
    );

};

const actualizar = async (
    proveedorId,
    proveedor
) => {

    return await repository.actualizar(
        proveedorId,
        proveedor
    );

};

const obtenerMisDatos = async (
    usuario
) => {

    if (!usuario.proveedor_id) {

        throw new Error(
            'El usuario no tiene un proveedor asociado.'
        );

    }

    return await repository.obtenerPorUsuario(
        usuario.proveedor_id
    );

};

const buscarProveedor = async (
    tipo,
    valor
) => {

    return await repository.buscarProveedor(
        tipo,
        valor
    );

};

module.exports = {

    listar,
    obtenerPorId,
    crear,
    actualizar,
    obtenerMisDatos,
    buscarProveedor

};
