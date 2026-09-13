const pool = require('../config/db');

const obtenerEjecucionesPorFecha = async (
    fechaEjecucion,
    estadoEjecucion
) => {

    const sql = `
        SELECT
            mpe.id_ejecucion,
            mpe.nombre_proceso,
            mpe.tipo_ejecucion,
            mpe.fecha_inicio,
            mpe.fecha_fin,
            mpe.usuario_id,
            mpe.usuario,
            mpe.estado_ejecucion,
            mpe.total_evaluados,
            mpe.total_actualizados,
            mpe.observaciones
        FROM "SISGES"."MOV_PROCESOS_EJECUCION" mpe
        WHERE mpe.fecha_inicio >= $1::date
          AND mpe.fecha_inicio < ($1::date + INTERVAL '1 day')
          AND ($2 = 'ALL' OR mpe.estado_ejecucion = $2)
        ORDER BY mpe.fecha_inicio DESC
    `;

    const result =
        await pool.query(
            sql,
            [fechaEjecucion,
            estadoEjecucion]
        );

    return result.rows;
};


const obtenerDetalleEjecucion = async (
    idEjecucion
) => {

    const sql = `
        SELECT
            phd.proveedor_id,

            CASE
    WHEN mpr.razon_social IS NOT NULL
         AND TRIM(mpr.razon_social) <> ''
    THEN mpr.razon_social
    ELSE TRIM(
        COALESCE(mpr.nombre,'')
        || ' ' ||
        COALESCE(mpr.apellido_paterno,'')
        || ' ' ||
        COALESCE(mpr.apellido_materno,'')
    )
END AS proveedor,
            
            lv_grupo.descripcion AS grupo_documentos,

            lv_alcance.descripcion
                AS alcance,

            COALESCE(
                lv_tipo.descripcion,
                phd.tipo_documento
            ) AS tipo_documento,

            phd.fecha_vigencia,

            lv_estado_actual.descripcion
                AS estado_actual,

            lv_estado_anterior.descripcion
                AS estado_anterior

        FROM "SISGES"."MOV_HIST_DOCUMENTOS" phd

        LEFT JOIN "SISGES"."MAE_PROVEEDOR" mpr
            ON mpr.proveedor_id = phd.proveedor_id
        
        LEFT JOIN "SISGES"."MAE_LISTA_VALORES" lv_grupo
            ON lv_grupo.codigo_valor = phd.grupo_documentos
           AND lv_grupo.cod_grupo = '0005'
           AND lv_grupo.tipo_grupo = 'GRUPO_DOCUMENTO'	    

        LEFT JOIN "SISGES"."MAE_LISTA_VALORES" lv_alcance
            ON lv_alcance.codigo_valor = phd.alcance
           AND lv_alcance.cod_grupo = '0099'
           AND lv_alcance.tipo_grupo = 'TIPO_GESTION'

        LEFT JOIN "SISGES"."MAE_LISTA_VALORES" lv_tipo
            ON lv_tipo.codigo_valor = phd.tipo_documento_id
           AND lv_tipo.cod_grupo = '0001'
           AND lv_tipo.tipo_grupo = 'TIPO_DOC_' || phd.alcance

        LEFT JOIN "SISGES"."MAE_LISTA_VALORES" lv_estado_actual
            ON lv_estado_actual.codigo_valor = phd.estado_actual
           AND lv_estado_actual.cod_grupo = '0000'
           AND lv_estado_actual.tipo_grupo = 'STATUS_DOCUMENTO'

        LEFT JOIN "SISGES"."MAE_LISTA_VALORES" lv_estado_anterior
            ON lv_estado_anterior.codigo_valor = phd.estado_ant
           AND lv_estado_anterior.cod_grupo = '0000'
           AND lv_estado_anterior.tipo_grupo = 'STATUS_DOCUMENTO'

        WHERE phd.id_ejecucion = $1

        ORDER BY
            mpr.razon_social ASC,
            phd.grupo_documentos ASC,
            phd.alcance ASC,
            phd.tipo_documento_id ASC
    `;

    const result =
        await pool.query(
            sql,
            [idEjecucion]
        );

    return result.rows;
};


module.exports = {
    obtenerEjecucionesPorFecha,
    obtenerDetalleEjecucion
};