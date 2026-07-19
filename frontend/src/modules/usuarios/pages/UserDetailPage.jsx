import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersService } from '../services/users.service';
import {
    ArrowLeft,
    User,
    Mail,
    Shield,
    Clock,
    Calendar,
    Lock,
    Unlock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
const rolConfig = {
    ADMIN: { label: 'Administrador', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    PROVEEDOR: { label: 'Proveedor', bg: '#e0f2fe', color: '#075985', dot: '#0ea5e9' },
    CONSULTOR: { label: 'Consultor', bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
};

const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-PE', {
        dateStyle: 'long',
        timeStyle: 'short',
    });
};

// ─── Sub-components ─────────────────────────────────────────────────────────
function InfoCard({ icon: Icon, label, value, accent }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '18px 20px',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9',
        }}>
            <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '9px',
                background: accent || '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <Icon size={18} color={accent ? '#fff' : '#2563EB'} />
            </div>
            <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '15px', color: '#1e293b', fontWeight: '600', wordBreak: 'break-word' }}>
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

function SkeletonCard() {
    const pulse = {
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.4s ease infinite',
        borderRadius: '8px',
    };
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
        }}>
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{ padding: '18px 20px', background: 'white', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ ...pulse, height: '10px', width: '60%', marginBottom: '10px' }} />
                    <div style={{ ...pulse, height: '16px', width: '80%' }} />
                </div>
            ))}
            <style>{`@keyframes skeleton-pulse { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const data = await usersService.getById(id);
                setUser(data);
            } catch (err) {
                console.error('Error al obtener usuario:', err);
                setError('No se pudo cargar la información del usuario.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const rol = rolConfig[user?.rol_codigo] ?? { label: user?.rol_nombre || '—', bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
    const locked = user?.primer_ingreso !== 'H';

    return (
        <div style={{
            padding: '32px',
            background: '#F8FAFC',
            minHeight: '100vh',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}>
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <button
                    onClick={() => navigate('/usuarios')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#475569',
                        transition: 'box-shadow .2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                    <ArrowLeft size={16} />
                    Volver
                </button>
                <div>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                        Detalle de Usuario
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                        Vista de solo lectura — ID #{id}
                    </p>
                </div>
            </div>

            {/* ── Error State ── */}
            {error && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    color: '#be123c',
                    fontSize: '14px',
                    fontWeight: '600',
                }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* ── Loading State ── */}
            {loading && !error && <SkeletonCard />}

            {/* ── Content ── */}
            {!loading && !error && user && (
                <>
                    {/* Avatar + Name Banner */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)',
                        borderRadius: '14px',
                        padding: '28px 30px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 4px 20px rgba(15,23,42,0.2)',
                    }}>
                        {/* Avatar circle */}
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '26px',
                            fontWeight: '800',
                            color: 'white',
                            flexShrink: 0,
                            boxShadow: '0 0 0 3px rgba(255,255,255,0.15)',
                        }}>
                            {user.username?.charAt(0).toUpperCase()}
                        </div>

                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'white' }}>
                                {user.username}
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                                {user.correo || 'Sin correo registrado'}
                            </p>
                        </div>

                        {/* Rol badge */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            background: rol.bg,
                            color: rol.color,
                            padding: '7px 14px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '700',
                        }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: rol.dot, display: 'inline-block' }} />
                            {rol.label}
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                        <InfoCard icon={User} label="Nombre de usuario" value={user.username} />
                        <InfoCard icon={Mail} label="Correo electrónico" value={user.correo || 'No registrado'} />
                        <InfoCard icon={Shield} label="Rol asignado" value={rol.label} />
                        <InfoCard icon={CheckCircle} label="ID de usuario" value={`#${user.usuario_id}`} />
                        <InfoCard icon={Calendar} label="Fecha de creación" value={fmtDate(user.create_date)} />
                        <InfoCard icon={Clock} label="Último acceso" value={fmtDate(user.ultimo_acceso)} />
                    </div>

                    {/* Permiso de Edición (solo relevante para PROVEEDOR) */}
                    {user.rol_codigo === 'PROVEEDOR' && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            background: 'white',
                            border: `1px solid ${locked ? '#fecdd3' : '#bbf7d0'}`,
                            borderRadius: '10px',
                            padding: '18px 22px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                background: locked ? '#fee2e2' : '#dcfce7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {locked
                                    ? <Lock size={20} color="#dc2626" />
                                    : <Unlock size={20} color="#16a34a" />
                                }
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Permiso de edición de ficha
                                </p>
                                <p style={{
                                    margin: '4px 0 0',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: locked ? '#dc2626' : '#16a34a',
                                }}>
                                    {locked ? 'BLOQUEADA — Solo lectura' : 'HABILITADA — Puede editar su ficha'}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}