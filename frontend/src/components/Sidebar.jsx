import {
    LayoutDashboard,
    Building2,
    FileText,
    Bell,
    BarChart3,
    Settings,
    LogOut
} from 'lucide-react';

import {
    NavLink
} from 'react-router-dom';

export default function Sidebar() {

    const logout = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        window.location.href = '/';

    };

    const menuStyle = ({ isActive }) => ({

        display: 'flex',
        alignItems: 'center',
        gap: '12px',

        padding: '12px',

        marginBottom: '8px',

        borderRadius: '8px',

        textDecoration: 'none',

        color: 'white',

        backgroundColor:
            isActive
                ? '#2563EB'
                : 'transparent'

    });

    return (

        <div
            style={{
                width: '260px',
                background: '#0F172A',
                color: 'white',
                minHeight: '100vh',
                padding: '20px'
            }}
        >

            <h1
                style={{
                    marginBottom: '30px'
                }}
            >
                SISGESTION
            </h1>

            <NavLink
                to="/dashboard"
                style={menuStyle}
            >
                <LayoutDashboard size={20}/>
                Dashboard
            </NavLink>

            <NavLink
                to="/providers"
                style={menuStyle}
            >
                <Building2 size={20}/>
                Proveedores
            </NavLink>

            <NavLink
                to="/documents"
                style={menuStyle}
            >
                <FileText size={20}/>
                Documentos
            </NavLink>

            <NavLink
                to="/alerts"
                style={menuStyle}
            >
                <Bell size={20}/>
                Alertas
            </NavLink>

            <NavLink
                to="/reports"
                style={menuStyle}
            >
                <BarChart3 size={20}/>
                Reportes
            </NavLink>

            <NavLink
                to="/processes"
                style={menuStyle}
            >
                <Settings size={20}/>
                Procesos
            </NavLink>

            <div
                style={{
                    marginTop: '40px'
                }}
            >

                <button
                    className="btn-primary"
                    style={{
                        width: '100%'
                    }}
                    onClick={logout}
                >

                    <LogOut
                        size={18}
                        style={{
                            marginRight: '8px'
                        }}
                    />

                    Cerrar Sesión

                </button>

            </div>

        </div>

    );

}