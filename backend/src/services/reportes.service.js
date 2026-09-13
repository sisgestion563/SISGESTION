const reportesRepository =
    require('../repositories/reportes.repository');


const obtenerReporteDocumentos = async (
    fechaEjecucion,
    estadoEjecucion,
    incluirDetalle
) => {

    const ejecuciones =
        await reportesRepository.obtenerEjecucionesPorFecha(
            fechaEjecucion,
            estadoEjecucion
        );

    if (incluirDetalle === 'S') {

        for (const ejecucion of ejecuciones) {

            ejecucion.detalle =
                await reportesRepository.obtenerDetalleEjecucion(
                    ejecucion.id_ejecucion
                );
        }
    }

    return ejecuciones;
};


module.exports = {
    obtenerReporteDocumentos
};