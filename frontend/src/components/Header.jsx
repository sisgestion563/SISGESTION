import { useState, useEffect } from 'react';
import { Layers, CalendarDays, Calendar, User, ChevronDown, RotateCcw } from 'lucide-react';
import { obtenerCatalogo } from '../services/catalogos.service';
import { obtenerProveedorPorId } from '../services/providers.service';

/**
 * Formatea los textos de gestión provenientes de base de datos a formato título institucional
 */
const formatearNombreGestion = (texto) => {
    if (!texto) return '';
    const mapaNombres = {
        'GESTIÓN SST': 'Gestión SST',
        'GESTION SST': 'Gestión SST',
        'GESTIÓN MA': 'Gestión MA',
        'GESTION MA': 'Gestión MA',
        'GESTIÓN DE CALIDAD': 'Gestión de Calidad',
        'GESTION DE CALIDAD': 'Gestión de Calidad',
        'GESTIÓN PATRIMONIAL': 'Gestión Patrimonial',
        'GESTION PATRIMONIAL': 'Gestión Patrimonial',
        'GESTIÓN SEG. PATRIMONIAL': 'Gestión Seg. Patrimonial',
        'GESTIÓN ÉTICA': 'Gestión Ética',
        'GESTION ETICA': 'Gestión Ética',
        'GESTIÓN ETICA': 'Gestión Ética'
    };
    const upper = texto.trim().toUpperCase();
    if (mapaNombres[upper]) return mapaNombres[upper];

    return texto.split(' ').map(w => {
        if (['de', 'y', 'o', 'del', 'la', 'en'].includes(w.toLowerCase())) return w.toLowerCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
};

export default function Header() {
    // 1. Obtener usuario autenticado de localStorage
    const usuario = (() => {
        try {
            const raw = localStorage.getItem('usuario');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    // 2. Fecha actual formateada
    const fecha = new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // 3. Estado de número de documento (RUC o DNI del usuario/proveedor)
    const [documentoPerfil, setDocumentoPerfil] = useState(usuario?.username || '');

    // 4. Estados para catálogo de gestiones y gestión seleccionada
    const [gestiones, setGestiones] = useState([
        { codigo_valor: 'GSG', descripcion: 'Gestión SST' },
        { codigo_valor: 'GMA', descripcion: 'Gestión MA' },
        { codigo_valor: 'GCA', descripcion: 'Gestión de Calidad' },
        { codigo_valor: 'GPA', descripcion: 'Gestión Patrimonial' },
        { codigo_valor: 'GTR', descripcion: 'Gestión Ética' }
    ]);
    const [gestionSeleccionada, setGestionSeleccionada] = useState(() => {
        return localStorage.getItem('sisgestion_gestion_actual') || 'ALL';
    });

    // 5. Estado para Periodo (fijo en 2026)
    const [periodo, setPeriodo] = useState('2026');

    // Sincronizar selección si se limpia desde el Dashboard
    useEffect(() => {
        const handleSync = (e) => {
            if (e.detail) {
                setGestionSeleccionada(e.detail);
            }
        };
        window.addEventListener('sisgestion:gestion_change', handleSync);
        return () => window.removeEventListener('sisgestion:gestion_change', handleSync);
    }, []);

    // Cargar información del proveedor para obtener el RUC real si existe proveedor_id
    useEffect(() => {
        let isMounted = true;
        const cargarDatosProveedor = async () => {
            if (usuario?.proveedor_id) {
                try {
                    const dataProveedor = await obtenerProveedorPorId(usuario.proveedor_id);
                    if (isMounted && dataProveedor?.nro_documento) {
                        setDocumentoPerfil(dataProveedor.nro_documento);
                    }
                } catch (error) {
                    console.error('Error al cargar datos del proveedor para el perfil:', error);
                }
            }
        };
        cargarDatosProveedor();
        return () => { isMounted = false; };
    }, [usuario?.proveedor_id]);

    // Cargar catálogo de gestiones desde la base de datos (cod_grupo: 0099, tipo_grupo: TIPO_GESTION)
    useEffect(() => {
        let isMounted = true;
        const cargarCatalogoGestiones = async () => {
            try {
                const data = await obtenerCatalogo('0099', 'TIPO_GESTION');
                if (isMounted && Array.isArray(data) && data.length > 0) {
                    const gestionesFormateadas = data.map(item => ({
                        codigo_valor: item.codigo_valor,
                        descripcion: formatearNombreGestion(item.descripcion)
                    }));
                    setGestiones(gestionesFormateadas);
                }
            } catch (error) {
                console.error('Error al cargar catálogo de gestiones desde backend:', error);
            }
        };
        cargarCatalogoGestiones();
        return () => { isMounted = false; };
    }, []);

    const cambiarGestion = (valor) => {
        setGestionSeleccionada(valor);
        localStorage.setItem('sisgestion_gestion_actual', valor);
        window.dispatchEvent(new CustomEvent('sisgestion:gestion_change', { detail: valor }));
    };

    const handleGestionChange = (e) => {
        cambiarGestion(e.target.value);
    };

    const limpiarFiltro = () => {
        cambiarGestion('ALL');
    };

    return (
        <header
            style={{
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                padding: '16px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)'
            }}
        >
            {/* ── Nivel 1 y Nivel 2: Título y Subtítulo + Fecha Institucional ── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '22px',
                            fontWeight: '800',
                            color: '#0F172A',
                            letterSpacing: '-0.03em',
                            lineHeight: '1.2'
                        }}
                    >
                        SISGESTION
                    </h1>
                    <p
                        style={{
                            margin: '3px 0 0 0',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#64748B',
                            lineHeight: '1.4'
                        }}
                    >
                        Sistema de Gestión Documental y Homologación de Proveedores
                    </p>
                </div>

                {/* Fecha institucional moderna sin emojis */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#334155',
                        backgroundColor: '#F8FAFC',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontWeight: '600',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                >
                    <Calendar size={15} color="#2563EB" />
                    <span>{fecha}</span>
                </div>
            </div>

            {/* ── Separador sutil ─────────────────────────────────────────── */}
            <div
                style={{
                    height: '1px',
                    backgroundColor: '#F1F5F9',
                    width: '100%'
                }}
            />

            {/* ── Nivel 3: Barra de Contexto (Gestión, Periodo y Mi Perfil) ── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}
            >
                {/* Lado izquierdo: Selectores modernos de Gestión y Periodo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '14px'
                    }}
                >
                    {/* Selector de Gestión */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#1E293B'
                            }}
                        >
                            Gestión:
                        </span>
                        <div
                            style={{
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                borderRadius: '8px',
                                padding: '0 10px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Layers size={15} color="#2563EB" style={{ marginRight: '6px', flexShrink: 0 }} />
                            <select
                                id="header-select-gestion"
                                aria-label="Seleccionar Gestión"
                                value={gestionSeleccionada}
                                onChange={handleGestionChange}
                                style={{
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: '7px 24px 7px 0',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#0F172A',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            >
                                <option value="ALL">Todas las Gestiones</option>
                                {gestiones.map((item) => (
                                    <option key={item.codigo_valor} value={item.codigo_valor}>
                                        {item.descripcion}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={14}
                                color="#64748B"
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    pointerEvents: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Botón para eliminar filtro si está activo */}
                    {gestionSeleccionada !== 'ALL' && (
                        <button
                            onClick={limpiarFiltro}
                            title="Eliminar filtro y ver toda la información"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                color: '#1D4ED8',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#DBEAFE'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#EFF6FF'}
                        >
                            <RotateCcw size={13} />
                            <span>Ver todo</span>
                        </button>
                    )}

                    {/* Selector de Periodo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#1E293B'
                            }}
                        >
                            Periodo:
                        </span>
                        <div
                            style={{
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                borderRadius: '8px',
                                padding: '0 10px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <CalendarDays size={15} color="#2563EB" style={{ marginRight: '6px', flexShrink: 0 }} />
                            <select
                                id="header-select-periodo"
                                aria-label="Seleccionar Periodo"
                                value={periodo}
                                onChange={(e) => setPeriodo(e.target.value)}
                                style={{
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: '7px 22px 7px 0',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#0F172A',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            >
                                <option value="2026">2026</option>
                            </select>
                            <ChevronDown
                                size={14}
                                color="#64748B"
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    pointerEvents: 'none'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Lado derecho: Separador vertical + Tarjeta de MI PERFIL */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}
                >
                    <div
                        style={{
                            width: '1px',
                            height: '32px',
                            backgroundColor: '#E2E8F0'
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            padding: '6px 14px',
                            borderRadius: '10px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}
                    >
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: '#EFF6FF',
                                border: '1px solid #DBEAFE',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <User size={16} color="#2563EB" />
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                textAlign: 'left'
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: '#64748B',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    lineHeight: '1.1'
                                }}
                            >
                                MI PERFIL
                            </span>
                            <span
                                style={{
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: '#0F172A',
                                    letterSpacing: '0.02em',
                                    lineHeight: '1.3'
                                }}
                            >
                                {documentoPerfil || '20123456789'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
