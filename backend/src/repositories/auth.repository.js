const pool = require('../config/db');

const findByUsername = async (username) => {

    const sql = `
        SELECT
            u.usuario_id,
            u.username,
            u.password_hash,
            u.proveedor_id::varchar AS proveedor_id,
            u.primer_ingreso,
            u.estado_usuario,
            r.codigo AS rol
        FROM "SISGES"."SEG_USUARIO" u
        JOIN "SISGES"."SEG_ROL" r
             ON r.rol_id = u.rol_id
        WHERE u.username = $1
          AND u.estado_usuario = 'A'
    `;

    const result = await pool.query(
        sql,
        [username]
    );

    return result.rows[0];

};

module.exports = {
    findByUsername
};