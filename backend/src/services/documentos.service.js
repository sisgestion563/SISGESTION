const repository =
require('../repositories/documentos.repository');

const {
    calcularEstadoDocumento
} = require('../utils/documento.utils');

const listarPorProveedor =
async (proveedorId) => {

    return await repository
        .listarPorProveedor(
            proveedorId
        );
};

const obtenerPorId =
async (documentoId) => {

    return await repository
        .obtenerPorId(
            documentoId
        );
};

const crear =
async (documento) => {

    if (!documento.grupo_documentos) {

        throw new Error(
            'Grupo Documento es obligatorio'
        );
    }

    if (!documento.fecha_vigencia) {

        throw new Error(
            'Fecha Vigencia es obligatoria'
        );
    }

    switch(documento.grupo_documentos){

        case 'DOC_NOR':

            if(!documento.tipo_documento_id){

                throw new Error(
                    'Tipo Documento es obligatorio para Documentos Normativos'
                );

            }

            break;

        case 'DOC_EXT_NOR':
        case 'DOC_REQ_ESTATAL':
        case 'DOC_OTROS':

            if(!documento.tipo_documento){

                throw new Error(
                    'Tipo Documento es obligatorio'
                );

            }

            break;

    }

    documento.estado_documento =
        calcularEstadoDocumento(
            documento.fecha_vigencia
        );

    return await repository.crear(
        documento
    );
};

const actualizar = async (
    documentoId,
    documento
) => {

    if (!documento.alcance) {
        throw new Error(
            'El Alcance es obligatorio'
        );
    }

    documento.estado_documento =
        calcularEstadoDocumento(
            documento.fecha_vigencia
        );

    await repository.actualizar(
        documentoId,
        documento
    );

};

const listarPorGrupo =
async (
    proveedorId,
    grupo
) => {

    return await repository
        .listarPorGrupo(
            proveedorId,
            grupo
        );

};

module.exports = {
    listarPorProveedor,
    obtenerPorId,
    crear,
    actualizar,
	listarPorGrupo
};