import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// 1. TUS PÁGINAS ACTUALES (Entran directo, ya que ellas mismas renderizan su propio Sidebar)
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProvidersPage from './pages/ProvidersPage';
import DocumentsPage from './pages/DocumentsPage';
import ProcessesPage from './pages/ProcessesPage';
import ReportsPage from './pages/ReportsPage';
import AlertsPage from './pages/AlertsPage';

// 2. TU NUEVO MÓDULO DE USUARIOS
import UsersPage from './modules/usuarios/pages/UsersPage';
import UserDetailPage from './modules/usuarios/pages/UserDetailPage';

// Layout envolvente para páginas de usuarios
function AdminLayout({ children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar />
            <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
                {children}
            </div>
        </div>
    );
}

// Ruta pública (Login): si ya está autenticado en cualquier pestaña, redirige directo al dashboard
function PublicRoute({ children }) {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    if (token && usuario) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

// Ruta protegida: si no está autenticado, redirige al login
function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    if (!token || !usuario) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta de Login (redirecciona a /dashboard si ya hay sesión iniciada) */}
                <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />

                {/* Rutas principales protegidas */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/providers" element={<ProtectedRoute><ProvidersPage /></ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
                <Route path="/processes" element={<ProtectedRoute><ProcessesPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />

                {/* Módulo de usuarios protegido */}
                <Route path="/usuarios" element={<ProtectedRoute><AdminLayout><UsersPage /></AdminLayout></ProtectedRoute>} />
                <Route path="/usuarios/:id" element={<ProtectedRoute><AdminLayout><UserDetailPage /></AdminLayout></ProtectedRoute>} />

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;