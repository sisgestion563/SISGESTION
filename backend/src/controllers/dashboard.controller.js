const service =
require('../services/dashboard.service');

const resumen =
async (req,res) => {

    try {

        const data =
            await service
                .obtenerResumen();

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

const documentosPorGrupo =
async (req,res) => {

    try {

        const data =
            await service
                .obtenerDocumentosPorGrupo();

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

const documentosPorEstado =
async (req,res) => {

    try {

        const data =
            await service
                .obtenerDocumentosPorEstado();

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

const proveedoresVencidos =
async (req,res) => {

    try {

        const data =
            await service
                .obtenerProveedoresVencidos();

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

const proximosVencer =
async (req,res) => {

    try {

        const data =
            await service
                .obtenerDocumentosProximosVencer();

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
    resumen,
    documentosPorGrupo,
    documentosPorEstado,
    proveedoresVencidos,
    proximosVencer
};