const repository =
require('../repositories/proveedores.repository');

const listar = async () => {

    return await repository.listar();

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
            'El proveedor ya se encuentra registrado'
        );

    }

    if (
        proveedor.tipo_documento === '06'
    ) {

        if (
            !proveedor.razon_social ||
            !proveedor.representante_legal
        ) {

            throw new Error(
                'Razon Social y Representante Legal son obligatorios para RUC'
            );

        }

    } else {

        if (
            !proveedor.nombre ||
            !proveedor.apellido_paterno
        ) {

            throw new Error(
                'Nombre y Apellido Paterno son obligatorios'
            );

        }

    }

    return await repository.crear(
        proveedor
    );

};

const obtenerMisDatos =
async (user) => {

    if (
        !user.proveedor_id
    ) {

        throw new Error(
            'Usuario no asociado a proveedor'
        );

    }

    return await repository
        .obtenerPorUsuario(
            user.proveedor_id
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