const actualizar = async (usuario_id, datos) => {
    const sql = `
        UPDATE "SISGES"."SEG_USUARIO"
        SET 
            username = $1,
            correo = $2,
            rol_id = $3,
            primer_ingreso = $4,
            update_date = NOW()
        WHERE usuario_id = $5
        RETURNING *
    `;
    
    const values = [
        datos.username,
        datos.correo,
        datos.rol_id,
        datos.primer_ingreso, // 'H' o 'L'
        usuario_id
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
};

module.exports = {
    // ... tus otras funciones (listar, crear, etc.)
    actualizar
};