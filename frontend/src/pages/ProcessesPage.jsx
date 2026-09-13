import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { actualizarEstadosDocumentos } from '../services/procesos.service';

export default function ProcessesPage() {

    const [ejecutando, setEjecutando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState('');

    const ejecutarProceso = async () => {

        setEjecutando(true);
        setResultado(null);
        setError('');

        try {

            const response =
                await actualizarEstadosDocumentos();

            if (response?.ok) {

                setResultado(response.data);

            } else {

                setError(
                    response?.message ||
                    'El proceso no pudo ser ejecutado.'
                );

            }

        } catch (err) {

            console.error(
                'Error ejecutando proceso:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Ocurrió un error al ejecutar el proceso.'
            );

        } finally {

            setEjecutando(false);

        }

    };

    return (

        <MainLayout>

            <div>

                <h1
                    style={{
                        marginBottom: '8px'
                    }}
                >
                    Procesos
                </h1>

                <p
                    style={{
                        color: '#64748B',
                        marginTop: 0,
                        marginBottom: '24px'
                    }}
                >
                    Administración y ejecución de procesos del sistema.
                </p>

                <div
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        marginBottom: '24px'
                    }}
                >

                    <h2
                        style={{
                            marginTop: 0,
                            marginBottom: '10px'
                        }}
                    >
                        Actualización de estados de documentos
                    </h2>

                    <p
                        style={{
                            color: '#475569',
                            lineHeight: '1.6',
                            marginBottom: '20px'
                        }}
                    >
                        Ejecuta el proceso que verifica el estado de
                        vigencia de los documentos registrados en SISGESTION.
                    </p>

                    <button
                        onClick={ejecutarProceso}
                        disabled={ejecutando}
                        style={{
                            backgroundColor: ejecutando
                                ? '#94A3B8'
                                : '#2563EB',
                            color: 'white',
                            border: 'none',
                            padding: '11px 20px',
                            borderRadius: '8px',
                            cursor: ejecutando
                                ? 'not-allowed'
                                : 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {ejecutando
                            ? 'Ejecutando...'
                            : 'Ejecutar proceso'}
                    </button>

                </div>

                {error && (

                    <div
                        style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            color: '#991B1B',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '24px'
                        }}
                    >
                        <strong>Error:</strong> {error}
                    </div>

                )}

                {resultado && (

                    <div
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    >

                        <h2
                            style={{
                                marginTop: 0,
                                marginBottom: '20px'
                            }}
                        >
                            Resultado de la ejecución
                        </h2>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: '16px'
                            }}
                        >

                            <div>
                                <strong>Proceso</strong>
                                <div>
                                    {resultado.nombre_proceso || '-'}
                                </div>
                            </div>

                            <div>
                                <strong>Tipo de ejecución</strong>
                                <div>
                                    {resultado.tipo_ejecucion || '-'}
                                </div>
                            </div>

                            <div>
                                <strong>Estado</strong>
                                <div>
                                    {resultado.estado_ejecucion || '-'}
                                </div>
                            </div>

                            <div>
                                <strong>Usuario</strong>
                                <div>
                                    {resultado.usuario || '-'}
                                </div>
                            </div>

                            <div>
                                <strong>Fecha de inicio</strong>
                                <div>
                                    {resultado.fecha_inicio
                                        ? new Date(
                                            resultado.fecha_inicio
                                        ).toLocaleString()
                                        : '-'}
                                </div>
                            </div>

                            <div>
                                <strong>Fecha de fin</strong>
                                <div>
                                    {resultado.fecha_fin
                                        ? new Date(
                                            resultado.fecha_fin
                                        ).toLocaleString()
                                        : '-'}
                                </div>
                            </div>

                            <div>
                                <strong>Documentos evaluados</strong>
                                <div>
                                    {resultado.total_evaluados ?? 0}
                                </div>
                            </div>

                            <div>
                                <strong>Documentos actualizados</strong>
                                <div>
                                    {resultado.total_actualizados ?? 0}
                                </div>
                            </div>

                        </div>

                        <div
                            style={{
                                marginTop: '20px'
                            }}
                        >

                            <strong>Observaciones</strong>

                            <div
                                style={{
                                    marginTop: '6px',
                                    color: '#475569'
                                }}
                            >
                                {resultado.observaciones || '-'}
                            </div>

                        </div>

                    </div>

                )}

            </div>

        </MainLayout>

    );

}

