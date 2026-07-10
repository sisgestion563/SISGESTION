import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportarExcel = ({
    nombreArchivo,
    nombreHoja,
    titulo,
    subtitulo,
    columnas,
    datos
}) => {

    const workbook = XLSX.utils.book_new();

    const filas = [];

    // Encabezado del reporte
    filas.push([titulo]);
    filas.push([subtitulo]);
    filas.push([]);
    filas.push([`Fecha: ${new Date().toLocaleString()}`]);
    filas.push([`Total Registros: ${datos.length}`]);
    filas.push([]);

    // Encabezados
    filas.push(
        columnas.map(c => c.titulo)
    );

    // Datos
    datos.forEach(item => {

        filas.push(

            columnas.map(col => item[col.campo])

        );

    });

    const worksheet =
        XLSX.utils.aoa_to_sheet(filas);

    // Auto ancho de columnas
    worksheet["!cols"] =
        columnas.map(col => ({
            wch: col.ancho || 25
        }));

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        nombreHoja
    );

    const excelBuffer =
        XLSX.write(
            workbook,
            {
                bookType: 'xlsx',
                type: 'array'
            }
        );

    const blob =
        new Blob(
            [excelBuffer],
            {
                type:
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        );

    saveAs(
        blob,
        `${nombreArchivo}_${new Date().toISOString().substring(0,10)}.xlsx`
    );

};