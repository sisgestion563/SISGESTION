const service =
require('../services/dashboard.service');

const extractParams = (req) => {
    const periodo = req.query.periodo;
    const rubro = req.query.rubro || req.query.ciiu;
    const proveedorId = req.query.proveedor_id || req.query.proveedorId;
    return { periodo, rubro, proveedorId };
};

const resumen =
async (req,res) => {

    try {
        const { periodo, rubro, proveedorId } = extractParams(req);
        const data =
            await service
                .obtenerResumen(periodo, rubro, proveedorId);

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
        const { periodo, rubro, proveedorId } = extractParams(req);
        const data =
            await service
                .obtenerDocumentosPorGrupo(periodo, rubro, proveedorId);

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
        const { periodo, rubro, proveedorId } = extractParams(req);
        const data =
            await service
                .obtenerDocumentosPorEstado(periodo, rubro, proveedorId);

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
        const { periodo, rubro, proveedorId } = extractParams(req);
        const data =
            await service
                .obtenerProveedoresVencidos(periodo, rubro, proveedorId);

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
        const { periodo, rubro, proveedorId } = extractParams(req);
        const data =
            await service
                .obtenerDocumentosProximosVencer(periodo, rubro, proveedorId);

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

const proveedoresCumplimiento = async (req, res) => {
    try {
        const { periodo, rubro, proveedorId } = extractParams(req);
        const data = await service.obtenerResumenProveedoresCumplimiento(periodo, rubro, proveedorId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const cumplimientoGlobalGestion = async (req, res) => {
    try {
        const { periodo, rubro, proveedorId } = extractParams(req);
        const data = await service.obtenerCumplimientoGlobalPorGestion(periodo, rubro, proveedorId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const rankingProveedores = async (req, res) => {
    try {
        const { periodo, rubro, proveedorId } = extractParams(req);
        const data = await service.obtenerRankingProveedores(periodo, rubro, proveedorId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const alertasConsultor = async (req, res) => {
    try {
        const { periodo, rubro, proveedorId } = extractParams(req);
        const data = await service.obtenerAlertasConsultor(periodo, rubro, proveedorId);
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
    calificacionProveedor,
    proveedoresCumplimiento,
    cumplimientoGlobalGestion,
    rankingProveedores,
    alertasConsultor
};