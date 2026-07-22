const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET: Listar usuarios con filtro opcional por estado_usuario
//    ?filtro=TODOS | ACTIVOS | PENDIENTES | RECHAZADOS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/usuarios', async (req, res) => {
  const { filtro } = req.query;

  // Mapeo filtro → codigo estado_usuario
  const filtroMap = {
    ACTIVOS: "'A'",
    PENDIENTES: "'P'",
    RECHAZADOS: "'R'",
    INACTIVOS: "'I'"
  };

  const whereEstado = filtroMap[filtro]
    ? `AND u.estado_usuario = ${filtroMap[filtro]}`
    : ''; // TODOS: sin filtro adicional

  try {
    const query = `
      SELECT
        u.usuario_id,
        u.username,
        u.correo,
        u.estado,
        u.estado_usuario,
        u.rol_id,
        u.proveedor_id,
        u.primer_ingreso,
        u.ultimo_acceso,
        r.nombre  AS rol_nombre,
        r.codigo  AS rol_codigo,
        p.razon_social AS proveedor_nombre
      FROM "SISGES"."SEG_USUARIO" u
      LEFT JOIN "SISGES"."SEG_ROL" r ON u.rol_id = r.rol_id
      LEFT JOIN "SISGES"."MAE_PROVEEDOR" p ON u.proveedor_id = p.proveedor_id
      WHERE 1=1
        ${whereEstado}
      ORDER BY
        CASE u.estado_usuario WHEN 'P' THEN 0 WHEN 'A' THEN 1 WHEN 'R' THEN 2 ELSE 3 END,
        u.usuario_id DESC;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error en GET /api/usuarios:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET: Detalle de un usuario específico
// ─────────────────────────────────────────────────────────────────────────────
router.get('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT
        u.usuario_id,
        u.username,
        u.correo,
        u.estado,
        u.estado_usuario,
        u.rol_id,
        u.primer_ingreso,
        u.proveedor_id,
        u.create_date,
        r.nombre AS rol_nombre,
        r.codigo AS rol_codigo,
        p.razon_social AS proveedor_nombre
      FROM "SISGES"."SEG_USUARIO" u
      LEFT JOIN "SISGES"."SEG_ROL" r ON u.rol_id = r.rol_id
      LEFT JOIN "SISGES"."MAE_PROVEEDOR" p ON u.proveedor_id = p.proveedor_id
      WHERE u.usuario_id = $1;
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(`❌ Error en GET /api/usuarios/${id}:`, error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/usuarios/registro — Auto-registro público (sin autenticación)
//    Crea usuario en estado PENDIENTE, sin rol ni proveedor
// ─────────────────────────────────────────────────────────────────────────────
router.post('/usuarios/registro', async (req, res) => {
  const { username, password, correo } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // rol_id = 2 (PROVEEDOR) por defecto para cumplir el NOT NULL de la BD.
    // El administrador reasignará el rol real al momento de aprobar.
    const query = `
      INSERT INTO "SISGES"."SEG_USUARIO"
        (username, correo, password_hash, rol_id, estado_usuario, primer_ingreso, estado)
      VALUES
        ($1, $2, $3, 2, 'P', 'N', 'I')
      RETURNING usuario_id, username, correo;
    `;

    const result = await pool.query(query, [username, correo || null, passwordHash]);

    res.status(201).json({
      message: 'Solicitud enviada. Un administrador revisará tu cuenta.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error en POST /api/usuarios/registro:', error.message);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. POST: Crear usuario (desde el panel Admin - flujo original)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/usuarios', async (req, res) => {
  const { username, correo, password, rol_id, primer_ingreso } = req.body;

  if (!username || !password || !rol_id) {
    return res.status(400).json({ error: 'Username, password y rol_id son obligatorios' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO "SISGES"."SEG_USUARIO"
        (username, correo, password_hash, rol_id, estado, estado_usuario, primer_ingreso)
      VALUES
        ($1, $2, $3, $4, 'A', 'A', $5)
      RETURNING usuario_id, username, correo, rol_id;
    `;

    const values = [username, correo, passwordHash, rol_id, primer_ingreso || 'L'];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: '✅ Usuario creado con éxito y contraseña encriptada',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error en POST /api/usuarios:', error.message);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'El nombre de usuario ya se encuentra registrado' });
    }

    res.status(500).json({ error: 'Error interno del servidor al guardar' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. PUT /api/usuarios/:id/aprobar — Aprobar usuario pendiente
//    Solo requiere rol_id. El proveedor_id se asocia después cuando el
//    usuario rellena su propia ficha (MAE_PROVEEDOR).
// ─────────────────────────────────────────────────────────────────────────────
router.put('/usuarios/:id/aprobar', async (req, res) => {
  const { id } = req.params;
  const { rol_id } = req.body;

  if (!rol_id) {
    return res.status(400).json({ error: 'El rol es obligatorio para aprobar un usuario' });
  }

  try {
    const intRolId     = parseInt(rol_id, 10);
    const intUsuarioId = parseInt(id, 10);

    if (isNaN(intRolId) || isNaN(intUsuarioId)) {
      return res.status(400).json({ error: 'IDs con formato inválido' });
    }

    // Obtener código del rol para ajustar primer_ingreso
    const rolResult = await pool.query(
      `SELECT codigo FROM "SISGES"."SEG_ROL" WHERE rol_id = $1`,
      [intRolId]
    );

    if (rolResult.rows.length === 0) {
      return res.status(400).json({ error: 'Rol no encontrado' });
    }

    const rolCodigo = rolResult.rows[0].codigo;

    // PROVEEDOR y CONSULTOR → 'H' para que puedan editar su ficha al ingresar
    // ADMIN / otros         → 'L'
    const estadoEdicion = (rolCodigo === 'PROVEEDOR' || rolCodigo === 'CONSULTOR') ? 'H' : 'L';

    const result = await pool.query(
      `UPDATE "SISGES"."SEG_USUARIO"
       SET
         rol_id         = $1,
         estado_usuario = 'A',
         estado         = 'A',
         primer_ingreso = 'L',
         update_date    = NOW()
       WHERE usuario_id = $2
       RETURNING usuario_id, username, estado_usuario, rol_id;`,
      [intRolId, intUsuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: '✅ Usuario aprobado correctamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error(`❌ Error en PUT /api/usuarios/${id}/aprobar:`, error.message);
    res.status(500).json({ error: error.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// 6. PUT /api/usuarios/:id/rechazar — Rechazar usuario pendiente
// ─────────────────────────────────────────────────────────────────────────────
router.put('/usuarios/:id/rechazar', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE "SISGES"."SEG_USUARIO"
       SET estado_usuario = 'R', update_date = NOW()
       WHERE usuario_id = $1
       RETURNING usuario_id, username, estado_usuario;`,
      [parseInt(id, 10)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: '✅ Usuario rechazado correctamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error(`❌ Error en PUT /api/usuarios/${id}/rechazar:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. PUT /api/usuarios/:id — Editar usuario (flujo Admin existente)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { username, correo, password, rol_id, primer_ingreso } = req.body;

  if (!username || !rol_id) {
    return res.status(400).json({ error: 'El nombre de usuario y el rol son requeridos.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const intRolId = parseInt(rol_id, 10);
    const intUsuarioId = parseInt(id, 10);

    if (isNaN(intRolId) || isNaN(intUsuarioId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El ID de usuario o el ID de rol no tienen un formato numérico válido.' });
    }

    // Buscar proveedor_id actual del usuario
    const buscaProveedorQuery = `
      SELECT proveedor_id FROM "SISGES"."SEG_USUARIO" WHERE usuario_id = $1
    `;
    const userCheck = await client.query(buscaProveedorQuery, [intUsuarioId]);
    const miProveedorId = userCheck.rows[0]?.proveedor_id;

    // Si tiene proveedor_id, sincronizar cod_estado_edicion en MAE_PROVEEDOR
    if (miProveedorId) {
      const updateProveedorSql = `
        UPDATE "SISGES"."MAE_PROVEEDOR"
        SET cod_estado_edicion = $1
        WHERE proveedor_id = $2
      `;
      await client.query(updateProveedorSql, [primer_ingreso || 'L', miProveedorId]);
    }

    // Actualizar SEG_USUARIO
    let queryUsuario = '';
    let valuesUsuario = [];

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(password, salt);

      queryUsuario = `
        UPDATE "SISGES"."SEG_USUARIO"
        SET
          username      = $1,
          correo        = $2,
          password_hash = $3,
          rol_id        = $4,
          primer_ingreso = $5
        WHERE usuario_id = $6
        RETURNING usuario_id, username, correo, rol_id, primer_ingreso;
      `;
      valuesUsuario = [username, correo, newPasswordHash, intRolId, primer_ingreso || 'L', intUsuarioId];
    } else {
      queryUsuario = `
        UPDATE "SISGES"."SEG_USUARIO"
        SET
          username      = $1,
          correo        = $2,
          rol_id        = $3,
          primer_ingreso = $4
        WHERE usuario_id = $5
        RETURNING usuario_id, username, correo, rol_id, primer_ingreso;
      `;
      valuesUsuario = [username, correo, intRolId, primer_ingreso || 'L', intUsuarioId];
    }

    const resultUsuario = await client.query(queryUsuario, valuesUsuario);

    if (resultUsuario.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'El usuario a modificar no existe.' });
    }

    await client.query('COMMIT');

    res.json({
      message: '✅ Usuario y permisos actualizados con éxito en el sistema',
      user: resultUsuario.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Error en PUT /api/usuarios/${id}:`, error.message);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'El nombre de usuario ingresado ya está en uso por otra cuenta.' });
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;