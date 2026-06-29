const service =
require('../services/catalogos.service');

const listarGrupos = async (
    req,
    res
) => {

    try {

        const data =
            await service.obtenerGrupos();

        return res.status(200).json({
            success: true,
            data
        });

    }
    catch(error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const listarValores = async (
    req,
    res
) => {

    try {

        const {
            codGrupo,
            tipoGrupo
        } = req.params;

        const data =
            await service.obtenerValores(
                codGrupo,
                tipoGrupo
            );

        return res.status(200).json({
            success: true,
            data
        });

    }
    catch(error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    listarGrupos,
    listarValores
};