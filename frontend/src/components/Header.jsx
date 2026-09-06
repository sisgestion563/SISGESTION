import { useState, useEffect } from 'react';
import { Layers, CalendarDays, Calendar, User, ChevronDown, RotateCcw, Briefcase } from 'lucide-react';
/*import { obtenerCatalogo, obtenerPeriodos } from '../services/catalogos.service';
import { obtenerProveedorPorId } from '../services/providers.service';*/
/*EROMAN 03/09/2026*/
import { obtenerCatalogo, obtenerPeriodos } from '../services/catalogos.service';
import { obtenerProveedorPorId, obtenerProveedores} from '../services/providers.service';


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
        'GESTIÓN ÉTICA': 'Código Ética',
        'GESTION ETICA': 'Código Ética',
        'GESTIÓN ETICA': 'Código Ética'
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

    const rolCodigo = (usuario?.rol_codigo || usuario?.rol || usuario?.role || '').toUpperCase();
    const rolId = Number(usuario?.rol_id);
    const esConsultor = rolCodigo === 'CONSULTOR' || rolId === 3 || usuario?.tipo_usuario === 'CONSULTOR' || (usuario?.rol_nombre || '').toUpperCase().includes('CONSULT');

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
        { codigo_valor: 'GSG,GMA', descripcion: 'Gestión SST-MA' },
        { codigo_valor: 'GCA', descripcion: 'Gestión de Calidad' },
        { codigo_valor: 'GPA', descripcion: 'Gestión Seg. Patrimonial' },
        { codigo_valor: 'GTR', descripcion: 'Código Ética' }
    ]);
    const [gestionSeleccionada, setGestionSeleccionada] = useState(() => {
        try {
            const raw = localStorage.getItem('sisgestion_gestion_actual');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch { }
        return ['ALL'];
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // 5. Estado para Periodo
    const [periodo, setPeriodo] = useState(() => {
        return localStorage.getItem('sisgestion_periodo_actual') || '2026';
    });
    const [periodosList, setPeriodosList] = useState([]);

    // 6. Estado para Rubro (CIIU) - Solo Consultor
    const [rubro, setRubro] = useState(() => {
        return localStorage.getItem('sisgestion_rubro_actual') || 'ALL';
    });
    const [rubrosList, setRubrosList] = useState([]);

    // 7. Estado para Proveedor - Solo Consultor EROMAN 03/09/2026
    const [proveedorFiltro, setProveedorFiltro] = useState(() => {
        return localStorage.getItem('sisgestion_proveedor_actual') || 'ALL';
    });

const [proveedoresList, setProveedoresList] = useState([]);

    
    const mostrarFiltros = window.location.pathname.startsWith('/dashboard');
    const mostrarFiltroPeriodo = mostrarFiltros;

    // Cargar periodos desde base de datos
    useEffect(() => {
        let isMounted = true;
        const cargarPeriodos = async () => {
            try {
                const list = await obtenerPeriodos();
                if (isMounted && Array.isArray(list) && list.length > 0) {
                    setPeriodosList(list);
                    const saved = localStorage.getItem('sisgestion_periodo_actual');
                    const exists = list.some(p => p.periodo === saved);
                    if (!exists) {
                        const defaultPeriod = list[0].periodo;
                        setPeriodo(defaultPeriod);
                        localStorage.setItem('sisgestion_periodo_actual', defaultPeriod);
                    }
                }
            } catch (error) {
                console.error('Error al cargar periodos:', error);
            }
        };
        if (mostrarFiltroPeriodo) {
            cargarPeriodos();
        }
        return () => { isMounted = false; };
    }, [mostrarFiltroPeriodo]);




    // Cargar catálogo de rubros (CIIU) para consultor
    useEffect(() => {
        let isMounted = true;
        const cargarRubros = async () => {
            try {
                const list = await obtenerCatalogo('0002', 'CODIGO_CIIU_SUNAT');
                if (isMounted && Array.isArray(list) && list.length > 0) {
                    setRubrosList(list);
                }
            } catch (error) {
                console.error('Error al cargar rubros:', error);
            }
        };
        if (esConsultor && mostrarFiltros) {
            cargarRubros();
        }
        return () => { isMounted = false; };
    }, [esConsultor, mostrarFiltros]);

    const getProvCiiu = (p) => {
        if (!p) return '';
        if (p.ciiu) return String(p.ciiu).trim();
        if (p.actividad_economica) {
            return String(p.actividad_economica).split('-')[0].trim();
        }
        return '';
    };

    const cambiarPeriodo = (nuevoPeriodo) => {
        setPeriodo(nuevoPeriodo);
        localStorage.setItem('sisgestion_periodo_actual', nuevoPeriodo);
        window.dispatchEvent(new CustomEvent('sisgestion:periodo_change', { detail: nuevoPeriodo }));
    };

    const cambiarRubro = (nuevoRubro) => {
        setRubro(nuevoRubro);
        localStorage.setItem('sisgestion_rubro_actual', nuevoRubro);
        window.dispatchEvent(
            new CustomEvent('sisgestion:rubro_change', {
                detail: nuevoRubro
            })
        );

        if (nuevoRubro !== 'ALL' && proveedorFiltro !== 'ALL') {
            const selectedProv = proveedoresList.find(p => String(p.proveedor_id) === String(proveedorFiltro));
            if (getProvCiiu(selectedProv) !== String(nuevoRubro)) {
                setProveedorFiltro('ALL');
                localStorage.setItem('sisgestion_proveedor_actual', 'ALL');
                window.dispatchEvent(
                    new CustomEvent('sisgestion:proveedor_change', {
                        detail: 'ALL'
                    })
                );
            }
        }
    };

    const cambiarProveedor = (nuevoProveedor) => {
        setProveedorFiltro(nuevoProveedor);
        localStorage.setItem('sisgestion_proveedor_actual', nuevoProveedor);
        window.dispatchEvent(
            new CustomEvent('sisgestion:proveedor_change', {
                detail: nuevoProveedor
            })
        );

        if (nuevoProveedor === 'ALL') {
            // Quitar los otros filtros aplicados al seleccionar 'Todos los proveedores'
            setRubro('ALL');
            localStorage.setItem('sisgestion_rubro_actual', 'ALL');
            window.dispatchEvent(
                new CustomEvent('sisgestion:rubro_change', {
                    detail: 'ALL'
                })
            );

            cambiarGestion(['ALL']);
        } else {
            const selectedProv = proveedoresList.find(p => String(p.proveedor_id) === String(nuevoProveedor));
            const provCiiu = getProvCiiu(selectedProv);
            if (provCiiu && provCiiu !== rubro) {
                setRubro(provCiiu);
                localStorage.setItem('sisgestion_rubro_actual', provCiiu);
                window.dispatchEvent(
                    new CustomEvent('sisgestion:rubro_change', {
                        detail: provCiiu
                    })
                );
            }
        }
    };

    const proveedoresFiltrados =
        rubro === 'ALL'
            ? proveedoresList
            : proveedoresList.filter(item => getProvCiiu(item) === String(rubro));

    const rubrosFiltrados = (() => {
        if (proveedorFiltro === 'ALL') {
            return rubrosList;
        }
        const selectedProv = proveedoresList.find(p => String(p.proveedor_id) === String(proveedorFiltro));
        const provCiiu = getProvCiiu(selectedProv);
        if (!provCiiu) return rubrosList;
        const filtrados = rubrosList.filter(item => {
            const code = String(item.codigo_valor || item.ciiu || item.code || '').trim();
            return code === provCiiu;
        });
        if (filtrados.length > 0) return filtrados;
        return [{
            codigo_valor: provCiiu,
            descripcion: selectedProv?.actividad_economica || `CIIU ${provCiiu}`
        }];
    })();

    // Cargar proveedores para el filtro del Consultor
    useEffect(() => {
        let isMounted = true;

        const cargarProveedores = async () => {
            try {
                const list = await obtenerProveedores();

                if (isMounted && Array.isArray(list)) {
                    setProveedoresList(list);
                }
            } catch (error) {
                console.error('Error al cargar proveedores:', error);
            }
        };

        if (esConsultor && mostrarFiltros) {
            cargarProveedores();
        }

        return () => {
            isMounted = false;
        };
    }, [esConsultor, mostrarFiltros]);

    // Sincronizar rubro si se cambia externamente
    useEffect(() => {
        const handleRubroSync = (e) => {
            if (e.detail !== undefined) {
                setRubro(e.detail);
            }
        };
        window.addEventListener('sisgestion:rubro_change', handleRubroSync);
        return () => window.removeEventListener('sisgestion:rubro_change', handleRubroSync);
    }, []);

    // Sincronizar proveedor si se cambia externamente
    useEffect(() => {
        const handleProveedorSync = (e) => {
            if (e.detail !== undefined) {
                setProveedorFiltro(e.detail);
            }
        };
        window.addEventListener('sisgestion:proveedor_change', handleProveedorSync);
        return () => window.removeEventListener('sisgestion:proveedor_change', handleProveedorSync);
    }, []);

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
                    const gestionesBase = data
                        .filter(item => item.codigo_valor !== 'GSG' && item.codigo_valor !== 'GMA')
                        .map(item => ({
                            codigo_valor: item.codigo_valor,
                            descripcion: formatearNombreGestion(item.descripcion)
                        }));
                    
                    const hasSST = data.some(item => item.codigo_valor === 'GSG');
                    const hasMA = data.some(item => item.codigo_valor === 'GMA');
                    if (hasSST || hasMA) {
                        gestionesBase.unshift({ codigo_valor: 'GSG,GMA', descripcion: 'Gestión SST-MA' });
                    }
                    
                    setGestiones(gestionesBase);
                }
            } catch (error) {
                console.error('Error al cargar catálogo de gestiones desde backend:', error);
            }
        };
        cargarCatalogoGestiones();
        return () => { isMounted = false; };
    }, []);

    const cambiarGestion = (nuevosValores) => {
        setGestionSeleccionada(nuevosValores);
        localStorage.setItem('sisgestion_gestion_actual', JSON.stringify(nuevosValores));
        window.dispatchEvent(new CustomEvent('sisgestion:gestion_change', { detail: nuevosValores }));
    };

    const toggleGestion = (valor) => {
        if (valor === 'ALL') {
            cambiarGestion(['ALL']);
            setDropdownOpen(false);
            return;
        }

        let seleccionActual = gestionSeleccionada.includes('ALL') ? [] : [...gestionSeleccionada];

        if (seleccionActual.includes(valor)) {
            seleccionActual = seleccionActual.filter(v => v !== valor);
        } else {
            seleccionActual.push(valor);
        }

        if (seleccionActual.length === 0) {
            seleccionActual = ['ALL'];
        }

        cambiarGestion(seleccionActual);
    };

    const limpiarFiltro = () => {
        cambiarGestion(['ALL']);
        if (rubro !== 'ALL') {
            setRubro('ALL');
            localStorage.setItem('sisgestion_rubro_actual', 'ALL');
            window.dispatchEvent(new CustomEvent('sisgestion:rubro_change', { detail: 'ALL' }));
        }
        if (proveedorFiltro !== 'ALL') {
            setProveedorFiltro('ALL');
            localStorage.setItem('sisgestion_proveedor_actual', 'ALL');
            window.dispatchEvent(new CustomEvent('sisgestion:proveedor_change', { detail: 'ALL' }));
        }
    };
    
    // Cerrar dropdown si se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.gestion-dropdown-container')) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [dropdownOpen]);

    const rolEtiqueta = (() => {
        if (rolCodigo === 'ADMIN') return 'ADMIN';
        if (rolCodigo === 'CONSULTOR') return 'CONSULTOR';
        if (rolCodigo === 'PROVEEDOR') return 'PROVEEDOR';
        return usuario?.rol_nombre || usuario?.rol_codigo || 'USUARIO';
    })();

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
            {/* ── Nivel 1 y Nivel 2: Título a la izquierda + Mi Perfil y Fecha a la derecha ── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
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
                        ProvGestion
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
                        Inteligencia y Gestión de Proveedores
                    </p>
                </div>

                {/* Contenedor Superior Derecho: Mi Perfil ARRIBA de la Fecha */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '5px'
                    }}
                >
                    {/* Tarjeta de MI PERFIL */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            padding: '4px 12px 4px 6px',
                            borderRadius: '999px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                    >
                        <div
                            style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                            }}
                        >
                            <User size={15} strokeWidth={2.4} />
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    lineHeight: '1.15'
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '9.5px',
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
                                        fontSize: '13px',
                                        fontWeight: '750',
                                        color: '#0F172A',
                                        letterSpacing: '-0.01em'
                                    }}
                                >
                                    {usuario?.username || 'Usuario'}
                                </span>
                            </div>

                            <span
                                style={{
                                    fontSize: '10.5px',
                                    fontWeight: '800',
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: rolCodigo === 'ADMIN' ? '#EFF6FF' : rolCodigo === 'CONSULTOR' ? '#F5F3FF' : '#ECFDF5',
                                    color: rolCodigo === 'ADMIN' ? '#1D4ED8' : rolCodigo === 'CONSULTOR' ? '#6D28D9' : '#047857',
                                    border: `1px solid ${rolCodigo === 'ADMIN' ? '#BFDBFE' : rolCodigo === 'CONSULTOR' ? '#DDD6FE' : '#A7F3D0'}`,
                                    letterSpacing: '0.03em'
                                }}
                            >
                                {rolEtiqueta}
                            </span>
                        </div>
                    </div>

                    {/* Fecha institucional (debajo de Mi Perfil) */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            color: '#64748B',
                            fontWeight: '600',
                            paddingRight: '6px'
                        }}
                    >
                        <Calendar size={13} color="#2563EB" strokeWidth={2.2} />
                        <span>{fecha}</span>
                    </div>
                </div>
            </div>

            {/* ── Separador sutil y Barra de Contexto (Gestión y Periodo) sólo si mostrarFiltros es true ── */}
            {mostrarFiltros && (
                <>
                    <div
                        style={{
                            height: '1px',
                            backgroundColor: '#F1F5F9',
                            width: '100%'
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '16px'
                        }}
                    >

                     {/* Selector de Proveedor - Solo Consultor EROMAN 03/09/2026*/}
{esConsultor && (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    }}>
        <span
            style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#1E293B'
            }}
        >
            Proveedor:
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
                transition: 'all 0.2s ease',
                maxWidth: '300px'
            }}
        >
            <User
                size={15}
                color="#2563EB"
                style={{
                    marginRight: '6px',
                    flexShrink: 0
                }}
            />

            <select
                id="header-select-proveedor"
                aria-label="Seleccionar Proveedor"
                value={proveedorFiltro}
                onChange={(e) =>
                    cambiarProveedor(e.target.value)
                }
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
                    outline: 'none',
                    maxWidth: '240px',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                }}
            >
                <option value="ALL">
                    Todos los Proveedores
                </option>

                {proveedoresFiltrados.map((item) => (
                    <option
                        key={item.proveedor_id}
                        value={item.proveedor_id}
                        title={item.proveedor}
                    >
                        {item.proveedor}
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
)}    



                            {/* Selector de Rubro (CIIU) - Solo Consultor */}
                            {esConsultor && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            color: '#1E293B'
                                        }}
                                    >
                                        Rubro:
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
                                            transition: 'all 0.2s ease',
                                            maxWidth: '300px'
                                        }}
                                    >
                                        <Briefcase size={15} color="#2563EB" style={{ marginRight: '6px', flexShrink: 0 }} />
                                        <select
                                            id="header-select-rubro"
                                            aria-label="Seleccionar Rubro CIIU"
                                            value={rubro}
                                            onChange={(e) => cambiarRubro(e.target.value)}
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
                                                outline: 'none',
                                                maxWidth: '240px',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <option value="ALL">Todos los Rubros (CIIU)</option>
                                            {rubrosFiltrados.map((item, idx) => {
                                                const code = item.codigo_valor || item.ciiu || item.code;
                                                const label = item.descripcion || item.nombre || item.label;
                                                return (
                                                    <option key={idx} value={code} title={`${code} - ${label}`}>
                                                        {code} - {label}
                                                    </option>
                                                );
                                            })}
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
                            )}    


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
                                    className="gestion-dropdown-container"
                                    style={{
                                        position: 'relative',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        background: '#FFFFFF',
                                        border: '1px solid #CBD5E1',
                                        borderRadius: '8px',
                                        padding: '6px 10px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        minWidth: '180px',
                                        userSelect: 'none'
                                    }}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <Layers size={15} color="#2563EB" style={{ marginRight: '8px', flexShrink: 0 }} />
                                    <div style={{ flex: 1, fontSize: '13px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {gestionSeleccionada.includes('ALL') 
                                            ? 'Todas las Gestiones' 
                                            : gestionSeleccionada.length === 1 
                                                ? gestiones.find(g => g.codigo_valor === gestionSeleccionada[0])?.descripcion || '1 Selección' 
                                                : `${gestionSeleccionada.length} Seleccionadas`}
                                    </div>
                                    <ChevronDown
                                        size={14}
                                        color="#64748B"
                                        style={{ marginLeft: '8px', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                                    />
                                    
                                    {dropdownOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            marginTop: '4px',
                                            width: '240px',
                                            background: '#FFFFFF',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            zIndex: 50,
                                            padding: '8px 0',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <div 
                                                style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', cursor: 'pointer', background: gestionSeleccionada.includes('ALL') ? '#EFF6FF' : 'transparent' }}
                                                onClick={(e) => { e.stopPropagation(); toggleGestion('ALL'); }}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    checked={gestionSeleccionada.includes('ALL')}
                                                    readOnly
                                                    style={{ marginRight: '10px', width: '14px', height: '14px', cursor: 'pointer' }}
                                                />
                                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#1E293B' }}>Todas las Gestiones</span>
                                            </div>
                                            <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }}></div>
                                            {gestiones.map((item) => (
                                                <div 
                                                    key={item.codigo_valor}
                                                    style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', cursor: 'pointer', background: gestionSeleccionada.includes(item.codigo_valor) ? '#EFF6FF' : 'transparent' }}
                                                    onClick={(e) => { e.stopPropagation(); toggleGestion(item.codigo_valor); }}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={gestionSeleccionada.includes(item.codigo_valor)}
                                                        readOnly
                                                        style={{ marginRight: '10px', width: '14px', height: '14px', cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#1E293B' }}>{item.descripcion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Botón para eliminar filtro si está activo */}
                            {(!gestionSeleccionada.includes('ALL') || (esConsultor && (rubro !== 'ALL' || proveedorFiltro !== 'ALL'))) && (
                                <button
                                    onClick={limpiarFiltro}
                                    title="Eliminar filtros y ver toda la información"
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
                                        onChange={(e) => cambiarPeriodo(e.target.value)}
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
                                        {periodosList.length > 0 ? (
                                            periodosList.map(p => (
                                                <option key={p.periodo} value={p.periodo}>
                                                    {p.periodo}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="2026">2026</option>
                                        )}
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
                    </div>
                </>
            )}
        </header>
    );
}

