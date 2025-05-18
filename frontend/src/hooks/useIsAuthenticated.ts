'use client';

import { useEffect, useState } from 'react';
import { getAccessTokenFromLocalStorage } from '@/lib/utils';

export const useIsAuthenticated = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const updateAuth = () => {
            setIsAuth(Boolean(getAccessTokenFromLocalStorage()));
            setIsReady(true);
        };

        updateAuth();

        window.addEventListener('authChanged', updateAuth);

        return () => {
            window.removeEventListener('authChanged', updateAuth);
        };
    }, []);
    return { isAuth, isAuthReady: isReady };
};
