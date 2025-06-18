'use client';

import { useEffect } from 'react';
import authApiRequest from '@/app/apiRequests/auth';
import {
    decodeJWT,
    getAccessTokenFromLocalStorage,
    getRefreshTokenFromLocalStorage,
    setAccessTokenToLocalStorage,
    setRefreshTokenToLocalStorage,
} from '@/lib/utils';
import { clearAuthTokens } from '@/lib/http';
export default function TokenAutoRefresh() {
    useEffect(() => {
        const checkAndRefresh = async () => {
            const accessToken = getAccessTokenFromLocalStorage();
            const refreshToken = getRefreshTokenFromLocalStorage();
            if (!accessToken || !refreshToken) return;

            const decodeAccessToken = decodeJWT(accessToken) as {
                exp: number;
                iat: number;
            };
            const decodeRefreshToken = decodeJWT(refreshToken) as {
                exp: number;
                iat: number;
            };
            const now = new Date().getTime() / 1000;
            if (decodeRefreshToken.exp < now) return;

            const remaining = decodeAccessToken.exp - now;

            // Khi access token gần hết hạn (trên 1/3), tiến hành refresh
            if (
                remaining <
                (decodeAccessToken.exp - decodeAccessToken.iat) / 3
            ) {
                console.log('Access token gần hết hạn, tiến hành refresh...');
                try {
                    const result = await authApiRequest.refreshToken();
                    setAccessTokenToLocalStorage(
                        result.payload.metadata.tokens.accessToken
                    );
                    setRefreshTokenToLocalStorage(
                        result.payload.metadata.tokens.refreshToken
                    );
                    console.log('Token đã được refresh');
                } catch (err) {
                    console.error('Refresh token thất bại', err);
                    clearAuthTokens();
                }
            } else {
                console.log(
                    `Token còn ${Math.floor(remaining)}s, chưa cần refresh`
                );
            }
        };

        // Kiểm tra mỗi 5 phút
        const TIMEOUT = 5 * 60 * 1000;
        const interval = setInterval(checkAndRefresh, TIMEOUT);
        checkAndRefresh();

        return () => clearInterval(interval);
    }, []);

    return null;
}
