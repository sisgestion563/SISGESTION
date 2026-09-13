const reportesService =
    require('../services/reportes.service');


const obtenerReporteDocumentos = async (
    req,
    res
) => {

    try {

        const {
            fecha_ejecucion,
            estado,
            incluir_detalle
        } = req.body;


        if (!fecha_ejecucion) {

            return res.status(400).json({
                ok: false,
                message: 'La fecha de ejecución es obligatoria.'
            });

        }

        if (
    !estado ||
    !['ALL', 'OK', 'ERROR'].includes(estado)
) {

    return res.status(400).json({
        ok: false,
        message: 'El campo estado debe ser ALL, OK o ERROR.'
    });

}


        if (
            !incluir_detalle ||
            !['S', 'N'].includes(incluir_detalle)
        ) {

            return res.status(400).json({
                ok: false,
                message: 'El campo incluir_detalle debe ser S o N.'
            });

        }


        const resultado =
            await reportesService.obtenerReporteDocumentos(
                fecha_ejecucion,
                estado,
                incluir_detalle
            );


        return res.status(200).json({
            ok: true,
            data: resultado
        });

    } catch (error) {

        console.error(
            'Error al obtener reporte de documentos:',
            error
        );

        return res.status(500).json({
            ok: false,
            message: 'Error interno al obtener el reporte de documentos.'
        });

    }
};


module.exports = {
    obtenerReporteDocumentos
};