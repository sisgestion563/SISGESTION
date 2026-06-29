const calcularEstadoDocumento = (fechaVigencia) => {

    const hoy = new Date();

    hoy.setHours(0,0,0,0);

    const fechaDoc = new Date(fechaVigencia);

    fechaDoc.setHours(0,0,0,0);

    return fechaDoc <= hoy
        ? 'C'
        : 'V';
};

module.exports = {
    calcularEstadoDocumento
};