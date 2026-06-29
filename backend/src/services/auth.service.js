const bcrypt = require('bcrypt');

const authRepository =
require('../repositories/auth.repository');

const {
    generateToken
} = require('../utils/jwt.util');

const login = async (
    username,
    password
) => {

    console.log(
        'PASO 1 - BUSCANDO USUARIO',
        username
    );

    const user =
        await authRepository.findByUsername(
            username
        );

    console.log(
        'PASO 2 - USUARIO ENCONTRADO',
        user
    );

    if (!user) {
        throw new Error(
            'Usuario no existe'
        );
    }

    console.log(
        'PASO 3 - VALIDANDO PASSWORD'
    );

    const validPassword =
        await bcrypt.compare(
            password,
            user.password_hash
        );

    console.log(
        'PASO 4 - PASSWORD VALIDADO',
        validPassword
    );

   




    const token =
        generateToken({
            usuario_id: user.usuario_id,
            username: user.username,
            rol: user.rol,
            proveedor_id:
                user.proveedor_id
        });

    return {
        token,
        usuario: {
            usuario_id:
                user.usuario_id,
            username:
                user.username,
            rol:
                user.rol,
            proveedor_id:
                user.proveedor_id,
            primer_ingreso:
                user.primer_ingreso
        }
    };

};

module.exports = {
    login
};