const pool =
    require('../config/db');


const actualizarEstadosDocumentos =
async (
    usuarioId
) => {

    await pool.query(
        `
        CALL "SISGES"."pr_actualizar_estado_documentos"($1)
        `,
        [
            usuarioId
        ]
    );


    const result =
        await pool.query(
            `
            SELECT
                id_ejecucion,
                nombre_proceso,
                tipo_ejecucion,
                fecha_inicio,
                fecha_fin,
                usuario_id,
                usuario,
                estado_ejecucion,
                total_evaluados,
                total_actualizados,
                observaciones
            FROM "SISGES"."MOV_PROCESOS_EJECUCION"
            WHERE usuario_id = $1
            ORDER BY id_ejecucion DESC
            LIMIT 1
            `,
            [
                usuarioId
            ]
        );


    return result.rows[0] || null;

};


module.exports = {
    actualizarEstadosDocumentos
};