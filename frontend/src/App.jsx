import {
    BrowserRouter,
    Routes,
    Route
}
from 'react-router-dom';

import LoginPage
from './pages/LoginPage';

import DashboardPage
from './pages/DashboardPage';


import DocumentsPage from './pages/DocumentsPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import ProcessesPage from './pages/ProcessesPage';
import ProvidersPage from './pages/ProvidersPage';


function App() {

    return (


        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<LoginPage />}
                />

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

            </Routes>

        </BrowserRouter>

    );

}

export default App;