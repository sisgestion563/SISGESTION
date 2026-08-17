const pool = require('../config/db');

//EROMAN 07062026
const SQL_PROVEEDOR = `
CASE
    WHEN MPRO.razon_social IS NOT NULL
         AND TRIM(MPRO.razon_social) <> ''
    THEN MPRO.razon_social
    ELSE TRIM(
        COALESCE(MPRO.nombre,'')
        || ' ' ||
        COALESCE(MPRO.apellido_paterno,'')
        || ' ' ||
        COALESCE(MPRO.apellido_materno,'')
    )
END
`;

const SQL_ACTIVIDAD = `
MPRO.ciiu || '-' || MLV_CIUU.descripcion
`;

const SQL_ESTADO = `
CASE
    WHEN MPRO.status = 'A'
    THEN 'ACTIVO'
    ELSE 'INACTIVO'
END
`;

const SQL_ESTADO_DOCUMENTOS = `
CASE
    WHEN NOT EXISTS (
        SELECT 1
        FROM "SISGES"."MOV_DOCUMENTOS" MD
        WHERE MD.proveedor_id = MPRO.proveedor_id
          AND MD.status = 'A'
    )
    THEN NULL
    WHEN EXISTS (
        SELECT 1
        FROM "SISGES"."MOV_DOCUMENTOS" MD
        WHERE MD.proveedor_id = MPRO.proveedor_id
          AND MD.estado_documento = 'C'
          AND MD.status = 'A'
    )
    THEN 'VENCIDOS'
    ELSE 'VIGENTES'
END
`;

const listar = async (campo = 'ALL', valor = '') => {

    let where = '';
    const params = [];

    if (valor.trim() !== '') {

        const texto = `%${valor.trim()}%`;
        const exacto = valor.trim().toUpperCase();

        switch (campo) {

            case 'regimen_tributario':

                params.push(texto);

                where = `
                    WHERE MLV_REG.descripcion ILIKE $1 
                       OR MPRO.regimen_tributario::text ILIKE $1 
                       OR MLV_REG.codigo_valor::text ILIKE $1
                `;
                break;

            case 'proveedor':

                params.push(texto);

                where = `
                    WHERE ${SQL_PROVEEDOR} ILIKE $1
                `;
                break;

            case 'nro_documento':

                params.push(texto);

                where = `
                    WHERE MPRO.nro_documento::text ILIKE $1
                `;
                break;

            case 'tipo_documento':

                params.push(texto);

                where = `
                    WHERE MLV.descripcion ILIKE $1
                `;
                break;

            case 'actividad_economica':

                params.push(texto);

                where = `
                    WHERE ${SQL_ACTIVIDAD} ILIKE $1
                `;
                break;

            case 'estado':

                params.push(exacto);

                where = `
                    WHERE ${SQL_ESTADO} = $1
                `;
                break;

            case 'estado_documentos':

                params.push(exacto);

                where = `
                    WHERE ${SQL_ESTADO_DOCUMENTOS} = $1
                `;
                break;

            default:

                params.push(texto);

                where = `
                WHERE (

                    MLV_REG.descripcion ILIKE $1

                    OR MPRO.regimen_tributario::text ILIKE $1

                    OR ${SQL_PROVEEDOR} ILIKE $1

                    OR MPRO.nro_documento::text ILIKE $1

                    OR MLV.descripcion ILIKE $1

                    OR ${SQL_ACTIVIDAD} ILIKE $1

                    OR ${SQL_ESTADO} ILIKE $1

                    OR ${SQL_ESTADO_DOCUMENTOS} ILIKE $1

                )
                `;

        }

    }

    const sql = `

        SELECT

            MPRO.proveedor_id,

            MPRO.regimen_tributario AS codigo_regimen_tributario,

            COALESCE(MLV_REG.descripcion, MPRO.regimen_tributario::varchar) AS regimen_tributario,

            MLV.descripcion AS tipo_documento,

            MPRO.nro_documento,

            ${SQL_PROVEEDOR} AS proveedor,
			
			MPRO.pagina_web,

            MPRO.correo,

            MPRO.telefono,

            MPRO.calificacion,

            MPRO.ubigeo,

            ${SQL_ACTIVIDAD} AS actividad_economica,

            ${SQL_ESTADO_DOCUMENTOS} AS estado_documentos,

            ${SQL_ESTADO} AS estado,
            MPRO.periodo

        FROM "SISGES"."MAE_PROVEEDOR" MPRO

        LEFT JOIN "SISGES"."MAE_LISTA_VALORES" MLV_REG
               ON MLV_REG.codigo_valor::varchar = MPRO.regimen_tributario::varchar
              AND MLV_REG.cod_grupo='0100'
              AND MLV_REG.tipo_grupo='TIPO_REGIMEN'

        LEFT JOIN "SISGES"."MAE_LISTA_VALORES" MLV
               ON MLV.codigo_valor = MPRO.tipo_documento
              AND MLV.cod_grupo='0001'
              AND MLV.tipo_grupo='TIPO_DOC_SUNAT'

        LEFT JOIN "SISGES"."MAE_LISTA_VALORES" MLV_CIUU
               ON MLV_CIUU.codigo_valor = MPRO.ciiu
              AND MLV_CIUU.cod_grupo='0002'
              AND MLV_CIUU.tipo_grupo='CODIGO_CIIU_SUNAT'

        ${where}

        ORDER BY MPRO.proveedor_id DESC

    `;

    const result = await pool.query(sql, params);
	
	console.table(result.rows);

    return result.rows;

};

const obtenerPorId = async (proveedorId) => {

    const sql = `
        SELECT	p.*,
        reg_trib.descripcion AS descripcion_regimen_tributario,
        ciiu.descripcion AS descripcion_ciiu,
		tipo_doc.descripcion AS descripcion_tipo_documento,
		status_prov.descripcion AS descripcion_status_prov,
        nro_trab.descripcion AS descripcion_nro_trabajadores
FROM 	"SISGES"."MAE_PROVEEDOR" p
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" reg_trib ON reg_trib.cod_grupo = '0100' AND reg_trib.tipo_grupo = 'TIPO_REGIMEN' AND reg_trib.codigo_valor::varchar = p.regimen_tributario::varchar
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" ciiu ON ciiu.cod_grupo = '0002' AND ciiu.tipo_grupo = 'CODIGO_CIIU_SUNAT' AND ciiu.codigo_valor::varchar =  p.ciiu::varchar
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" tipo_doc ON tipo_doc.cod_grupo = '0001' AND tipo_doc.tipo_grupo = 'TIPO_DOC_SUNAT' AND tipo_doc.codigo_valor::varchar =  p.tipo_documento::varchar
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" status_prov ON status_prov.cod_grupo = '0000' AND status_prov.tipo_grupo = 'STATUS_PROVEEDOR' AND status_prov.codigo_valor::varchar =  p.status::varchar
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" nro_trab ON nro_trab.cod_grupo = '0101' AND nro_trab.tipo_grupo = 'TIPO_NRO_TRABAJADORES' AND nro_trab.codigo_valor::varchar = p.nro_trabajadores::varchar
WHERE p.proveedor_id = $1
    `;

    const result =
        await pool.query(
            sql,
            [proveedorId]
        );

    return result.rows[0];
};

const existeProveedor = async (
    tipoDocumento,
    nroDocumento
) => {

    const sql = `
        SELECT proveedor_id
        FROM "SISGES"."MAE_PROVEEDOR"
        WHERE tipo_documento = $1
        AND nro_documento = $2
    `;

    const result =
        await pool.query(
            sql,
            [tipoDocumento, nroDocumento]
        );

    return result.rows[0];
};

const crear = async (proveedor) => {

    const periodo = await obtenerPeriodoPara2026();

    const sql = `
        INSERT INTO "SISGES"."MAE_PROVEEDOR"
        (
            proveedor_id,
            regimen_tributario,
            tipo_documento,
            nro_documento,
            nombre,
            apellido_paterno,
            apellido_materno,
            razon_social,
            departamento,
            provincia,
            ciudad,
            direccion,
            ubigeo,
            correo,
            telefono,
            pagina_web,
            ciiu,
            calificacion,
            representante_legal,
            status,
            nro_trabajadores,
            create_date,
            create_by,
            periodo
        )
        VALUES
        (
            nextval('"SISGES".seq_proveedor_id'),
            $1,$2,$3,$4,$5,$6,$7,$8,$9,
            $10,$11,$12,$13,$14,$15,$16,
            $17,$18,$19,
            $20,
            CURRENT_DATE,
            $21,
            $22
        )
        RETURNING proveedor_id
    `;

    const values = [
        proveedor.regimen_tributario,
        proveedor.tipo_documento,
        proveedor.nro_documento,
        proveedor.nombre,
        proveedor.apellido_paterno,
        proveedor.apellido_materno,
        proveedor.razon_social,
        proveedor.departamento,
        proveedor.provincia,
        proveedor.ciudad,
        proveedor.direccion,
        proveedor.ubigeo,
        proveedor.correo,
        proveedor.telefono,
        proveedor.pagina_web,
        proveedor.ciiu,
        proveedor.calificacion || 'R',
        proveedor.representante_legal,
        proveedor.status || 'A',
        proveedor.nro_trabajadores,
        proveedor.create_by,
        periodo
    ];

    // 1. Insertamos el proveedor y recuperamos el ID numérico generado por la secuencia
    const result = await pool.query(sql, values);
    const nuevoIdGenerado = result.rows[0].proveedor_id;

    // 2. Vinculación automática en la tabla de seguridad usando el ID entero obtenido
    if (proveedor.usuario_id) {
        const sqlSeguridad = `
            UPDATE "SISGES"."SEG_USUARIO"
            SET proveedor_id = $1,
                primer_ingreso = 'N'
            WHERE usuario_id = $2
        `;
        await pool.query(sqlSeguridad, [nuevoIdGenerado, proveedor.usuario_id]);
    }

    return result.rows[0];
};

const actualizar = async (
    proveedorId,
    proveedor
) => {

    const sql = `
        UPDATE "SISGES"."MAE_PROVEEDOR"
        SET
            regimen_tributario=$1,
            tipo_documento=$2,
            nro_documento=$3,
            nombre=$4,
            apellido_paterno=$5,
            apellido_materno=$6,
            razon_social=$7,
            departamento=$8,
            provincia=$9,
            ciudad=$10,
            direccion=$11,
            ubigeo=$12,
            correo=$13,
            telefono=$14,
            pagina_web=$15,
            ciiu=$16,
            calificacion=$17,
            representante_legal=$18,
            status=$19,
            nro_trabajadores=$20,
            last_update=CURRENT_DATE,
            update_by=$21
        WHERE proveedor_id=$22
    `;

    await pool.query(
        sql,
        [
            proveedor.regimen_tributario,
            proveedor.tipo_documento,
            proveedor.nro_documento,
            proveedor.nombre,
            proveedor.apellido_paterno,
            proveedor.apellido_materno,
            proveedor.razon_social,
            proveedor.departamento,
            proveedor.provincia,
            proveedor.ciudad,
            proveedor.direccion,
            proveedor.ubigeo,
            proveedor.correo,
            proveedor.telefono,
            proveedor.pagina_web,
            proveedor.ciiu,
            proveedor.calificacion,
            proveedor.representante_legal,
            proveedor.status,
            proveedor.nro_trabajadores,
            proveedor.update_by,
            proveedorId
        ]
    );
};

const obtenerPorUsuario = async (
    proveedorId
) => {

    const sql = `
        SELECT *
        FROM "SISGES"."MAE_PROVEEDOR"
        WHERE proveedor_id = $1
    `;

    const result =
        await pool.query(
            sql,
            [proveedorId]
        );

    return result.rows[0];
};
const buscarProveedor = async (
    tipo,
    valor,
    periodo
) => {

    let sql = '';
    const params = [valor];
    let periodWhere = '';

    if (periodo) {
        params.push(periodo);
        periodWhere = ' AND p.periodo = $2';
    }

    if(tipo === 'DOCUMENTO'){

        sql = `
            SELECT
                p.*,
                c.descripcion AS descripcion_ciiu,
                reg_trib.descripcion AS descripcion_regimen_tributario,
                tipo_doc.descripcion AS descripcion_tipo_documento,
                status_prov.descripcion AS descripcion_status_prov,
                nro_trab.descripcion AS descripcion_nro_trabajadores
            FROM "SISGES"."MAE_PROVEEDOR" p
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" c
                ON c.cod_grupo = '0002'
               AND c.tipo_grupo = 'CODIGO_CIIU_SUNAT'
               AND c.codigo_valor::varchar = p.ciiu::varchar
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" reg_trib 
                ON reg_trib.cod_grupo = '0100' 
                AND reg_trib.tipo_grupo = 'TIPO_REGIMEN' 
                AND reg_trib.codigo_valor::varchar = p.regimen_tributario::varchar
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" tipo_doc 
                ON tipo_doc.cod_grupo = '0001' 
                AND tipo_doc.tipo_grupo = 'TIPO_DOC_SUNAT' 
                AND tipo_doc.codigo_valor::varchar = p.tipo_documento::varchar
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" status_prov 
                ON status_prov.cod_grupo = '0000' 
                AND status_prov.tipo_grupo = 'STATUS_PROVEEDOR' 
                AND status_prov.codigo_valor::varchar = p.status::varchar
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" nro_trab 
                ON nro_trab.cod_grupo = '0101' 
                AND nro_trab.tipo_grupo = 'TIPO_NRO_TRABAJADORES' 
                AND nro_trab.codigo_valor::varchar = p.nro_trabajadores::varchar
            WHERE p.nro_documento = $1 ${periodWhere}
        `;

    }
    else {

        sql = `
            SELECT
                p.*,
                c.descripcion AS descripcion_ciiu,
                reg_trib.descripcion AS descripcion_regimen_tributario,
                tipo_doc.descripcion AS descripcion_tipo_documento,
                status_prov.descripcion AS descripcion_status_prov,
                nro_trab.descripcion AS descripcion_nro_trabajadores
            FROM "SISGES"."MAE_PROVEEDOR" p
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" c
                ON c.cod_grupo = '0002'
               AND c.tipo_grupo = 'CODIGO_CIIU_SUNAT'
               AND c.codigo_valor::varchar = p.ciiu::varchar
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" reg_trib 
                ON reg_trib.cod_grupo = '0100' 
                AND reg_trib.tipo_grupo = 'TIPO_REGIMEN' 
                AND reg_trib.codigo_valor::varchar = p.regimen_tributario::varchar
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" tipo_doc 
                ON tipo_doc.cod_grupo = '0001' 
                AND tipo_doc.tipo_grupo = 'TIPO_DOC_SUNAT' 
                AND tipo_doc.codigo_valor::varchar = p.tipo_documento::varchar
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" status_prov 
                ON status_prov.cod_grupo = '0000' 
                AND status_prov.tipo_grupo = 'STATUS_PROVEEDOR' 
                AND status_prov.codigo_valor::varchar = p.status::varchar
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" nro_trab 
                ON nro_trab.cod_grupo = '0101' 
                AND nro_trab.tipo_grupo = 'TIPO_NRO_TRABAJADORES' 
                AND nro_trab.codigo_valor::varchar = p.nro_trabajadores::varchar
            WHERE
            (
                COALESCE(p.razon_social,'')
                || ' ' ||
                COALESCE(p.nombre,'')
                || ' ' ||
                COALESCE(p.apellido_paterno,'')
                || ' ' ||
                COALESCE(p.apellido_materno,'')
            )
            ILIKE '%' || $1 || '%'
            ${periodWhere}
            ORDER BY
                p.razon_social,
                p.nombre,
                p.apellido_paterno            
        `;

    }

    const result = await pool.query(sql, params);

    if(tipo === 'DOCUMENTO'){

        return result.rows[0];

    }

    return result.rows;

};
//EROMAN 07062026

const obtenerClientesPorProveedor = async (proveedorId) => {
    const sql = `
        SELECT 
            cl.proveedor_id,
            cl.tipo_documento_clie,
            cl.nro_documento_clie,
            cl.razon_social_nombres_apellidos,
            cl.ciuu_cliente,
            td.descripcion AS descripcion_tipo_documento,
            ci.descripcion AS descripcion_ciiu
        FROM "SISGES"."MAE_PROVEEDOR_CLIENTE" cl
        LEFT JOIN "SISGES"."MAE_LISTA_VALORES" td 
            ON td.cod_grupo = '0001' 
           AND td.tipo_grupo = 'TIPO_DOC_SUNAT' 
           AND td.codigo_valor::varchar = cl.tipo_documento_clie::varchar
        LEFT JOIN "SISGES"."MAE_LISTA_VALORES" ci 
            ON ci.cod_grupo = '0002' 
           AND ci.tipo_grupo = 'CODIGO_CIIU_SUNAT' 
           AND ci.codigo_valor::varchar = cl.ciuu_cliente::varchar
        WHERE cl.proveedor_id = $1
    `;
    const result = await pool.query(sql, [proveedorId]);
    return result.rows;
};

const existeClienteParaProveedor = async (proveedorId, tipoDocumentoClie, nroDocumentoClie) => {
    const sql = `
        SELECT 1
        FROM "SISGES"."MAE_PROVEEDOR_CLIENTE"
        WHERE proveedor_id = $1
          AND tipo_documento_clie = $2
          AND nro_documento_clie = $3
    `;
    const result = await pool.query(sql, [proveedorId, tipoDocumentoClie, nroDocumentoClie]);
    return result.rows.length > 0;
};

const crearClientes = async (proveedorId, clientes, usuarioId) => {
    if (!clientes || !Array.isArray(clientes) || clientes.length === 0) return;

    const sql = `
        INSERT INTO "SISGES"."MAE_PROVEEDOR_CLIENTE" (
            proveedor_id,
            tipo_documento_clie,
            nro_documento_clie,
            razon_social_nombres_apellidos,
            ciuu_cliente,
            create_by,
            create_date
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
    `;

    for (const clie of clientes) {
        const existe = await existeClienteParaProveedor(proveedorId, clie.tipo_documento_clie, clie.nro_documento_clie);
        if (!existe) {
            await pool.query(sql, [
                proveedorId,
                clie.tipo_documento_clie,
                clie.nro_documento_clie,
                clie.razon_social_nombres_apellidos,
                clie.ciuu_cliente,
                usuarioId
            ]);
        }
    }
};

const obtenerPeriodoPara2026 = async () => {
    const currentYear = new Date().getFullYear();
    
    // 1. Intentar obtener el periodo activo según la fecha actual del servidor
    const sql = `
        SELECT periodo
        FROM "SISGES"."MAE_PERIODO"
        WHERE status = 'A'
          AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
        LIMIT 1
    `;
    const result = await pool.query(sql);
    if (result.rows.length > 0) {
        return result.rows[0].periodo;
    }
    
    // 2. Fallback 1: Buscar periodo activo del año actual (dinámico)
    const sqlFallbackYear = `
        SELECT periodo
        FROM "SISGES"."MAE_PERIODO"
        WHERE status = 'A'
          AND (EXTRACT(YEAR FROM fecha_inicio) = $1 OR EXTRACT(YEAR FROM fecha_fin) = $1)
        LIMIT 1
    `;
    const resFallbackYear = await pool.query(sqlFallbackYear, [currentYear]);
    if (resFallbackYear.rows.length > 0) {
        return resFallbackYear.rows[0].periodo;
    }

    // 3. Fallback 2: Buscar periodo activo para el año 2026 (por compatibilidad)
    const sqlFallback2026 = `
        SELECT periodo
        FROM "SISGES"."MAE_PERIODO"
        WHERE status = 'A'
          AND (EXTRACT(YEAR FROM fecha_inicio) = 2026 OR EXTRACT(YEAR FROM fecha_fin) = 2026)
        LIMIT 1
    `;
    const resFallback2026 = await pool.query(sqlFallback2026);
    if (resFallback2026.rows.length > 0) {
        return resFallback2026.rows[0].periodo;
    }

    // 4. Fallback 3: Retornar el último periodo activo disponible
    const sqlFallbackLatest = `
        SELECT periodo
        FROM "SISGES"."MAE_PERIODO"
        WHERE status = 'A'
        ORDER BY periodo DESC
        LIMIT 1
    `;
    const resFallbackLatest = await pool.query(sqlFallbackLatest);
    return resFallbackLatest.rows[0]?.periodo || null;
};

module.exports = {
    listar,
    obtenerPorId,
    existeProveedor,
    crear,
    actualizar,
    obtenerPorUsuario,
	buscarProveedor,
    obtenerClientesPorProveedor,
    existeClienteParaProveedor,
    crearClientes,
    obtenerPeriodoPara2026
};
