const pool = require('../config/db');

const actualizarEstadosDocumentos =
async () => {

    const vencidosSql = `
        UPDATE "SISGES"."MOV_DOCUMENTOS"
        SET estado_documento = 'C',
            last_update = CURRENT_DATE
        WHERE fecha_vigencia <= CURRENT_DATE
        AND estado_documento <> 'C'
        AND status = 'A'
    `;

    const vigentesSql = `
        UPDATE "SISGES"."MOV_DOCUMENTOS"
        SET estado_documento = 'V',
            last_update = CURRENT_DATE
        WHERE fecha_vigencia > CURRENT_DATE
        AND estado_documento <> 'V'
        AND status = 'A'
    `;

    const vencidos =
        await pool.query(vencidosSql);

    const vigentes =
        await pool.query(vigentesSql);

    return {
        vencidos:
            vencidos.rowCount,
        vigentes:
            vigentes.rowCount
    };

};

module.exports = {
    actualizarEstadosDocumentos
};