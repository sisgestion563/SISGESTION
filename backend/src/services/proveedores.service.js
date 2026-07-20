const repository = require('../repositories/proveedores.repository');
const pool       = require('../config/db');

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

    // 1. Crear la ficha en MAE_PROVEEDOR y obtener el nuevo proveedor_id
    const nuevaFicha = await repository.crear(proveedor);
    const nuevoProveedorId = nuevaFicha?.proveedor_id;

    // 2. Si el request trae usuario_id, asociar el proveedor recién creado
    //    en SEG_USUARIO para que el JWT futuro lo lleve correctamente
    if (nuevoProveedorId && proveedor.usuario_id) {
        await pool.query(
            `UPDATE "SISGES"."SEG_USUARIO"
             SET proveedor_id = $1
             WHERE usuario_id = $2`,
            [nuevoProveedorId, proveedor.usuario_id]
        );
    }

    return nuevaFicha;

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
