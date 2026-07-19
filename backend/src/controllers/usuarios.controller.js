const usuariosRepository = require('../repositories/usuarios.repository');

const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { username, correo, rol_id, primer_ingreso } = req.body;

    try {
        const usuarioActualizado = await usuariosRepository.actualizar(id, {
            username,
            correo,
            rol_id,
            primer_ingreso
        });

        if (!usuarioActualizado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        return res.json({
            message: "Usuario actualizado correctamente",
            data: usuarioActualizado
        });
    } catch (error) {
        console.error("Error en actualizarUsuario:", error);
        return res.status(500).json({ error: "Error interno del servidor al actualizar" });
    }
};

module.exports = {
    // ... tus otros métodos
    actualizarUsuario
};