export default function Header() {

    const usuario =
        JSON.parse(
            localStorage.getItem('usuario')
        );

    const fecha =
        new Date().toLocaleDateString(
            'es-PE'
        );

    return (

        <div
            style={{
                height: '70px',
                background: 'white',
                borderBottom:
                    '1px solid #E5E7EB',

                display: 'flex',

                justifyContent:
                    'space-between',

                alignItems: 'center',

                padding:
                    '0 25px'
            }}
        >

            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: '#1f2937' }}>
                Sistema de Gestión Documental y Homologación de Proveedores
            </h2>

            <div
                style={{
                    textAlign: 'right'
                }}
            >

                <div>

                    <strong>
                        {usuario?.username}
                    </strong>

                </div>

                <div>

                    {usuario?.rol}

                </div>

                <div>

                    {fecha}

                </div>

            </div>

        </div>

    );

}