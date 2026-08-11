const pool = require('../config/db');

const obtenerResumen = async () => {

    const sql = `
        SELECT
            (
                SELECT COUNT(*)
                FROM "SISGES"."MAE_PROVEEDOR"
                WHERE status = 'A'
            ) total_proveedores,

            (
                SELECT COUNT(*)
                FROM "SISGES"."MOV_DOCUMENTOS"
                WHERE status = 'A'
            ) total_documentos,

            (
                SELECT COUNT(*)
                FROM "SISGES"."MOV_DOCUMENTOS"
                WHERE fecha_vigencia >= CURRENT_DATE
                AND status = 'A'
            ) documentos_vigentes,

            (
                SELECT COUNT(*)
                FROM "SISGES"."MOV_DOCUMENTOS"
                WHERE fecha_vigencia < CURRENT_DATE
                AND status = 'A'
            ) documentos_vencidos
    `;

    const result =
        await pool.query(sql);

    return result.rows[0];

};

const obtenerDocumentosPorGrupo = async () => {

    const sql = `
        SELECT
    d.grupo_documentos,
    lv.descripcion,
    COUNT(*) cantidad
FROM "SISGES"."MOV_DOCUMENTOS" d
JOIN "SISGES"."MAE_LISTA_VALORES" lv
    ON lv.codigo_valor = d.grupo_documentos
   AND lv.cod_grupo = '0005'
   AND lv.tipo_grupo = 'GRUPO_DOCUMENTO'
WHERE d.status = 'A'
GROUP BY
    d.grupo_documentos,
    lv.descripcion
ORDER BY lv.descripcion
    `;

    const result =
        await pool.query(sql);

    return result.rows;
};

const obtenerDocumentosPorEstado = async () => {

    const sql = `
        SELECT
            d.estado_documento,
            lv.descripcion,
            COUNT(*) cantidad
        FROM "SISGES"."MOV_DOCUMENTOS" d
        INNER JOIN "SISGES"."MAE_LISTA_VALORES" lv
            ON lv.codigo_valor = d.estado_documento
           AND lv.cod_grupo = '0000'
           AND lv.tipo_grupo = 'STATUS_DOCUMENTO'
        WHERE d.status = 'A'
        GROUP BY
            d.estado_documento,
            lv.descripcion
        ORDER BY
            d.estado_documento
    `;

    const result =
        await pool.query(sql);

    return result.rows;
};

const obtenerProveedoresVencidos = async () => {

    const sql = `
        SELECT
            p.proveedor_id,

            CASE
                WHEN p.razon_social IS NOT NULL
                 AND TRIM(p.razon_social) <> ''
                THEN p.razon_social
                ELSE
                    TRIM(
                        COALESCE(p.nombre,'') || ' ' ||
                        COALESCE(p.apellido_paterno,'') || ' ' ||
                        COALESCE(p.apellido_materno,'')
                    )
            END proveedor,

            COUNT(*) documentos_vencidos

        FROM "SISGES"."MOV_DOCUMENTOS" d
        INNER JOIN "SISGES"."MAE_PROVEEDOR" p
            ON p.proveedor_id = d.proveedor_id

        WHERE d.estado_documento = 'C'
        AND d.status = 'A'

        GROUP BY
            p.proveedor_id,
            p.razon_social,
            p.nombre,
            p.apellido_paterno,
            p.apellido_materno

        ORDER BY
            documentos_vencidos DESC,
            proveedor
		LIMIT 10	

    `;

    const result =
        await pool.query(sql);

    return result.rows;
};

const obtenerDocumentosProximosVencer = async () => {

    const sql = `
        SELECT
            d.documento_id,

            CASE
                WHEN p.razon_social IS NOT NULL
                 AND TRIM(p.razon_social) <> ''
                THEN p.razon_social
                ELSE
                    TRIM(
                        COALESCE(p.nombre,'') || ' ' ||
                        COALESCE(p.apellido_paterno,'') || ' ' ||
                        COALESCE(p.apellido_materno,'')
                    )
            END proveedor,

            d.grupo_documentos,

            COALESCE(
                d.tipo_documento,
                d.tipo_documento_id
            ) tipo_documento,

            d.fecha_vigencia,

            (
                d.fecha_vigencia - CURRENT_DATE
            ) dias_restantes

        FROM "SISGES"."MOV_DOCUMENTOS" d

        INNER JOIN "SISGES"."MAE_PROVEEDOR" p
            ON p.proveedor_id = d.proveedor_id

        WHERE d.status = 'A'

        AND d.fecha_vigencia > CURRENT_DATE

        AND d.fecha_vigencia <=
            CURRENT_DATE + 30

        ORDER BY
            d.fecha_vigencia
    `;

    const result =
        await pool.query(sql);

    return result.rows;
};

const obtenerCumplimientoPorGestion = async (proveedorId) => {
    const sql = `
WITH proveedor_info AS (
    SELECT 
        proveedor_id, 
        regimen_tributario,
        CASE 
            WHEN regimen_tributario = 'RG' THEN 12
            WHEN regimen_tributario = 'RP' THEN 10
            WHEN regimen_tributario = 'RM' THEN 7
            ELSE NULL
        END as exigible_sst_ma,
        1 as exigible_calidad,
        1 as exigible_patrimonial,
        1 as exigible_etica
    FROM "SISGES"."MAE_PROVEEDOR"
    WHERE proveedor_id = $1
),
doc_counts AS (
    SELECT
        p.proveedor_id,
        COUNT(DISTINCT CASE WHEN d.alcance IN ('GSG', 'GMA') THEN d.tipo_documento_id END) as docs_sst_ma,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GCA' THEN d.tipo_documento_id END) as docs_calidad,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GPA' THEN d.tipo_documento_id END) as docs_patrimonial,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GTR' THEN d.tipo_documento_id END) as docs_etica
    FROM proveedor_info p
    LEFT JOIN "SISGES"."MOV_DOCUMENTOS" d 
      ON p.proveedor_id = d.proveedor_id AND d.status = 'A'
    GROUP BY p.proveedor_id
)
SELECT 
    'SST / MA' as gestion, COALESCE(c.docs_sst_ma, 0) as documentos_registrados, p.exigible_sst_ma as documentos_exigibles,
    ROUND(LEAST((COALESCE(c.docs_sst_ma, 0)::numeric / NULLIF(p.exigible_sst_ma, 0)) * 100, 100), 2) as porcentaje
FROM proveedor_info p LEFT JOIN doc_counts c ON p.proveedor_id = c.proveedor_id
UNION ALL
SELECT 
    'CALIDAD', COALESCE(c.docs_calidad, 0), p.exigible_calidad,
    ROUND(LEAST((COALESCE(c.docs_calidad, 0)::numeric / NULLIF(p.exigible_calidad, 0)) * 100, 100), 2)
FROM proveedor_info p LEFT JOIN doc_counts c ON p.proveedor_id = c.proveedor_id
UNION ALL
SELECT 
    'PATRIMONIAL', COALESCE(c.docs_patrimonial, 0), p.exigible_patrimonial,
    ROUND(LEAST((COALESCE(c.docs_patrimonial, 0)::numeric / NULLIF(p.exigible_patrimonial, 0)) * 100, 100), 2)
FROM proveedor_info p LEFT JOIN doc_counts c ON p.proveedor_id = c.proveedor_id
UNION ALL
SELECT 
    'ETICA', COALESCE(c.docs_etica, 0), p.exigible_etica,
    ROUND(LEAST((COALESCE(c.docs_etica, 0)::numeric / NULLIF(p.exigible_etica, 0)) * 100, 100), 2)
FROM proveedor_info p LEFT JOIN doc_counts c ON p.proveedor_id = c.proveedor_id;
    `;
    const result = await pool.query(sql, [proveedorId]);
    return result.rows;
};

const obtenerEstadoExpediente = async (proveedorId) => {
    const sql = `
WITH proveedor_info AS (
    SELECT 
        proveedor_id, 
        CASE 
            WHEN regimen_tributario = 'RG' THEN 12
            WHEN regimen_tributario = 'RP' THEN 10
            WHEN regimen_tributario = 'RM' THEN 7
            ELSE 12
        END as exigible_sst,
        1 as exigible_ma,
        1 as exigible_calidad,
        1 as exigible_patrimonial,
        1 as exigible_etica,
        CASE 
            WHEN regimen_tributario = 'RG' THEN 16
            WHEN regimen_tributario = 'RP' THEN 14
            WHEN regimen_tributario = 'RM' THEN 11
            ELSE 16
        END as total_exigibles
    FROM "SISGES"."MAE_PROVEEDOR"
    WHERE proveedor_id = $1
),
doc_counts AS (
    SELECT
        p.proveedor_id,
        p.total_exigibles,
        
        -- Conteo de registros (cualquier estado, activos)
        COUNT(DISTINCT CASE WHEN d.alcance = 'GSG' THEN d.tipo_documento_id END) as reg_sst,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GMA' THEN d.tipo_documento_id END) as reg_ma,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GCA' THEN d.tipo_documento_id END) as reg_calidad,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GPA' THEN d.tipo_documento_id END) as reg_patrimonial,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GTR' THEN d.tipo_documento_id END) as reg_etica,

        -- Conteo de vigentes (activos y fecha_vigencia >= hoy)
        COUNT(DISTINCT CASE WHEN d.alcance = 'GSG' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as vig_sst,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GMA' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as vig_ma,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GCA' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as vig_calidad,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GPA' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as vig_patrimonial,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GTR' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as vig_etica,

        -- Absolutos para botones
        COUNT(d.documento_id) FILTER (WHERE d.fecha_vigencia < CURRENT_DATE) AS vencidos_abs,
        COUNT(d.documento_id) FILTER (WHERE d.fecha_vigencia >= CURRENT_DATE AND d.fecha_vigencia <= CURRENT_DATE + INTERVAL '7 days') AS por_vencer_abs,
        COUNT(d.documento_id) FILTER (WHERE d.fecha_vigencia >= CURRENT_DATE) AS vigentes_abs
    FROM proveedor_info p
    LEFT JOIN "SISGES"."MOV_DOCUMENTOS" d 
        ON p.proveedor_id = d.proveedor_id AND d.status = 'A'
    GROUP BY p.proveedor_id, p.total_exigibles
),
capped_counts AS (
    SELECT
        c.proveedor_id,
        c.total_exigibles,
        c.vencidos_abs as vencidos,
        c.por_vencer_abs as por_vencer,
        c.vigentes_abs as vigentes, -- OJO: Esto es para el botón "ESTADO DE MI EXPEDIENTE"
        
        -- Suma de registrados capeados por categoría
        LEAST(c.reg_sst, p.exigible_sst) +
        LEAST(c.reg_ma, p.exigible_ma) +
        LEAST(c.reg_calidad, p.exigible_calidad) +
        LEAST(c.reg_patrimonial, p.exigible_patrimonial) +
        LEAST(c.reg_etica, p.exigible_etica) AS total_registrados_capped,

        -- Suma de vigentes capeados por categoría (usado para porcentaje)
        LEAST(c.vig_sst, p.exigible_sst) +
        LEAST(c.vig_ma, p.exigible_ma) +
        LEAST(c.vig_calidad, p.exigible_calidad) +
        LEAST(c.vig_patrimonial, p.exigible_patrimonial) +
        LEAST(c.vig_etica, p.exigible_etica) AS total_vigentes_capped

    FROM doc_counts c
    JOIN proveedor_info p ON c.proveedor_id = p.proveedor_id
)
SELECT 
    vencidos,
    por_vencer,
    total_vigentes_capped AS vigentes_para_porcentaje, 
    vigentes,
    total_exigibles,
    total_registrados_capped AS total_registrados,
    GREATEST(total_exigibles - total_registrados_capped, 0) AS pendientes
FROM capped_counts;
    `;
    const result = await pool.query(sql, [proveedorId]);
    return result.rows[0];
};

const obtenerCalificacionProveedor = async (proveedorId) => {
    const sql = `
WITH doc_vigentes AS (
    SELECT 
        prov.proveedor_id,
        prov.regimen_tributario,
        COUNT(DISTINCT docu.tipo_documento_id) AS cantidad_documentos_vigentes
    FROM "SISGES"."MAE_PROVEEDOR" prov
    LEFT JOIN "SISGES"."MOV_DOCUMENTOS" docu 
        ON prov.proveedor_id = docu.proveedor_id 
        AND docu.status = 'A'
        AND docu.fecha_vigencia >= CURRENT_DATE
    WHERE prov.regimen_tributario IS NOT NULL
      AND prov.proveedor_id = $1
    GROUP BY prov.proveedor_id, prov.regimen_tributario
),
evaluacion AS (
    SELECT 
        proveedor_id,
        regimen_tributario,
        cantidad_documentos_vigentes,
        CASE regimen_tributario
            WHEN 'RG' THEN LEAST((cantidad_documentos_vigentes / 16.0) * 100, 100)
            WHEN 'RP' THEN LEAST((cantidad_documentos_vigentes / 14.0) * 100, 100)
            WHEN 'RM' THEN LEAST((cantidad_documentos_vigentes / 11.0) * 100, 100)
            ELSE 0
        END AS puntaje_raw
    FROM doc_vigentes
)
SELECT 
    proveedor_id,
    regimen_tributario,
    cantidad_documentos_vigentes,
    CAST(ROUND(puntaje_raw, 0) AS VARCHAR) || ' / 100' AS puntaje_formateado,
    ROUND(puntaje_raw, 0) AS puntaje_numerico,
    CASE 
        WHEN puntaje_raw > 90 THEN 'RECOMENDADO'
        WHEN puntaje_raw >= 75 AND puntaje_raw <= 90 THEN 'RECOMENDADO CON RESTRICCIONES'
        ELSE 'NO RECOMENDADO'
    END AS recomendacion,
    CASE 
        WHEN puntaje_raw > 90 THEN 'ALTO'
        WHEN puntaje_raw >= 75 AND puntaje_raw <= 90 THEN 'MEDIO'
        ELSE 'BAJO'
    END AS nivel_documental,
    CASE 
        WHEN puntaje_raw > 90 THEN 'Mantienes un alto nivel de registro y vigencia documental'
        WHEN puntaje_raw >= 75 AND puntaje_raw <= 90 THEN 'Mantienes un nivel aceptable de registro y vigencia documental'
        ELSE 'Presentas un bajo nivel de registro y vigencia documental'
    END AS descripcion_nivel
FROM evaluacion;
    `;
    const result = await pool.query(sql, [proveedorId]);
    return result.rows[0] || null;
};

module.exports = {
    obtenerResumen,
    obtenerDocumentosPorGrupo,
    obtenerDocumentosPorEstado,
    obtenerProveedoresVencidos,
    obtenerDocumentosProximosVencer,
    obtenerCumplimientoPorGestion,
    obtenerEstadoExpediente,
    obtenerCalificacionProveedor
};