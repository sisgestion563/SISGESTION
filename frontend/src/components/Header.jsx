import { useState, useEffect } from 'react';
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

    // 2. Fecha actual
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
        return localStorage.getItem('sisgestion_gestion_actual') || 'GSG';
    });

    // 5. Estado para Periodo (fijo en 2026 con estructura de selector)
    const [periodo, setPeriodo] = useState('2026');

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

                    setGestionSeleccionada(prev => {
                        const existe = gestionesFormateadas.some(g => g.codigo_valor === prev);
                        const valorFinal = existe ? prev : gestionesFormateadas[0].codigo_valor;
                        localStorage.setItem('sisgestion_gestion_actual', valorFinal);
                        return valorFinal;
                    });
                }
            } catch (error) {
                console.error('Error al cargar catálogo de gestiones desde backend:', error);
            }
        };
        cargarCatalogoGestiones();
        return () => { isMounted = false; };
    }, []);

    const handleGestionChange = (e) => {
        const nuevoValor = e.target.value;
        setGestionSeleccionada(nuevoValor);
        localStorage.setItem('sisgestion_gestion_actual', nuevoValor);
        window.dispatchEvent(new CustomEvent('sisgestion:gestion_change', { detail: nuevoValor }));
    };

    return (
        <header
            style={{
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
            }}
        >
            {/* ── Nivel 1 y Nivel 2: Título y Subtítulo ─────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '800',
                            color: '#0F172A',
                            letterSpacing: '-0.025em',
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

                {/* Fecha institucional */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#64748B',
                        backgroundColor: '#F8FAFC',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        fontWeight: '500'
                    }}
                >
                    <span role="img" aria-label="calendario">📅</span>
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
                {/* Lado izquierdo: Selectores de Gestión y Periodo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '20px'
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
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                            <select
                                id="header-select-gestion"
                                aria-label="Seleccionar Gestión"
                                value={gestionSeleccionada}
                                onChange={handleGestionChange}
                                style={{
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    backgroundColor: '#F8FAFC',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '6px',
                                    padding: '6px 32px 6px 12px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#0F172A',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                                }}
                                onFocus={(e) => (e.target.style.borderColor = '#2563EB')}
                                onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                            >
                                {gestiones.map((item) => (
                                    <option key={item.codigo_valor} value={item.codigo_valor}>
                                        {item.descripcion}
                                    </option>
                                ))}
                            </select>
                            <span
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    pointerEvents: 'none',
                                    fontSize: '10px',
                                    color: '#64748B'
                                }}
                            >
                                ▼
                            </span>
                        </div>
                    </div>

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
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                            <select
                                id="header-select-periodo"
                                aria-label="Seleccionar Periodo"
                                value={periodo}
                                onChange={(e) => setPeriodo(e.target.value)}
                                style={{
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    backgroundColor: '#F8FAFC',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '6px',
                                    padding: '6px 28px 6px 12px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#0F172A',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                                }}
                                onFocus={(e) => (e.target.style.borderColor = '#2563EB')}
                                onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                            >
                                <option value="2026">2026</option>
                            </select>
                            <span
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    pointerEvents: 'none',
                                    fontSize: '10px',
                                    color: '#64748B'
                                }}
                            >
                                ▼
                            </span>
                        </div>
                    </div>
                </div>

                {/* Lado derecho: Separador vertical + MI PERFIL y RUC/DNI */}
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
                            backgroundColor: '#CBD5E1'
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            textAlign: 'right'
                        }}
                    >
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                color: '#64748B',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            MI PERFIL
                        </span>
                        <span
                            style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#0F172A',
                                letterSpacing: '0.02em',
                                lineHeight: '1.2'
                            }}
                        >
                            {documentoPerfil || '20123456789'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}