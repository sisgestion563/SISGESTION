const pool = require('../config/db');

const listarPorProveedor = async (proveedorId) => {

    const sql = `
        SELECT
    d.documento_id,
    d.grupo_documentos,
    d.proveedor_id,
    d.tipo_documento_id,
    d.tipo_documento,
    lv.descripcion AS descripcion_tipo_documento,
    d.fecha_inicio,
    d.fecha_fin,
    d.fecha_vigencia,
    d.ruta_documento,
    d.estado_documento,
    d.status,
    d.alcance,
    d.observaciones
FROM "SISGES"."MOV_DOCUMENTOS" d

LEFT JOIN "SISGES"."MAE_LISTA_VALORES" lv
    ON lv.cod_grupo = '0001'
   AND lv.tipo_grupo = 'TIPO_DOC_NORMATIVO'
   AND lv.codigo_valor = d.tipo_documento_id

WHERE d.proveedor_id = $1
AND d.status = 'A'

ORDER BY d.fecha_vigencia
    `;

    const result =
        await pool.query(sql,[proveedorId]);

    return result.rows;
};

const obtenerPorId = async (documentoId) => {

    const sql = `
        SELECT *
        FROM "SISGES"."MOV_DOCUMENTOS"
        WHERE documento_id = $1
    `;

    const result =
        await pool.query(sql,[documentoId]);

    return result.rows[0];
};

const crear = async (documento) => {
	
	if(documento.grupo_documentos !== 'DOC_NOR'){
    documento.tipo_documento_id = null;
}

if(documento.grupo_documentos === 'DOC_NOR'){
    documento.tipo_documento = null;
}

    const sql = `
        INSERT INTO "SISGES"."MOV_DOCUMENTOS"
        (
            documento_id,
            grupo_documentos,
            proveedor_id,
            tipo_documento_id,
            tipo_documento,
            fecha_inicio,
            fecha_fin,
            fecha_vigencia,
            ruta_documento,
            estado_documento,
            status,
            alcance,
            observaciones,
            create_date,
            create_by
        )
        VALUES
        (
            nextval('"SISGES".seq_documento_id'),
            $1,$2,$3,$4,$5,$6,$7,$8,$9,
            'A',
            $10,$11,
            CURRENT_DATE,
            $12
        )
        RETURNING documento_id
    `;

    const result =
        await pool.query(sql,[
            documento.grupo_documentos,
            documento.proveedor_id,
            documento.tipo_documento_id,
            documento.tipo_documento,
            documento.fecha_inicio,
            documento.fecha_fin,
            documento.fecha_vigencia,
            documento.ruta_documento,
            documento.estado_documento,
            documento.alcance,
            documento.observaciones,
            documento.create_by
        ]);

    return result.rows[0];
};

const actualizar = async (
    documentoId,
    documento
) => {

    if (documento.grupo_documentos !== 'DOC_NOR') {
        documento.tipo_documento_id = null;
    }

    if (documento.grupo_documentos === 'DOC_NOR') {
        documento.tipo_documento = null;
    }

    const sql = `
        UPDATE "SISGES"."MOV_DOCUMENTOS"
        SET
            tipo_documento_id = $1,
            tipo_documento    = $2,
            fecha_inicio      = $3,
            fecha_fin         = $4,
            fecha_vigencia    = $5,
            ruta_documento    = $6,
            estado_documento  = $7,
            alcance           = $8,
            observaciones     = $9,
            last_update       = CURRENT_DATE,
            update_by         = $10
        WHERE documento_id = $11
    `;

    await pool.query(sql, [

        documento.tipo_documento_id,
        documento.tipo_documento,
        documento.fecha_inicio,
        documento.fecha_fin,
        documento.fecha_vigencia,
        documento.ruta_documento,
        documento.estado_documento,
        documento.alcance,
        documento.observaciones,
        documento.create_by,
        documentoId

    ]);

};

const listarPorGrupo = async (
    proveedorId,
    grupo
) => {

    const sql = `SELECT	d.documento_id,
        d.grupo_documentos,
        d.proveedor_id,
        d.tipo_documento_id,
        d.tipo_documento,
        lv.descripcion AS descripcion_tipo_documento,
		lv_alcance.descripcion AS descripcion_alcance,
		lv_estado_doc.descripcion as desc_estado_documento,
        d.fecha_inicio,
        d.fecha_fin,
		d.fecha_vigencia,
        d.ruta_documento,
        d.estado_documento,
        d.status,
        d.alcance,
        d.observaciones
FROM	"SISGES"."MOV_DOCUMENTOS" d
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" lv ON lv.cod_grupo = '0001' AND lv.tipo_grupo = 'TIPO_DOC_NORMATIVO' AND lv.codigo_valor = d.tipo_documento_id		   
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" lv_alcance ON lv_alcance.codigo_valor = D.alcance AND lv_alcance.cod_grupo='0099' AND lv_alcance.tipo_grupo='TIPO_GESTION'
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" lv_estado_doc ON lv_estado_doc.codigo_valor = D.estado_documento AND lv_estado_doc.cod_grupo='0000' AND lv_estado_doc.tipo_grupo='STATUS_DOCUMENTO'
WHERE 	d.proveedor_id = $1
AND 	d.grupo_documentos = $2
AND		d.status = 'A'
ORDER BY d.fecha_vigencia`;

    const result =
        await pool.query(
            sql,
            [
                proveedorId,
                grupo
            ]
        );

    return result.rows;

};

module.exports = {
    listarPorProveedor,
    obtenerPorId,
    crear,
    actualizar,
	listarPorGrupo
};