const pool = require('../config/db');

const obtenerResumen = async (periodo) => {
    let whereProv = "WHERE status = 'A'";
    let whereDoc = "WHERE estado_documento = 'V'";
    let whereDocVig = "WHERE estado_documento = 'V' AND fecha_vigencia >= CURRENT_DATE";
    let whereDocVen = "WHERE estado_documento = 'C' AND fecha_vigencia < CURRENT_DATE";
    const params = [];

    if (periodo) {
        params.push(periodo);
        whereProv += " AND periodo = $1";
        // whereDoc += ` AND proveedor_id IN (SELECT proveedor_id FROM "SISGES"."MAE_PROVEEDOR" WHERE periodo = $1)`;
        // whereDocVig += ` AND proveedor_id IN (SELECT proveedor_id FROM "SISGES"."MAE_PROVEEDOR" WHERE periodo = $1)`;
        // whereDocVen += ` AND proveedor_id IN (SELECT proveedor_id FROM "SISGES"."MAE_PROVEEDOR" WHERE periodo = $1)`;
    }

    const sql = `
        SELECT
            (
                SELECT COUNT(*)
                FROM "SISGES"."MAE_PROVEEDOR"
                ${whereProv}
            ) total_proveedores,

            (
                SELECT COUNT(*)
                FROM "SISGES"."MOV_DOCUMENTOS"
                ${whereDoc}
            ) total_documentos,

            (
                SELECT COUNT(*)
                FROM "SISGES"."MOV_DOCUMENTOS"
                ${whereDocVig}
            ) documentos_vigentes,

            (
                SELECT COUNT(*)
                FROM "SISGES"."MOV_DOCUMENTOS"
                ${whereDocVen}
            ) documentos_vencidos
    `;

    const result = await pool.query(sql, params);
    return result.rows[0];
};

const obtenerDocumentosPorGrupo = async (periodo) => {
    let where = "WHERE d.estado_documento = 'V'";
    const params = [];
    if (periodo) {
        // params.push(periodo);
        // where += ` AND d.proveedor_id IN (SELECT proveedor_id FROM "SISGES"."MAE_PROVEEDOR" WHERE periodo = $1)`;
    }

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
${where}
GROUP BY
    d.grupo_documentos,
    lv.descripcion
ORDER BY lv.descripcion
    `;

    const result = await pool.query(sql, params);
    return result.rows;
};

const obtenerDocumentosPorEstado = async (periodo) => {
    let where = "WHERE ( d.estado_documento = 'V' or d.estado_documento = 'C' ) ";
    const params = [];
    if (periodo) {
        // params.push(periodo);
        // where += ` AND d.proveedor_id IN (SELECT proveedor_id FROM "SISGES"."MAE_PROVEEDOR" WHERE periodo = $1)`;
    }

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
        ${where}
        GROUP BY
            d.estado_documento,
            lv.descripcion
        ORDER BY
            d.estado_documento
    `;

    const result = await pool.query(sql, params);
    return result.rows;
};

const obtenerProveedoresVencidos = async (periodo) => {
    let where = "WHERE d.estado_documento = 'C' AND d.status = 'A'";
    const params = [];
    if (periodo) {
        // params.push(periodo);
        // where += " AND p.periodo = $1";
    }

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
        ${where}
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

    const result = await pool.query(sql, params);
    return result.rows;
};



const DOC_DESCRIPCIONES = {
    GSG: {
        '01': 'Accidentes de Trabajo, Enfermedades Ocupacionales e Incidentes',
        '02': 'Exámenes Médicos Ocupacionales',
        '03': 'Monitoreo de Agentes',
        '04': 'Inspecciones Internas',
        '05': 'Estadísticas',
        '06': 'Equipos de Seguridad o Emergencia',
        '07': 'Capacitación y Simulacros',
        '08': 'Auditorías',
        '09': 'Reglamento Interno de Seguridad y Salud en el Trabajo.',
        '10': 'Identificación de peligros, evaluación de riesgos y sus medidas de control(IPERC)',
        '11': 'Comité SST',
        '12': 'Plan y Programa Anual de Seguridad y Salud en el Trabajo.',
        '13': 'Supervisor SST (Elegido si tiene menos de 20 trabajadores).',
        '15': 'Comité SST (Obligatorio si supera los 20 trabajadores)'
    },
    GMA: {
        '01': 'Matriz PAMA',
        '02': 'Otros(Certificaciones, declaraciones, manifiestos, informes)'
    },
    GCA: {
        '01': 'Certificaciones ISO 9001',
        '02': 'Certificaciones diversas(Homologaciones)'
    },
    GPA: {
        '01': 'Plán de Contigencia',
        '02': 'Otros'
    },
    GTR: {
        '01': 'Carta de Presentación',
        '02': 'Otros'
    }
};

const REQUERIDOS_SST = {
    RM: ['01', '02', '04', '07', '09', '12', '13'],
    RP: ['01', '02', '03', '04', '05', '07', '09', '10', '12'],
    RG: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
};

const obtenerDocumentosProximosVencer = async (periodo) => {
    let sqlProveedores = `
        SELECT 
            p.proveedor_id,
            CASE
                WHEN p.razon_social IS NOT NULL AND TRIM(p.razon_social) <> '' THEN p.razon_social
                ELSE TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido_paterno,'') || ' ' || COALESCE(p.apellido_materno,''))
            END AS proveedor,
            p.regimen_tributario,
            p.nro_trabajadores
        FROM "SISGES"."MAE_PROVEEDOR" p
        WHERE p.status = 'A'
    `;
    const paramsProv = [];
    if (periodo) {
        // sqlProveedores += " AND p.periodo = $1";
        // paramsProv.push(periodo);
    }
    sqlProveedores += " ORDER BY proveedor";

    const resProv = await pool.query(sqlProveedores, paramsProv);
    const proveedores = resProv.rows;

    if (proveedores.length === 0) return [];

    const sqlDocs = `
        SELECT proveedor_id, alcance, tipo_documento_id
        FROM "SISGES"."MOV_DOCUMENTOS"
        WHERE estado_documento = 'V'
    `;
    const resDocs = await pool.query(sqlDocs);
    const docs = resDocs.rows;

    const docsByProveedor = {};
    docs.forEach(d => {
        if (!docsByProveedor[d.proveedor_id]) {
            docsByProveedor[d.proveedor_id] = [];
        }
        docsByProveedor[d.proveedor_id].push(d);
    });

    const listaPendientes = [];

    proveedores.forEach(p => {
        const provDocs = docsByProveedor[p.proveedor_id] || [];
        const reg = (p.regimen_tributario || 'RG').toUpperCase();
        const isRM = reg === 'RM' || reg.includes('MICRO');
        const isRP = reg === 'RP' || reg.includes('PEQUEÑA') || reg.includes('PEQUENA');
        const regCode = isRM ? 'RM' : (isRP ? 'RP' : 'RG');

        const uploadedSet = new Set(provDocs.map(d => `${d.alcance}_${String(d.tipo_documento_id).padStart(2, '0')}`));
        const uploadedByAlcance = {
            GSG: provDocs.filter(d => d.alcance === 'GSG'),
            GMA: provDocs.filter(d => d.alcance === 'GMA'),
            GCA: provDocs.filter(d => d.alcance === 'GCA'),
            GPA: provDocs.filter(d => d.alcance === 'GPA'),
            GTR: provDocs.filter(d => d.alcance === 'GTR')
        };

        // 1. SST (GSG)
        let reqSST = [...(REQUERIDOS_SST[regCode] || REQUERIDOS_SST.RG)];
        if (regCode === 'RP') {
            const trabStr = String(p.nro_trabajadores || '');
            const esMas20 = trabStr.includes('MT') || trabStr.includes('>20') || trabStr.includes('MAS DE 20') || parseInt(trabStr, 10) > 20;
            if (esMas20 && !reqSST.includes('15')) {
                reqSST.push('15');
            }
        }

        reqSST.forEach(docId => {
            const idPad = String(docId).padStart(2, '0');
            if (!uploadedSet.has(`GSG_${idPad}`)) {
                const desc = DOC_DESCRIPCIONES.GSG[idPad] || `Documento ${idPad}`;
                listaPendientes.push({
                    proveedor_id: p.proveedor_id,
                    proveedor: p.proveedor,
                    grupo_documentos: 'DOC_NOR',
                    alcance: 'GSG',
                    alcance_nombre: 'SST',
                    gestion: 'GESTIÓN SST',
                    tipo_documento_id: idPad,
                    tipo_documento: `${idPad} - ${desc}`,
                    descripcion_tipo_documento: desc,
                    estado: 'Pendiente de ingresar'
                });
            }
        });

        // 2. MA (GMA), CALIDAD (GCA), PATRIMONIAL (GPA), ETICA (GTR)
        const sencillas = [
            { alcance: 'GMA', alcanceNombre: 'MA', gestion: 'GESTIÓN MA', grupo: 'DOC_NOR', defaultId: '01' },
            { alcance: 'GCA', alcanceNombre: 'CALIDAD', gestion: 'GESTIÓN DE CALIDAD', grupo: 'DOC_EXT_NOR', defaultId: '01' },
            { alcance: 'GPA', alcanceNombre: 'PATRIMONIAL', gestion: 'GESTIÓN PATRIMONIAL', grupo: 'DOC_REQ_ESTATAL', defaultId: '01' },
            { alcance: 'GTR', alcanceNombre: 'ETICA', gestion: 'CÓDIGO ÉTICA', grupo: 'DOC_OTROS', defaultId: '01' }
        ];

        sencillas.forEach(item => {
            if ((uploadedByAlcance[item.alcance] || []).length === 0) {
                const idPad = item.defaultId;
                const desc = DOC_DESCRIPCIONES[item.alcance][idPad] || `Documento ${idPad}`;
                listaPendientes.push({
                    proveedor_id: p.proveedor_id,
                    proveedor: p.proveedor,
                    grupo_documentos: item.grupo,
                    alcance: item.alcance,
                    alcance_nombre: item.alcanceNombre,
                    gestion: item.gestion,
                    tipo_documento_id: idPad,
                    tipo_documento: `${idPad} - ${desc}`,
                    descripcion_tipo_documento: desc,
                    estado: 'Pendiente de ingresar'
                });
            }
        });
    });

    return listaPendientes;
};


//mi desempeño por gestion
const obtenerCumplimientoPorGestion = async (proveedorId) => {
    const sql = `
WITH proveedor_info AS (
    SELECT 
        proveedor_id, 
        regimen_tributario,
        CASE 
            WHEN regimen_tributario = 'RG' THEN 12
            WHEN regimen_tributario = 'RP' THEN 9
            WHEN regimen_tributario = 'RM' THEN 7
            ELSE 12
        END as exigible_sst,
        1 as exigible_ma,
        CASE 
            WHEN regimen_tributario = 'RG' THEN 13
            WHEN regimen_tributario = 'RP' THEN 10
            WHEN regimen_tributario = 'RM' THEN 8
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
        COUNT(DISTINCT CASE WHEN d.alcance = 'GSG' THEN d.tipo_documento_id END) as reg_sst,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GMA' THEN d.tipo_documento_id END) as reg_ma,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GCA' THEN d.tipo_documento_id END) as docs_calidad,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GPA' THEN d.tipo_documento_id END) as docs_patrimonial,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GTR' THEN d.tipo_documento_id END) as docs_etica
    FROM proveedor_info p
    LEFT JOIN "SISGES"."MOV_DOCUMENTOS" d 
      ON p.proveedor_id = d.proveedor_id AND d.estado_documento = 'V'
    GROUP BY p.proveedor_id
)
SELECT 
    'SST / MA' as gestion, 
    (LEAST(c.reg_sst, p.exigible_sst) + LEAST(c.reg_ma, p.exigible_ma)) as documentos_registrados, 
    p.exigible_sst_ma as documentos_exigibles,
    ROUND(LEAST(((LEAST(c.reg_sst, p.exigible_sst) + LEAST(c.reg_ma, p.exigible_ma))::numeric / NULLIF(p.exigible_sst_ma, 0)) * 100, 100), 2) as porcentaje
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
FROM proveedor_info p LEFT JOIN doc_counts c ON p.proveedor_id = c.proveedor_id
    `;
    const result = await pool.query(sql, [proveedorId]);
    return result.rows;
};


//estado EXPEDIENTE
const obtenerEstadoExpediente = async (proveedorId) => {
    const sql = `
WITH proveedor_info AS (
    SELECT 
        proveedor_id, 
        CASE 
            WHEN regimen_tributario = 'RG' THEN 12
            WHEN regimen_tributario = 'RP' THEN 9
            WHEN regimen_tributario = 'RM' THEN 7
            ELSE 12
        END as exigible_sst,
        1 as exigible_ma,
        1 as exigible_calidad,
        1 as exigible_patrimonial,
        1 as exigible_etica,
        CASE 
            WHEN regimen_tributario = 'RG' THEN 16
            WHEN regimen_tributario = 'RP' THEN 13
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
        COUNT(d.documento_id) FILTER (WHERE d.fecha_vigencia >= CURRENT_DATE AND d.fecha_vigencia <= CURRENT_DATE + INTERVAL '15 days') AS por_vencer_abs,
        COUNT(d.documento_id) FILTER (WHERE d.fecha_vigencia >= CURRENT_DATE) AS vigentes_abs
    FROM proveedor_info p
    LEFT JOIN "SISGES"."MOV_DOCUMENTOS" d 
        ON p.proveedor_id = d.proveedor_id AND ( d.estado_documento = 'V' or d.estado_documento = 'C' )
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

//Mi calificacion
const obtenerCalificacionProveedor = async (proveedorId) => {
    const sql = `
WITH proveedor_info AS (
    SELECT 
        p.proveedor_id, 
        p.regimen_tributario AS regimen_tributario_codigo,
        COALESCE(reg_trib.descripcion, p.regimen_tributario::varchar) AS regimen_tributario,
        CASE 
            WHEN p.regimen_tributario = 'RG' THEN 12
            WHEN p.regimen_tributario = 'RP' THEN 9
            WHEN p.regimen_tributario = 'RM' THEN 7
            ELSE 12
        END as exigible_sst,
        1 as exigible_ma,
        1 as exigible_calidad,
        1 as exigible_patrimonial,
        1 as exigible_etica,
        CASE 
            WHEN p.regimen_tributario = 'RG' THEN 16
            WHEN p.regimen_tributario = 'RP' THEN 13
            WHEN p.regimen_tributario = 'RM' THEN 11
            ELSE 16
        END as total_exigibles
    FROM "SISGES"."MAE_PROVEEDOR" p
    LEFT JOIN "SISGES"."MAE_LISTA_VALORES" reg_trib 
        ON reg_trib.cod_grupo = '0100' 
        AND reg_trib.tipo_grupo = 'TIPO_REGIMEN' 
        AND reg_trib.codigo_valor::varchar = p.regimen_tributario::varchar
    WHERE p.proveedor_id = $1
),
doc_counts AS (
    SELECT
        p.proveedor_id,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GSG' THEN d.tipo_documento_id END) as reg_sst,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GMA' THEN d.tipo_documento_id END) as reg_ma,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GCA' THEN d.tipo_documento_id END) as reg_calidad,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GPA' THEN d.tipo_documento_id END) as reg_patrimonial,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GTR' THEN d.tipo_documento_id END) as reg_etica
    FROM proveedor_info p
    LEFT JOIN "SISGES"."MOV_DOCUMENTOS" d 
        ON p.proveedor_id = d.proveedor_id AND d.estado_documento = 'V'
    GROUP BY p.proveedor_id
),
capped_counts AS (
    SELECT
        c.proveedor_id,
        p.regimen_tributario,
        p.regimen_tributario_codigo,
        p.total_exigibles,
        (
            LEAST(c.reg_sst, p.exigible_sst) +
            LEAST(c.reg_ma, p.exigible_ma) +
            LEAST(c.reg_calidad, p.exigible_calidad) +
            LEAST(c.reg_patrimonial, p.exigible_patrimonial) +
            LEAST(c.reg_etica, p.exigible_etica)
        ) AS cantidad_documentos_vigentes
    FROM doc_counts c
    JOIN proveedor_info p ON c.proveedor_id = p.proveedor_id
),
evaluacion AS (
    SELECT 
        proveedor_id,
        regimen_tributario,
        regimen_tributario_codigo,
        cantidad_documentos_vigentes,
        (cantidad_documentos_vigentes::numeric / total_exigibles) * 100 AS puntaje_raw
    FROM capped_counts
)
SELECT 
    proveedor_id,
    regimen_tributario,
    regimen_tributario_codigo,
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

const obtenerResumenProveedoresCumplimiento = async (periodo, rubro) => {
    let whereProv = "(r.codigo = 'PROVEEDOR' OR u.rol_id = 2) AND u.estado_usuario = 'A'";
    const params = [];

    if (periodo && periodo !== 'ALL') {
        params.push(periodo);
        whereProv += ` AND p.periodo = $${params.length}`;
    }

    if (rubro && rubro !== 'ALL') {
        params.push(rubro);
        whereProv += ` AND p.ciiu::varchar = $${params.length}::varchar`;
    }

    const sql = `
WITH usuarios_proveedores AS (
    SELECT 
        u.usuario_id,
        u.username,
        u.proveedor_id,
        CASE
            WHEN p.razon_social IS NOT NULL AND TRIM(p.razon_social) <> '' THEN p.razon_social
            ELSE TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido_paterno,'') || ' ' || COALESCE(p.apellido_materno,''))
        END AS proveedor_nombre,
        p.nro_documento,
        p.ciiu,
        COALESCE(p.regimen_tributario, 'RG') AS regimen_tributario,
        CASE 
            WHEN p.regimen_tributario = 'RG' THEN 12
            WHEN p.regimen_tributario = 'RP' THEN 9
            WHEN p.regimen_tributario = 'RM' THEN 7
            ELSE 12
        END as exigible_sst,
        1 as exigible_ma,
        1 as exigible_calidad,
        1 as exigible_patrimonial,
        1 as exigible_etica,
        CASE 
            WHEN p.regimen_tributario = 'RG' THEN 16
            WHEN p.regimen_tributario = 'RP' THEN 13
            WHEN p.regimen_tributario = 'RM' THEN 11
            ELSE 16
        END as total_exigibles
    FROM "SISGES"."SEG_USUARIO" u
    JOIN "SISGES"."SEG_ROL" r ON u.rol_id = r.rol_id
    LEFT JOIN "SISGES"."MAE_PROVEEDOR" p ON u.proveedor_id = p.proveedor_id
    WHERE ${whereProv}
),
doc_counts AS (
    SELECT
        up.usuario_id,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GSG' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_sst,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GMA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_ma,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GCA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_calidad,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GPA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_patrimonial,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GTR' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_etica
    FROM usuarios_proveedores up
    LEFT JOIN "SISGES"."MOV_DOCUMENTOS" d 
        ON up.proveedor_id = d.proveedor_id AND d.estado_documento = 'V'
    GROUP BY up.usuario_id
),
capped_counts AS (
    SELECT
        up.usuario_id,
        up.username,
        up.proveedor_id,
        up.proveedor_nombre,
        up.nro_documento,
        up.ciiu,
        up.regimen_tributario,
        up.total_exigibles,
        (
            LEAST(COALESCE(c.reg_sst, 0), up.exigible_sst) +
            LEAST(COALESCE(c.reg_ma, 0), up.exigible_ma) +
            LEAST(COALESCE(c.reg_calidad, 0), up.exigible_calidad) +
            LEAST(COALESCE(c.reg_patrimonial, 0), up.exigible_patrimonial) +
            LEAST(COALESCE(c.reg_etica, 0), up.exigible_etica)
        ) AS cantidad_documentos_vigentes
    FROM usuarios_proveedores up
    LEFT JOIN doc_counts c ON up.usuario_id = c.usuario_id
),
evaluacion AS (
    SELECT 
        usuario_id,
        username,
        proveedor_id,
        proveedor_nombre,
        nro_documento,
        ciiu,
        regimen_tributario,
        total_exigibles,
        cantidad_documentos_vigentes,
        ROUND((cantidad_documentos_vigentes::numeric / NULLIF(total_exigibles, 0)) * 100, 0) AS puntaje_numerico,
        CASE 
            WHEN ((cantidad_documentos_vigentes::numeric / NULLIF(total_exigibles, 0)) * 100) > 90 THEN 'RECOMENDADO'
            WHEN ((cantidad_documentos_vigentes::numeric / NULLIF(total_exigibles, 0)) * 100) >= 75 THEN 'RECOMENDADO CON RESTRICCIONES'
            ELSE 'NO RECOMENDADO'
        END AS recomendacion,
        CASE 
            WHEN ((cantidad_documentos_vigentes::numeric / NULLIF(total_exigibles, 0)) * 100) > 90 THEN 'ALTO'
            WHEN ((cantidad_documentos_vigentes::numeric / NULLIF(total_exigibles, 0)) * 100) >= 75 THEN 'MEDIO'
            ELSE 'BAJO'
        END AS nivel_documental
    FROM capped_counts
)
SELECT 
    (SELECT COUNT(*) FROM evaluacion) AS total_proveedores,
    (SELECT COUNT(*) FROM evaluacion WHERE recomendacion = 'RECOMENDADO') AS recomendados,
    (SELECT COUNT(*) FROM evaluacion WHERE recomendacion = 'RECOMENDADO CON RESTRICCIONES') AS recomendados_con_restricciones,
    (SELECT COUNT(*) FROM evaluacion WHERE recomendacion = 'NO RECOMENDADO') AS no_recomendados,
    COALESCE(
        json_agg(
            json_build_object(
                'usuario_id', usuario_id,
                'username', username,
                'proveedor_id', proveedor_id,
                'proveedor_nombre', proveedor_nombre,
                'nro_documento', nro_documento,
                'ciiu', ciiu,
                'regimen_tributario', regimen_tributario,
                'total_exigibles', total_exigibles,
                'cantidad_documentos_vigentes', cantidad_documentos_vigentes,
                'puntaje_numerico', puntaje_numerico,
                'recomendacion', recomendacion,
                'nivel_documental', nivel_documental
            )
        ) FILTER (WHERE usuario_id IS NOT NULL),
        '[]'::json
    ) AS proveedores
FROM evaluacion;
    `;
    const result = await pool.query(sql, params);
    const row = result.rows[0] || {
        total_proveedores: 0,
        recomendados: 0,
        recomendados_con_restricciones: 0,
        no_recomendados: 0,
        proveedores: []
    };
    return {
        total_proveedores: Number(row.total_proveedores) || 0,
        recomendados: Number(row.recomendados) || 0,
        recomendados_con_restricciones: Number(row.recomendados_con_restricciones) || 0,
        no_recomendados: Number(row.no_recomendados) || 0,
        proveedores: row.proveedores || []
    };
};

const obtenerCumplimientoGlobalPorGestion = async (periodo, rubro) => {
    let whereProv = "(r.codigo = 'PROVEEDOR' OR u.rol_id = 2) AND u.estado_usuario = 'A'";
    const params = [];

    if (periodo && periodo !== 'ALL') {
        params.push(periodo);
        whereProv += ` AND p.periodo = $${params.length}`;
    }

    if (rubro && rubro !== 'ALL') {
        params.push(rubro);
        whereProv += ` AND p.ciiu::varchar = $${params.length}::varchar`;
    }

    const sql = `
WITH usuarios_proveedores AS (
    SELECT 
        u.usuario_id,
        u.proveedor_id,
        p.ciiu,
        CASE 
            WHEN p.regimen_tributario = 'RG' THEN 12
            WHEN p.regimen_tributario = 'RP' THEN 9
            WHEN p.regimen_tributario = 'RM' THEN 7
            ELSE 12
        END as exigible_sst,
        1 as exigible_ma,
        CASE 
            WHEN p.regimen_tributario = 'RG' THEN 13
            WHEN p.regimen_tributario = 'RP' THEN 10
            WHEN p.regimen_tributario = 'RM' THEN 8
            ELSE 13
        END as exigible_sst_ma,
        1 as exigible_calidad,
        1 as exigible_patrimonial,
        1 as exigible_etica
    FROM "SISGES"."SEG_USUARIO" u
    JOIN "SISGES"."SEG_ROL" r ON u.rol_id = r.rol_id
    LEFT JOIN "SISGES"."MAE_PROVEEDOR" p ON u.proveedor_id = p.proveedor_id
    WHERE ${whereProv}
),
doc_counts AS (
    SELECT
        up.usuario_id,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GSG' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_sst,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GMA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_ma,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GCA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_calidad,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GPA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_patrimonial,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GTR' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_etica
    FROM usuarios_proveedores up
    LEFT JOIN "SISGES"."MOV_DOCUMENTOS" d 
        ON up.proveedor_id = d.proveedor_id AND d.estado_documento = 'V'
    GROUP BY up.usuario_id
),
capped_counts AS (
    SELECT
        up.usuario_id,
        up.exigible_sst_ma,
        up.exigible_calidad,
        up.exigible_patrimonial,
        up.exigible_etica,
        (LEAST(COALESCE(c.reg_sst, 0), up.exigible_sst) + LEAST(COALESCE(c.reg_ma, 0), up.exigible_ma)) AS reg_sst_ma,
        LEAST(COALESCE(c.reg_calidad, 0), up.exigible_calidad) AS reg_calidad,
        LEAST(COALESCE(c.reg_patrimonial, 0), up.exigible_patrimonial) AS reg_patrimonial,
        LEAST(COALESCE(c.reg_etica, 0), up.exigible_etica) AS reg_etica
    FROM usuarios_proveedores up
    LEFT JOIN doc_counts c ON up.usuario_id = c.usuario_id
)
SELECT 
    'SST_MA' AS codigo,
    'SST-MA' AS nombre,
    COALESCE(SUM(reg_sst_ma), 0)::int AS documentos_registrados,
    COALESCE(SUM(exigible_sst_ma), 0)::int AS documentos_exigibles,
    COUNT(CASE WHEN reg_sst_ma >= exigible_sst_ma AND exigible_sst_ma > 0 THEN 1 END)::int AS proveedores_cumplidos,
    COUNT(*)::int AS total_proveedores,
    ROUND(COALESCE((SUM(reg_sst_ma)::numeric / NULLIF(SUM(exigible_sst_ma), 0)) * 100, 0), 2) AS porcentaje
FROM capped_counts
UNION ALL
SELECT 
    'CALIDAD' AS codigo,
    'CALIDAD' AS nombre,
    COALESCE(SUM(reg_calidad), 0)::int AS documentos_registrados,
    COALESCE(SUM(exigible_calidad), 0)::int AS documentos_exigibles,
    COUNT(CASE WHEN reg_calidad >= exigible_calidad AND exigible_calidad > 0 THEN 1 END)::int AS proveedores_cumplidos,
    COUNT(*)::int AS total_proveedores,
    ROUND(COALESCE((SUM(reg_calidad)::numeric / NULLIF(SUM(exigible_calidad), 0)) * 100, 0), 2) AS porcentaje
FROM capped_counts
UNION ALL
SELECT 
    'PATRIMONIAL' AS codigo,
    'SEG. PATRIMONIAL' AS nombre,
    COALESCE(SUM(reg_patrimonial), 0)::int AS documentos_registrados,
    COALESCE(SUM(exigible_patrimonial), 0)::int AS documentos_exigibles,
    COUNT(CASE WHEN reg_patrimonial >= exigible_patrimonial AND exigible_patrimonial > 0 THEN 1 END)::int AS proveedores_cumplidos,
    COUNT(*)::int AS total_proveedores,
    ROUND(COALESCE((SUM(reg_patrimonial)::numeric / NULLIF(SUM(exigible_patrimonial), 0)) * 100, 0), 2) AS porcentaje
FROM capped_counts
UNION ALL
SELECT 
    'ETICA' AS codigo,
    'ETICA' AS nombre,
    COALESCE(SUM(reg_etica), 0)::int AS documentos_registrados,
    COALESCE(SUM(exigible_etica), 0)::int AS documentos_exigibles,
    COUNT(CASE WHEN reg_etica >= exigible_etica AND exigible_etica > 0 THEN 1 END)::int AS proveedores_cumplidos,
    COUNT(*)::int AS total_proveedores,
    ROUND(COALESCE((SUM(reg_etica)::numeric / NULLIF(SUM(exigible_etica), 0)) * 100, 0), 2) AS porcentaje
FROM capped_counts;
    `;
    const result = await pool.query(sql, params);
    return result.rows;
};

const obtenerRankingProveedores = async (periodo, rubro) => {
    let whereProv = "(r.codigo = 'PROVEEDOR' OR u.rol_id = 2) AND u.estado_usuario = 'A'";
    const params = [];

    if (periodo && periodo !== 'ALL') {
        params.push(periodo);
        whereProv += ` AND p.periodo = $${params.length}`;
    }

    if (rubro && rubro !== 'ALL') {
        params.push(rubro);
        whereProv += ` AND p.ciiu::varchar = $${params.length}::varchar`;
    }

    const sql = `
WITH usuarios_proveedores AS (
    SELECT 
        u.usuario_id,
        u.username,
        u.proveedor_id,
        CASE
            WHEN p.razon_social IS NOT NULL AND TRIM(p.razon_social) <> '' THEN p.razon_social
            ELSE TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido_paterno,'') || ' ' || COALESCE(p.apellido_materno,''))
        END AS proveedor_nombre,
        p.nro_documento,
        p.ciiu,
        COALESCE(p.regimen_tributario, 'RG') AS regimen_tributario,
        COALESCE(reg_trib.descripcion_valor, 
            CASE 
                WHEN p.regimen_tributario = 'RG' THEN 'Régimen General'
                WHEN p.regimen_tributario = 'RP' THEN 'Pequeña Empresa'
                WHEN p.regimen_tributario = 'RM' THEN 'Micro Empresa'
                ELSE p.regimen_tributario
            END, 'Régimen General') AS descripcion_regimen_tributario,
        CASE 
            WHEN p.regimen_tributario = 'RG' THEN 12
            WHEN p.regimen_tributario = 'RP' THEN 9
            WHEN p.regimen_tributario = 'RM' THEN 7
            ELSE 12
        END as exigible_sst,
        1 as exigible_ma,
        1 as exigible_calidad,
        1 as exigible_patrimonial,
        1 as exigible_etica,
        CASE 
            WHEN p.regimen_tributario = 'RG' THEN 16
            WHEN p.regimen_tributario = 'RP' THEN 13
            WHEN p.regimen_tributario = 'RM' THEN 11
            ELSE 16
        END as total_exigibles
    FROM "SISGES"."SEG_USUARIO" u
    JOIN "SISGES"."SEG_ROL" r ON u.rol_id = r.rol_id
    LEFT JOIN "SISGES"."MAE_PROVEEDOR" p ON u.proveedor_id = p.proveedor_id
    LEFT JOIN "SISGES"."MAE_LISTA_VALORES" reg_trib 
        ON reg_trib.cod_grupo = '0100' 
        AND reg_trib.tipo_grupo = 'TIPO_REGIMEN' 
        AND reg_trib.codigo_valor::varchar = p.regimen_tributario::varchar
    WHERE ${whereProv}
),
doc_counts AS (
    SELECT
        up.usuario_id,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GSG' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_sst,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GMA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_ma,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GCA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_calidad,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GPA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_patrimonial,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GTR' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as reg_etica
    FROM usuarios_proveedores up
    LEFT JOIN "SISGES"."MOV_DOCUMENTOS" d 
        ON up.proveedor_id = d.proveedor_id AND d.estado_documento = 'V'
    GROUP BY up.usuario_id
),
capped_counts AS (
    SELECT
        up.usuario_id,
        up.username,
        up.proveedor_id,
        up.proveedor_nombre,
        up.nro_documento,
        up.ciiu,
        up.regimen_tributario,
        up.descripcion_regimen_tributario,
        up.exigible_sst,
        up.exigible_ma,
        up.exigible_calidad,
        up.exigible_patrimonial,
        up.exigible_etica,
        up.total_exigibles,
        LEAST(COALESCE(c.reg_sst, 0), up.exigible_sst) as reg_sst,
        LEAST(COALESCE(c.reg_ma, 0), up.exigible_ma) as reg_ma,
        LEAST(COALESCE(c.reg_calidad, 0), up.exigible_calidad) as reg_calidad,
        LEAST(COALESCE(c.reg_patrimonial, 0), up.exigible_patrimonial) as reg_patrimonial,
        LEAST(COALESCE(c.reg_etica, 0), up.exigible_etica) as reg_etica,
        (
            LEAST(COALESCE(c.reg_sst, 0), up.exigible_sst) +
            LEAST(COALESCE(c.reg_ma, 0), up.exigible_ma) +
            LEAST(COALESCE(c.reg_calidad, 0), up.exigible_calidad) +
            LEAST(COALESCE(c.reg_patrimonial, 0), up.exigible_patrimonial) +
            LEAST(COALESCE(c.reg_etica, 0), up.exigible_etica)
        ) AS total_vigentes
    FROM usuarios_proveedores up
    LEFT JOIN doc_counts c ON up.usuario_id = c.usuario_id
)
SELECT 
    usuario_id,
    username,
    proveedor_id,
    proveedor_nombre,
    nro_documento,
    ciiu,
    regimen_tributario,
    descripcion_regimen_tributario,
    exigible_sst,
    exigible_ma,
    exigible_calidad,
    exigible_patrimonial,
    exigible_etica,
    total_exigibles,
    reg_sst,
    reg_ma,
    reg_calidad,
    reg_patrimonial,
    reg_etica,
    total_vigentes,
    ROUND((total_vigentes::numeric / NULLIF(total_exigibles, 0)) * 100, 0) AS puntaje_global,
    CASE 
        WHEN ((total_vigentes::numeric / NULLIF(total_exigibles, 0)) * 100) > 90 THEN 'RECOMENDADO'
        WHEN ((total_vigentes::numeric / NULLIF(total_exigibles, 0)) * 100) >= 75 THEN 'RECOMENDADO CON RESTRICCIONES'
        ELSE 'NO RECOMENDADO'
    END AS recomendacion_global,
    CASE 
        WHEN ((total_vigentes::numeric / NULLIF(total_exigibles, 0)) * 100) > 90 THEN 'ALTO'
        WHEN ((total_vigentes::numeric / NULLIF(total_exigibles, 0)) * 100) >= 75 THEN 'MEDIO'
        ELSE 'BAJO'
    END AS nivel_documental_global
FROM capped_counts
ORDER BY puntaje_global DESC, proveedor_nombre ASC;
    `;

    const result = await pool.query(sql, params);
    return result.rows;
};

const obtenerAlertasConsultor = async (periodo, rubro) => {
    let whereProv = "(r.codigo = 'PROVEEDOR' OR u.rol_id = 2) AND u.estado_usuario = 'A'";
    const params = [];

    if (periodo && periodo !== 'ALL') {
        params.push(periodo);
        whereProv += ` AND p.periodo = $${params.length}`;
    }

    if (rubro && rubro !== 'ALL') {
        params.push(rubro);
        whereProv += ` AND p.ciiu::varchar = $${params.length}::varchar`;
    }

    // 1. Proveedores con documentos registrados vs exigibles (para cálculo de avance de llenado y alertas)
    const sqlProveedoresLlenado = `
WITH usuarios_proveedores AS (
    SELECT 
        u.usuario_id,
        u.username,
        u.proveedor_id,
        CASE
            WHEN p.razon_social IS NOT NULL AND TRIM(p.razon_social) <> '' THEN p.razon_social
            ELSE TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido_paterno,'') || ' ' || COALESCE(p.apellido_materno,''))
        END AS proveedor_nombre,
        p.nro_documento,
        p.ciiu,
        COALESCE(p.regimen_tributario, 'RG') AS regimen_tributario,
        COALESCE(reg_trib.descripcion_valor, 
            CASE 
                WHEN p.regimen_tributario = 'RG' THEN 'Régimen General'
                WHEN p.regimen_tributario = 'RP' THEN 'Pequeña Empresa'
                WHEN p.regimen_tributario = 'RM' THEN 'Micro Empresa'
                ELSE p.regimen_tributario
            END, 'Régimen General') AS descripcion_regimen_tributario,
        CASE 
            WHEN p.regimen_tributario = 'RG' THEN 12
            WHEN p.regimen_tributario = 'RP' THEN 9
            WHEN p.regimen_tributario = 'RM' THEN 7
            ELSE 12
        END as exigible_sst,
        1 as exigible_ma,
        1 as exigible_calidad,
        1 as exigible_patrimonial,
        1 as exigible_etica,
        CASE 
            WHEN p.regimen_tributario = 'RG' THEN 16
            WHEN p.regimen_tributario = 'RP' THEN 13
            WHEN p.regimen_tributario = 'RM' THEN 11
            ELSE 16
        END as total_exigibles
    FROM "SISGES"."SEG_USUARIO" u
    JOIN "SISGES"."SEG_ROL" r ON u.rol_id = r.rol_id
    LEFT JOIN "SISGES"."MAE_PROVEEDOR" p ON u.proveedor_id = p.proveedor_id
    LEFT JOIN "SISGES"."MAE_LISTA_VALORES" reg_trib 
        ON reg_trib.cod_grupo = '0100' 
        AND reg_trib.tipo_grupo = 'TIPO_REGIMEN' 
        AND reg_trib.codigo_valor::varchar = p.regimen_tributario::varchar
    WHERE ${whereProv}
),
doc_uploads AS (
    SELECT
        up.usuario_id,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GSG' THEN d.tipo_documento_id END) as uploaded_sst,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GMA' THEN d.tipo_documento_id END) as uploaded_ma,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GCA' THEN d.tipo_documento_id END) as uploaded_calidad,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GPA' THEN d.tipo_documento_id END) as uploaded_patrimonial,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GTR' THEN d.tipo_documento_id END) as uploaded_etica,

        COUNT(DISTINCT CASE WHEN d.alcance = 'GSG' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as vig_sst,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GMA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as vig_ma,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GCA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as vig_calidad,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GPA' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as vig_patrimonial,
        COUNT(DISTINCT CASE WHEN d.alcance = 'GTR' AND d.estado_documento = 'V' AND d.fecha_vigencia >= CURRENT_DATE THEN d.tipo_documento_id END) as vig_etica
    FROM usuarios_proveedores up
    LEFT JOIN "SISGES"."MOV_DOCUMENTOS" d 
        ON up.proveedor_id = d.proveedor_id AND (d.estado_documento = 'V' OR d.estado_documento = 'C')
    GROUP BY up.usuario_id
)
SELECT 
    up.usuario_id,
    up.username,
    up.proveedor_id,
    up.proveedor_nombre,
    up.nro_documento,
    up.ciiu,
    up.regimen_tributario,
    up.descripcion_regimen_tributario,
    up.exigible_sst,
    up.exigible_ma,
    up.exigible_calidad,
    up.exigible_patrimonial,
    up.exigible_etica,
    up.total_exigibles,
    COALESCE(u.uploaded_sst, 0) as uploaded_sst,
    COALESCE(u.uploaded_ma, 0) as uploaded_ma,
    COALESCE(u.uploaded_calidad, 0) as uploaded_calidad,
    COALESCE(u.uploaded_patrimonial, 0) as uploaded_patrimonial,
    COALESCE(u.uploaded_etica, 0) as uploaded_etica,
    (
        LEAST(COALESCE(u.uploaded_sst, 0), up.exigible_sst) +
        LEAST(COALESCE(u.uploaded_ma, 0), up.exigible_ma) +
        LEAST(COALESCE(u.uploaded_calidad, 0), up.exigible_calidad) +
        LEAST(COALESCE(u.uploaded_patrimonial, 0), up.exigible_patrimonial) +
        LEAST(COALESCE(u.uploaded_etica, 0), up.exigible_etica)
    ) AS total_uploaded_capped,
    (
        LEAST(COALESCE(u.vig_sst, 0), up.exigible_sst) +
        LEAST(COALESCE(u.vig_ma, 0), up.exigible_ma) +
        LEAST(COALESCE(u.vig_calidad, 0), up.exigible_calidad) +
        LEAST(COALESCE(u.vig_patrimonial, 0), up.exigible_patrimonial) +
        LEAST(COALESCE(u.vig_etica, 0), up.exigible_etica)
    ) AS total_vigentes_capped,
    COALESCE(u.vig_sst, 0) as vig_sst,
    COALESCE(u.vig_ma, 0) as vig_ma,
    COALESCE(u.vig_calidad, 0) as vig_calidad,
    COALESCE(u.vig_patrimonial, 0) as vig_patrimonial,
    COALESCE(u.vig_etica, 0) as vig_etica
FROM usuarios_proveedores up
LEFT JOIN doc_uploads u ON up.usuario_id = u.usuario_id
ORDER BY total_uploaded_capped ASC, up.proveedor_nombre ASC;
    `;

    // 2. Documentos por vencer en menos de 15 días (vigentes y por expirar)
    const sqlDocsPorVencer = `
SELECT 
    d.documento_id,
    d.proveedor_id,
    CASE
        WHEN p.razon_social IS NOT NULL AND TRIM(p.razon_social) <> '' THEN p.razon_social
        ELSE TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido_paterno,'') || ' ' || COALESCE(p.apellido_materno,''))
    END AS proveedor_nombre,
    p.nro_documento,
    d.alcance,
    CASE 
        WHEN d.alcance = 'GSG' THEN 'GESTIÓN SST'
        WHEN d.alcance = 'GMA' THEN 'GESTIÓN MA'
        WHEN d.alcance = 'GCA' THEN 'GESTIÓN DE CALIDAD'
        WHEN d.alcance = 'GPA' THEN 'GESTIÓN PATRIMONIAL'
        WHEN d.alcance = 'GTR' THEN 'CÓDIGO ÉTICA'
        ELSE d.alcance
    END AS gestion_nombre,
    d.tipo_documento_id,
    d.fecha_vigencia,
    (d.fecha_vigencia - CURRENT_DATE)::int AS dias_restantes
FROM "SISGES"."MOV_DOCUMENTOS" d
JOIN "SISGES"."MAE_PROVEEDOR" p ON d.proveedor_id = p.proveedor_id
JOIN "SISGES"."SEG_USUARIO" u ON u.proveedor_id = p.proveedor_id
JOIN "SISGES"."SEG_ROL" r ON u.rol_id = r.rol_id
WHERE ${whereProv}
  AND (d.estado_documento = 'V' OR d.estado_documento = 'C')
  AND d.fecha_vigencia >= CURRENT_DATE
  AND d.fecha_vigencia <= CURRENT_DATE + INTERVAL '15 days'
ORDER BY d.fecha_vigencia ASC, proveedor_nombre ASC;
    `;

    const [resLlenado, resPorVencer] = await Promise.all([
        pool.query(sqlProveedoresLlenado, params),
        pool.query(sqlDocsPorVencer, params)
    ]);

    return {
        proveedores: resLlenado.rows,
        documentos_por_vencer: resPorVencer.rows
    };
};

module.exports = {
    obtenerResumen,
    obtenerDocumentosPorGrupo,
    obtenerDocumentosPorEstado,
    obtenerProveedoresVencidos,
    obtenerDocumentosProximosVencer,
    obtenerCumplimientoPorGestion,
    obtenerEstadoExpediente,
    obtenerCalificacionProveedor,
    obtenerResumenProveedoresCumplimiento,
    obtenerCumplimientoGlobalPorGestion,
    obtenerRankingProveedores,
    obtenerAlertasConsultor
};