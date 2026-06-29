import {
    useEffect,
    useState
} from 'react';

import MainLayout
from '../layouts/MainLayout';


import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

import {
    obtenerResumen,
    obtenerDocumentosPorGrupo,
    obtenerDocumentosPorEstado,
    obtenerProximosVencer
}
from '../services/dashboard.service';

export default function DashboardPage() {

    const [
        resumen,
        setResumen
    ] = useState(null);

    useEffect(() => {

        cargarDashboard();

    }, []);
	
	
	const [
    grupos,
    setGrupos
] = useState([]);

const [
    estados,
    setEstados
] = useState([]);

const [
    proximos,
    setProximos
] = useState([]);
	
	
	

    const cargarDashboard =
async () => {

    try {

        const resumenData =
            await obtenerResumen();

        const gruposData =
            await obtenerDocumentosPorGrupo();

        const estadosData =
            await obtenerDocumentosPorEstado();

        const proximosData =
            await obtenerProximosVencer();

        setResumen(resumenData);

        setGrupos(
    gruposData.map(
        item => ({
            ...item,
            cantidad: Number(item.cantidad)
        })
    )
);

setEstados(
    estadosData.map(
        item => ({
            ...item,
            cantidad: Number(item.cantidad)
        })
    )
);

        setProximos(proximosData);

    }
    catch(error){

        console.error(error);

    }

};

    return (

        <MainLayout>

            <h1>
                Dashboard SISGESTION
            </h1>

            {
                resumen && (

                    <div
                        style={{
                            display:'grid',
                            gridTemplateColumns:
                            'repeat(4,1fr)',
                            gap:'20px',
                            marginTop:'30px'
                        }}
                    >

                        <div className="card">

                            <h3>
                                Proveedores
                            </h3>

                            <h1>
                                {
                                  resumen.total_proveedores
                                }
                            </h1>

                        </div>

                        <div className="card">

                            <h3>
                                Documentos
                            </h3>

                            <h1>
                                {
                                  resumen.total_documentos
                                }
                            </h1>

                        </div>

                        <div className="card">

                            <h3>
                                Vigentes
                            </h3>

                            <h1
                                style={{
                                  color:'#16A34A'
                                }}
                            >
                                {
                                  resumen.documentos_vigentes
                                }
                            </h1>

                        </div>

                        <div className="card">

                            <h3>
                                Vencidos
                            </h3>

                            <h1
                                style={{
                                  color:'#DC2626'
                                }}
                            >
                                {
                                  resumen.documentos_vencidos
                                }
                            </h1>

                        </div>

                    </div>

                )
            }
			
			{
    grupos.length > 0 && (

        <div
            className="card"
            style={{
                marginTop:'30px'
            }}
        >

            <h2>
                Documentos por Grupo
            </h2>

            <ResponsiveContainer
                width="100%"
                height={300}
            >

                <BarChart
                    data={grupos}
                >

                    <XAxis
                        dataKey="descripcion"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                        dataKey="cantidad"
                        fill="#2563EB"
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    )
}
{
    estados.length > 0 && (

        <div
            className="card"
            style={{
                marginTop:'30px'
            }}
        >

            <h2>
    Estado de Documentos
</h2>

<div
    style={{
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    }}
>







            <ResponsiveContainer
                width="60%"
                height={300}
            >

                <PieChart>

                    <Pie
                        data={estados}
    cx="50%"
    cy="50%"
    dataKey="cantidad"
    nameKey="descripcion"
    outerRadius={120}    
    label={({ name, percent }) =>
        `${name} ${(percent * 100).toFixed(0)}%`
    }
                    >

                        <Cell fill="#16A34A" />
                        <Cell fill="#DC2626" />

                    </Pie>

                    <Tooltip />

                </PieChart>

            </ResponsiveContainer>

</div>
</div>

    )
}

<div
    className="card"
    style={{
        marginTop:'30px'
    }}
>

    <h2>
        Próximos a Vencer
    </h2>

    {
        proximos.length === 0
        ?
        (
            <p>
                No existen documentos próximos a vencer.
            </p>
        )
        :
        (
            <table
                style={{
                    width:'100%'
                }}
            >
                <thead>
                    <tr>
                        <th>Proveedor</th>
                        <th>Documento</th>
                        <th>Fecha Vencimiento</th>
                    </tr>
                </thead>

                <tbody>

                {
                    proximos.map(
                        (item,index) => (
                            <tr key={index}>
                                <td>
                                    {item.proveedor}
                                </td>

                                <td>
                                    {item.documento}
                                </td>

                                <td>
                                    {item.fecha_vigencia}
                                </td>
                            </tr>
                        )
                    )
                }

                </tbody>

            </table>
        )
    }

</div>
        </MainLayout>

    );

}