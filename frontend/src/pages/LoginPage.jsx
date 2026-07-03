import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {

    const { doLogin } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const loginSubmit = async (e) => {

        e.preventDefault();

        const ok = await doLogin(username, password);

        if (ok) {

            alert('Login correcto');
            navigate('/dashboard');

        } else {

            alert('Usuario o contraseña incorrectos');

        }

    };

    return (

        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f4f6f9',
                padding: '16px',
                boxSizing: 'border-box'
            }}
        >

            <div
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    background: '#fff',
                    padding: '32px 24px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    boxSizing: 'border-box'
                }}
            >

                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '30px'
                    }}
                >

                    <h1
                        style={{
                            margin: 0,
                            color: '#1976d2'
                        }}
                    >
                        SISGESTION
                    </h1>

                </div>

                <form onSubmit={loginSubmit}>

                    <label className="form-label"style={{ fontWeight: 'bold' }}>
                        Usuario
                    </label>

                    <input
                        type="text"
                        value={username}
                        placeholder="Ingrese su usuario"
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            marginBottom: '20px',
                            boxSizing: 'border-box'
                        }}
                    />

                    <label className="form-label"style={{ fontWeight: 'bold' }}>
                        Contraseña
                    </label>

                    <input
                        type="password"
                        value={password}
                        placeholder="Ingrese su contraseña"
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            marginBottom: '30px',
                            boxSizing: 'border-box'
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '13px',
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Ingresar
                    </button>

                </form>

            </div>

        </div>

    );

}