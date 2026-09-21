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

// Este layout envolverá SOLAMENTE a las páginas de usuarios para inyectarles el Sidebar limpio
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

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Login suelto */}
                <Route path="/" element={<LoginPage />} />

                {/* Tus rutas antiguas planas (sin duplicar Sidebar) */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/providers" element={<ProvidersPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/processes" element={<ProcessesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />

                {/* Tus nuevas rutas de usuarios envueltas de manera controlada */}
                <Route path="/usuarios" element={<AdminLayout><UsersPage /></AdminLayout>} />
                <Route path="/usuarios/:id" element={<AdminLayout><UserDetailPage /></AdminLayout>} />

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;