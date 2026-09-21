require('dotenv').config();

const pool =
    require('../src/config/db');

const ejecutar =
async () => {

    try {

        console.log(
            'Iniciando proceso automático de actualización de estados de documentos...'
        );

        await pool.query(
            `
            CALL "SISGES"."pr_actualizar_estado_documentos"(NULL)
            `
        );

        console.log(
            'Proceso automático ejecutado correctamente.'
        );

    } catch (error) {

        console.error(
            'Error al ejecutar el proceso automático:',
            error
        );

        process.exitCode = 1;

    } finally {

        await pool.end();

    }

};

ejecutar();