
import {
    useState
} from 'react';

import {
    useAuth
} from '../hooks/useAuth';

import { useNavigate }
from 'react-router-dom';

export default function LoginPage(){

    const {
        doLogin
    } = useAuth();

    const [
        username,
        setUsername
    ] = useState('');

    const [
        password,
        setPassword
    ] = useState('');
	
	const navigate = useNavigate();

    const loginSubmit =
    async (e) => {

        e.preventDefault();

        const ok =
            await doLogin(
                username,
                password
            );

        if(ok){

            alert(
                'Login correcto'
            );
			navigate('/dashboard');

        }
        else {

            alert(
                'Usuario o Password incorrecto'
            );

        }

    };

    return (

        <div
            style={{
                width:'400px',
                margin:'100px auto'
            }}
        >

            <h2>
                SISGESTION
            </h2>

            <form
                onSubmit={loginSubmit}
            >

                <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e)=>
                        setUsername(
                            e.target.value
                        )
                    }
                />

                <br/><br/>

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>
                        setPassword(
                            e.target.value
                        )
                    }
                />

                <br/><br/>

                <button
                    type="submit"
                >
                    Ingresar
                </button>

            </form>

        </div>

    );

}