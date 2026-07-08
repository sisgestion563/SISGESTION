import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function MainLayout() {

    return (

        <div
            style={{
                display: 'flex',
                minHeight: '100vh'
            }}
        >

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >

                <Header />

                <main
                    style={{
                        flex: 1,
                        padding: '20px',
                        overflow: 'auto'
                    }}
                >

                    <Outlet />

                </main>

            </div>

        </div>

    );

}