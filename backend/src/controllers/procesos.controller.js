const service =
require('../services/procesos.service');

const actualizarDocumentos =
async (req,res) => {

    try {

        const data =
            await service
                .actualizarEstadosDocumentos();

        return res.status(200).json({
            success:true,
            message:
                'Proceso ejecutado correctamente',
            data
        });

    }
    catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

module.exports = {
    actualizarDocumentos
};