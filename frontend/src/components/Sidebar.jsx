import {
    LayoutDashboard,
    Building2,
    FileText,
    Bell,
    BarChart3,
    Settings,
    LogOut,
    Users 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
    // 1. Recuperamos el objeto del usuario de forma segura
    let usuarioLogueado = null;
    try {
        const usuarioRaw = localStorage.getItem('usuario');
        usuarioLogueado = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    } catch (error) {
        console.error("Error parsing user from localStorage:", error);
    }
    
    // 2. Evaluamos los roles (Tu servicio de backend mapea r.codigo como 'rol_codigo')
    const esAdmin = usuarioLogueado?.rol_codigo === 'ADMIN';

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
        backgroundColor: isActive ? '#2563EB' : 'transparent'
    });

    return (
        <div 
            style={{ 
                width: '260px', 
                background: '#0F172A', 
                color: 'white', 
                minHeight: '100vh', 
                padding: '20px', 
                boxSizing: 'border-box',
                // Forzamos un contenedor Flex vertical para manejar el empuje
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <h1 style={{ marginBottom: '30px', fontSize: '24px', fontWeight: 'bold' }}>SISGESTION</h1>

            {/* ✔ Visible para todos (Admin, Proveedor, Consultor) */}
            <NavLink to="/dashboard" style={menuStyle}>
                <LayoutDashboard size={20}/>
                Dashboard
            </NavLink>

            {/* 🔒 RESTRICCIÓN: Solo si es ADMIN se renderiza la Gestión de Usuarios */}
            {esAdmin && (
                <NavLink to="/usuarios" style={menuStyle}>
                    <Users size={20}/>
                    Usuarios
                </NavLink>
            )}

            {/* ✔ Visible para todos */}
            <NavLink to="/providers" style={menuStyle}>
                <Building2 size={20}/>
                Proveedores
            </NavLink>

            {/* ✔ Visible para todos */}
            <NavLink to="/documents" style={menuStyle}>
                <FileText size={20}/>
                Documentos
            </NavLink>

            {/* ================================================================= */}
            {/* 🔒 RESTRICCIONES DE ROL: Módulos exclusivos para el Administrador */}
            {/* ================================================================= */}
            {esAdmin && (
                <>
                    <NavLink to="/alerts" style={menuStyle}>
                        <Bell size={20}/>
                        Alertas
                    </NavLink>

                    <NavLink to="/reports" style={menuStyle}>
                        <BarChart3 size={20}/>
                        Reportes
                    </NavLink>

                    <NavLink to="/processes" style={menuStyle}>
                        <Settings size={20}/>
                        Procesos
                    </NavLink>
                </>
            )}

            {/* ⬇️ Contenedor del Botón de salida empujado abajo del todo por 'marginTop: 'auto'' */}
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button 
                    style={{ 
                        width: '100%', 
                        backgroundColor: '#2563EB', 
                        color: 'white', 
                        border: 'none', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontWeight: '600',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px'
                    }} 
                    onClick={logout}
                >
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}