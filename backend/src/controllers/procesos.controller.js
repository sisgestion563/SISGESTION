const service =
require('../services/procesos.service');

const actualizarEstadosDocumentos =
async (
    req,
    res
) => {

    try {

        const usuarioId =
            req.user.usuario_id;

        const resultado =
            await service
                .actualizarEstadosDocumentos(
                    usuarioId
                );

        return res.status(200).json({
            ok: true,
            message:
                'Proceso de actualización de estados ejecutado correctamente.',
            data: resultado
        });

    } catch (error) {

        console.error(
            'Error al actualizar estados de documentos:',
            error
        );

        return res.status(500).json({
            ok: false,
            message:
                error.message ||
                'Error al ejecutar el proceso de actualización de estados.'
        });

    }

};

module.exports = {
    actualizarEstadosDocumentos
};