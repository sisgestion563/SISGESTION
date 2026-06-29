import { useState } from 'react';
import { login } from '../services/auth.service';

export const useAuth = () => {

    const [loading, setLoading] =
        useState(false);

    const doLogin =
    async (username, password) => {

        setLoading(true);

        try {

            const response =
                await login(
                    username,
                    password
                );

            if (!response.success) {
                return false;
            }

            localStorage.setItem(
                'token',
                response.data.token
            );

            localStorage.setItem(
                'usuario',
                JSON.stringify(
                    response.data.usuario
                )
            );

            return true;

        } catch (error) {

            console.error(error);
            return false;

        } finally {

            setLoading(false);

        }

    };

    return {
        loading,
        doLogin
    };

};
