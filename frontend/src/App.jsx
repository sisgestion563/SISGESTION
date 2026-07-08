import {
    BrowserRouter,
    Routes,
    Route
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';

import MainLayout from './layouts/MainLayout';

import DashboardPage from './pages/DashboardPage';
import ProvidersPage from './pages/ProvidersPage';
import DocumentsPage from './pages/DocumentsPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import ProcessesPage from './pages/ProcessesPage';

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Login */}

                <Route
                    path="/"
                    element={<LoginPage />}
                />

                {/* Layout Principal */}

                <Route
                    element={<MainLayout />}
                >

                    <Route
                        path="/dashboard"
                        element={<DashboardPage />}
                    />

                    <Route
                        path="/providers"
                        element={<ProvidersPage />}
                    />

                    <Route
                        path="/documents"
                        element={<DocumentsPage />}
                    />

                    <Route
                        path="/alerts"
                        element={<AlertsPage />}
                    />

                    <Route
                        path="/reports"
                        element={<ReportsPage />}
                    />

                    <Route
                        path="/processes"
                        element={<ProcessesPage />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    );

}

export default App;