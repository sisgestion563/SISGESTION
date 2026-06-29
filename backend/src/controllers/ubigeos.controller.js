const service =
require('../services/ubigeos.service');

const listarDepartamentos =
async (req,res) => {

    try {

        const data =
            await service
                .obtenerDepartamentos();

        return res.status(200).json({
            success:true,
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

const listarProvincias =
async (req,res) => {

    try {

        const {
            departamento
        } = req.params;

        const data =
            await service
                .obtenerProvincias(
                    departamento
                );

        return res.status(200).json({
            success:true,
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

const listarDistritos =
async (req,res) => {

    try {

        const {
            departamento,
            provincia
        } = req.params;

        const data =
            await service
                .obtenerDistritos(
                    departamento,
                    provincia
                );

        return res.status(200).json({
            success:true,
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
    listarDepartamentos,
    listarProvincias,
    listarDistritos
};