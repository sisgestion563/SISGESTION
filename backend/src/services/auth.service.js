const validPassword =
    await bcrypt.compare(
        password,
        user.password_hash
    );

console.log(
    'PASO 4 - PASSWORD VALIDADO',
    validPassword
);

if (!validPassword) {
    throw new Error(
        'Contraseña incorrecta'
    );
}

const token =
    generateToken({
        usuario_id: user.usuario_id,
        username: user.username,
        rol: user.rol,
        proveedor_id: user.proveedor_id
    });

return {
    token,
    usuario: {
        usuario_id: user.usuario_id,
        username: user.username,
        rol: user.rol,
        proveedor_id: user.proveedor_id,
        primer_ingreso: user.primer_ingreso
    }
};