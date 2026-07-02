const pool = require('../config/db');

const listar = async () => {

    const sql = `
        SELECT
            proveedor_id,
            'RUC' tipo_documento,
            nro_documento,

            CASE
                WHEN razon_social IS NOT NULL
                 AND TRIM(razon_social) <> ''
                THEN razon_social
                ELSE
                    TRIM(
                        COALESCE(nombre,'') || ' ' ||
                        COALESCE(apellido_paterno,'') || ' ' ||
                        COALESCE(apellido_materno,'')
                    )
            END proveedor,

            correo,
            telefono,
            calificacion,
            status

        FROM "SISGES"."MAE_PROVEEDOR"

        ORDER BY proveedor_id DESC
    `;

    const result = await pool.query(sql);

    return result.rows;
};

const obtenerPorId = async (proveedorId) => {

    const sql = `
        SELECT	p.*,
        ciiu.descripcion AS descripcion_ciiu,
		tipo_doc.descripcion AS descripcion_tipo_documento,
		status_prov.descripcion AS descripcion_status_prov
FROM 	"SISGES"."MAE_PROVEEDOR" p
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" ciiu ON ciiu.cod_grupo = '0002' AND ciiu.tipo_grupo = 'CODIGO_CIIU_SUNAT' AND ciiu.codigo_valor::varchar =  p.ciiu::varchar
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" tipo_doc ON tipo_doc.cod_grupo = '0001' AND tipo_doc.tipo_grupo = 'TIPO_DOC_SUNAT' AND tipo_doc.codigo_valor::varchar =  p.tipo_documento::varchar
LEFT JOIN "SISGES"."MAE_LISTA_VALORES" status_prov ON status_prov.cod_grupo = '0000' AND status_prov.tipo_grupo = 'STATUS_PROVEEDOR' AND status_prov.codigo_valor::varchar =  p.status::varchar
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

    const sql = `
        INSERT INTO "SISGES"."MAE_PROVEEDOR"
        (
            proveedor_id,
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
            create_date,
            create_by
        )
        VALUES
        (
            nextval('"SISGES".seq_proveedor_id'),
            $1,$2,$3,$4,$5,$6,$7,$8,$9,
            $10,$11,$12,$13,$14,$15,$16,
            $17,$18,
            CURRENT_DATE,
            $19
        )
        RETURNING proveedor_id
    `;

    const values = [
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
        proveedor.create_by
    ];

    const result =
        await pool.query(
            sql,
            values
        );

    return result.rows[0];
};

const actualizar = async (
    proveedorId,
    proveedor
) => {

    const sql = `
        UPDATE "SISGES"."MAE_PROVEEDOR"
        SET
            tipo_documento=$1,
            nro_documento=$2,
            nombre=$3,
            apellido_paterno=$4,
            apellido_materno=$5,
            razon_social=$6,
            departamento=$7,
            provincia=$8,
            ciudad=$9,
            direccion=$10,
            ubigeo=$11,
            correo=$12,
            telefono=$13,
            pagina_web=$14,
            ciiu=$15,
            calificacion=$16,
            representante_legal=$17,
            status=$18,
            last_update=CURRENT_DATE,
            update_by=$19
        WHERE proveedor_id=$20
    `;

    await pool.query(
        sql,
        [
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
    valor
) => {

    let sql = '';

    if(tipo === 'DOCUMENTO'){

        sql = `
            SELECT
                p.*,
                c.descripcion AS descripcion_ciiu
            FROM "SISGES"."MAE_PROVEEDOR" p
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" c
                ON c.cod_grupo = '0002'
               AND c.tipo_grupo = 'CODIGO_CIIU_SUNAT'
               AND c.codigo_valor::varchar = p.ciiu::varchar
            WHERE p.nro_documento = $1
        `;

    }
    else {

        sql = `
            SELECT
                p.*,
                c.descripcion AS descripcion_ciiu
            FROM "SISGES"."MAE_PROVEEDOR" p
            LEFT JOIN "SISGES"."MAE_LISTA_VALORES" c
                ON c.cod_grupo = '0002'
               AND c.tipo_grupo = 'CODIGO_CIIU_SUNAT'
               AND c.codigo_valor::varchar = p.ciiu::varchar
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
ORDER BY
    p.razon_social,
    p.nombre,
    p.apellido_paterno            
        `;

    }

   const result =
    await pool.query(
        sql,
        [valor]
    );

if(tipo === 'DOCUMENTO'){

    return result.rows[0];

}

return result.rows;

};


module.exports = {
    listar,
    obtenerPorId,
    existeProveedor,
    crear,
    actualizar,
    obtenerPorUsuario,
	buscarProveedor
};

