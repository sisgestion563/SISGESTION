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

const validarProveedor = (proveedor) => {
  if (!proveedor.regimen_tributario) {
    throw new Error('El régimen tributario es obligatorio.');
  }
  if (!proveedor.tipo_documento) {
    throw new Error('El tipo de documento es obligatorio.');
  }
  if (!proveedor.nro_documento || !String(proveedor.nro_documento).trim()) {
    throw new Error('El número de documento es obligatorio.');
  }
  if (proveedor.tipo_documento === '06') {
    if (!proveedor.razon_social || !String(proveedor.razon_social).trim()) {
      throw new Error('La razón social es obligatoria.');
    }
    if (!proveedor.representante_legal || !String(proveedor.representante_legal).trim()) {
      throw new Error('El representante legal es obligatorio.');
    }
  } else {
    if (!proveedor.nombre || !String(proveedor.nombre).trim()) {
      throw new Error('El nombre es obligatorio.');
    }
    if (!proveedor.apellido_paterno || !String(proveedor.apellido_paterno).trim()) {
      throw new Error('El apellido paterno es obligatorio.');
    }
    if (!proveedor.apellido_materno || !String(proveedor.apellido_materno).trim()) {
      throw new Error('El apellido materno es obligatorio.');
    }
  }
  if (!proveedor.correo || !String(proveedor.correo).trim()) {
    throw new Error('El correo es obligatorio.');
  }
  if (!proveedor.telefono || !String(proveedor.telefono).trim()) {
    throw new Error('El teléfono es obligatorio.');
  }
  if (!proveedor.ciiu) {
    throw new Error('La actividad económica (CIIU) es obligatoria.');
  }
  if (!proveedor.departamento) {
    throw new Error('El departamento es obligatorio.');
  }
  if (!proveedor.provincia) {
    throw new Error('La provincia es obligatoria.');
  }
  if (!proveedor.ubigeo) {
    throw new Error('El distrito es obligatorio.');
  }
  if (!proveedor.direccion || !String(proveedor.direccion).trim()) {
    throw new Error('La dirección es obligatoria.');
  }
};

const crear = async (
    proveedor
) => {

    validarProveedor(proveedor);

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

    validarProveedor(proveedor);

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
