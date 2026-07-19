const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Apunta directo a tu archivo de conexión con las variables .env
const bcrypt = require('bcryptjs'); // Importamos bcryptjs para encriptar las claves

// 1. GET: Listar usuarios (Para tu tabla en UsersPage.jsx)
router.get('/usuarios', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.usuario_id, 
        u.username, 
        u.correo, 
        u.estado, 
        u.rol_id, -- Asegura consistencia en los formularios
        u.primer_ingreso,
        u.ultimo_acceso,
        r.nombre AS rol_nombre,
        r.codigo AS rol_codigo
      FROM "SISGES"."SEG_USUARIO" u
      INNER JOIN "SISGES"."SEG_ROL" r ON u.rol_id = r.rol_id
      WHERE u.estado = 'A'
      ORDER BY u.usuario_id DESC;
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error en GET /api/usuarios:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 2. GET: Detalle de un usuario específico (Para tu pantalla UserDetailPage.jsx de solo lectura)
router.get('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        u.usuario_id, 
        u.username, 
        u.correo, 
        u.estado, 
        u.rol_id,
        u.primer_ingreso,
        u.proveedor_id, 
        u.create_date,
        r.nombre AS rol_nombre, 
        r.codigo AS rol_codigo
      FROM "SISGES"."SEG_USUARIO" u
      INNER JOIN "SISGES"."SEG_ROL" r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = $1;
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`❌ Error en GET /api/usuarios/${id}:`, error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 3. POST: Crear un nuevo usuario encriptando la contraseña con Bcrypt
router.post('/usuarios', async (req, res) => {
  const { username, correo, password, rol_id } = req.body;

  if (!username || !password || !rol_id) {
    return res.status(400).json({ error: "Username, password y rol_id son obligatorios" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO "SISGES"."SEG_USUARIO" 
        (username, correo, password_hash, rol_id, estado, primer_ingreso)
      VALUES 
        ($1, $2, $3, $4, 'A', 'L')
      RETURNING usuario_id, username, correo, rol_id;
    `;

    const values = [username, correo, passwordHash, rol_id];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "✅ Usuario creado con éxito y contraseña encriptada",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Error en POST /api/usuarios:", error.message);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: "El nombre de usuario ya se encuentra registrado" });
    }
    
    res.status(500).json({ error: "Error interno del servidor al guardar" });
  }
});

// 🚀 4. PUT: Modificar usuario y controlar el permiso de edición directo en MAE_PROVEEDOR usando proveedor_id dinámico
router.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { username, correo, password, rol_id, primer_ingreso } = req.body;

  if (!username || !rol_id) {
    return res.status(400).json({ error: "El nombre de usuario y el rol son requeridos." });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const intRolId = parseInt(rol_id, 10);
    const intUsuarioId = parseInt(id, 10);

    if (isNaN(intRolId) || isNaN(intUsuarioId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "El ID de usuario o el ID de rol no tienen un formato numérico válido." });
    }

    // 1. Buscamos el proveedor_id real asignado al registro de usuario
    const buscaProveedorQuery = `
      SELECT proveedor_id FROM "SISGES"."SEG_USUARIO" WHERE usuario_id = $1
    `;
    const userCheck = await client.query(buscaProveedorQuery, [intUsuarioId]);
    const miProveedorId = userCheck.rows[0]?.proveedor_id;

    // 2. Si el usuario tiene un proveedor_id, actualizamos cod_estado_edicion sin importar cuál sea su rol_id
    if (miProveedorId) {
      const updateProveedorSql = `
        UPDATE "SISGES"."MAE_PROVEEDOR"
        SET cod_estado_edicion = $1
        WHERE proveedor_id = $2
      `;
      await client.query(updateProveedorSql, [primer_ingreso || 'L', miProveedorId]);
    }

    // 3. Actualizamos la información de SEG_USUARIO
    let queryUsuario = '';
    let valuesUsuario = [];

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(password, salt);

      queryUsuario = `
        UPDATE "SISGES"."SEG_USUARIO"
        SET 
          username = $1,
          correo = $2,
          password_hash = $3,
          rol_id = $4,
          primer_ingreso = $5
        WHERE usuario_id = $6
        RETURNING usuario_id, username, correo, rol_id, primer_ingreso;
      `;
      valuesUsuario = [username, correo, newPasswordHash, intRolId, primer_ingreso || 'L', intUsuarioId];
    } else {
      queryUsuario = `
        UPDATE "SISGES"."SEG_USUARIO"
        SET 
          username = $1,
          correo = $2,
          rol_id = $3,
          primer_ingreso = $4
        WHERE usuario_id = $5
        RETURNING usuario_id, username, correo, rol_id, primer_ingreso;
      `;
      valuesUsuario = [username, correo, intRolId, primer_ingreso || 'L', intUsuarioId];
    }

    const resultUsuario = await client.query(queryUsuario, valuesUsuario);

    if (resultUsuario.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "El usuario a modificar no existe." });
    }

    await client.query('COMMIT');

    res.json({
      message: "✅ Usuario y permisos actualizados con éxito en el sistema",
      user: resultUsuario.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Error en PUT /api/usuarios/${id}:`, error.message);

    if (error.code === '23505') {
      return res.status(400).json({ error: "El nombre de usuario ingresado ya está en uso por otra cuenta." });
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;