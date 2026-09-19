const obtenerFechaLima = () => {

    return new Intl.DateTimeFormat(
        'en-CA',
        {
            timeZone: 'America/Lima',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }
    ).format(new Date());

};

const calcularEstadoDocumento = (
    fechaVigencia
) => {

    const hoy = obtenerFechaLima();

    const fechaDoc =
        String(fechaVigencia).substring(0, 10);

    return fechaDoc <= hoy
        ? 'C'
        : 'V';
};

module.exports = {
    calcularEstadoDocumento
};