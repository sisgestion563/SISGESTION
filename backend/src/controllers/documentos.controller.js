const service =
require('../services/documentos.service');

const listarPorProveedor =
async (req,res) => {

    try {

        const data =
            await service.listarPorProveedor(
                req.params.proveedorId
            );

        return res.status(200).json({
            success:true,
            data
        });

    } catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

const obtenerPorId =
async (req,res) => {

    try {

        const data =
            await service.obtenerPorId(
                req.params.id
            );

        return res.status(200).json({
            success:true,
            data
        });

    } catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

const crear =
async (req,res) => {

    try {

        const data =
            await service.crear(
                req.body
            );

        return res.status(201).json({
            success:true,
            message:'Documento registrado correctamente',
            data
        });

    } catch(error){

        return res.status(400).json({
            success:false,
            message:error.message
        });

    }

};

const actualizar =
async (req,res) => {

    try {

        await service.actualizar(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success:true,
            message:'Documento actualizado correctamente'
        });

    } catch(error){

        return res.status(400).json({
            success:false,
            message:error.message
        });

    }

};

const listarPorGrupo =
async (req,res) => {

    try {

        const data =
            await service.listarPorGrupo(
                req.params.proveedorId,
                req.params.grupo
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
    listarPorProveedor,
    obtenerPorId,
    crear,
    actualizar,
	listarPorGrupo
};