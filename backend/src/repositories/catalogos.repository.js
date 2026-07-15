const pool = require('../config/db');

const obtenerGrupos = async () => {

    const sql = `
        SELECT DISTINCT
               cod_grupo,
               tipo_grupo
        FROM "SISGES"."MAE_LISTA_VALORES"
        ORDER BY
               cod_grupo,
               tipo_grupo
    `;

    const result = await pool.query(sql);

    return result.rows;
};

const obtenerValores = async (
    codGrupo,
    tipoGrupo
) => {

    const sql = `
        SELECT
            codigo_valor,
            descripcion
        FROM "SISGES"."MAE_LISTA_VALORES"
        WHERE cod_grupo = $1
          AND tipo_grupo = $2
        ORDER BY codigo_valor
    `;

    const result = await pool.query(
        sql,
        [codGrupo, tipoGrupo]
    );

    return result.rows;
};

module.exports = {
    obtenerGrupos,
    obtenerValores
};