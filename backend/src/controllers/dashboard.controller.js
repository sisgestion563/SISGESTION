const service =
require('../services/dashboard.service');

const resumen =
async (req,res) => {

    try {

        const data =
            await service
                .obtenerResumen(req.query.periodo);

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
                .obtenerDocumentosPorGrupo(req.query.periodo);

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
                .obtenerDocumentosPorEstado(req.query.periodo);

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
                .obtenerProveedoresVencidos(req.query.periodo);

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
                .obtenerDocumentosProximosVencer(req.query.periodo);

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

const cumplimientoPorGestion = async (req, res) => {
    try {
        const { proveedorId } = req.params;
        const data = await service.obtenerCumplimientoPorGestion(proveedorId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const estadoExpediente = async (req, res) => {
    try {
        const { proveedorId } = req.params;
        const data = await service.obtenerEstadoExpediente(proveedorId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const calificacionProveedor = async (req, res) => {
    try {
        const { proveedorId } = req.params;
        const data = await service.obtenerCalificacionProveedor(proveedorId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    resumen,
    documentosPorGrupo,
    documentosPorEstado,
    proveedoresVencidos,
    proximosVencer,
    cumplimientoPorGestion,
    estadoExpediente,
    calificacionProveedor
};