const service =
require('../services/proveedores.service');

const listar = async (
    req,
    res
) => {

    try {

        const data =
            await service.listar();

        return res.status(200).json({
            success:true,
            data
        });

    } catch(error) {

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

const obtenerPorId = async (
    req,
    res
) => {

    try {

        const data =
            await service.obtenerPorId(
                req.params.id
            );

        return res.status(200).json({
            success:true,
            data
        });

    } catch(error) {

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

const crear = async (
    req,
    res
) => {

    try {

        const data =
            await service.crear(
                req.body
            );

        return res.status(201).json({
            success:true,
            message:'Proveedor creado correctamente',
            data
        });

    } catch(error) {

        return res.status(400).json({
            success:false,
            message:error.message
        });

    }

};

const misDatos = async (
    req,
    res
) => {

    try {

        const data =
            await service
                .obtenerMisDatos(
                    req.user
                );

        return res.status(200).json({
            success:true,
            data
        });

    }
    catch(error){

        return res.status(400).json({
            success:false,
            message:error.message
        });

    }

};

const actualizar = async (
    req,
    res
) => {

    try {

        await service.actualizar(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success:true,
            message:'Proveedor actualizado correctamente'
        });

    }
    catch(error){

        return res.status(400).json({
            success:false,
            message:error.message
        });

    }

};

const buscarProveedor = async (
    req,
    res
) => {

    try {

        const data =
            await service.buscarProveedor(
                req.params.tipo,
                req.params.valor
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
    listar,
    obtenerPorId,
    crear,
    actualizar,
    misDatos,
	buscarProveedor
};