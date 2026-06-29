const pool = require('../config/db');

const obtenerDepartamentos = async () => {

    const sql = `
        SELECT DISTINCT
               departamento
        FROM "SISGES"."MAE_UBIGEO"
        ORDER BY departamento
    `;

    const result = await pool.query(sql);

    return result.rows;
};

const obtenerProvincias = async (
    departamento
) => {

    const sql = `
        SELECT DISTINCT
               provincia
        FROM "SISGES"."MAE_UBIGEO"
        WHERE departamento = $1
        ORDER BY provincia
    `;

    const result =
        await pool.query(
            sql,
            [departamento]
        );

    return result.rows;
};

const obtenerDistritos = async (
    departamento,
    provincia
) => {

    const sql = `
        SELECT
            ubigeo_inei,
            distrito
        FROM "SISGES"."MAE_UBIGEO"
        WHERE departamento = $1
          AND provincia = $2
        ORDER BY distrito
    `;

    const result =
        await pool.query(
            sql,
            [departamento, provincia]
        );

    return result.rows;
};

module.exports = {
    obtenerDepartamentos,
    obtenerProvincias,
    obtenerDistritos
};