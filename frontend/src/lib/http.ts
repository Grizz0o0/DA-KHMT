/* eslint-disable @typescript-eslint/no-explicit-any */
import envConfig from '@/config';
import { HTTP_CONFIG } from '@/config/http.config';
import {
    LoginResType,
    RegisterResType,
    RefreshTokenResBodyType,
} from '@/schemaValidations/users.schema';
import {
    getUserIdFromLocalStorage,
    isClient,
    normalizePath,
    getAccessTokenFromLocalStorage,
} from './utils';

const { AUTHENTICATION_STATUS, DEFAULT_TIMEOUT, MAX_RETRIES } = HTTP_CONFIG;

export const saveAuthTokens = (
    accessToken: string,
    refreshToken: string,
    userId: string,
    role: string
) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
    window.dispatchEvent(new Event('authChanged'));
};

export const clearAuthTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    window.dispatchEvent(new Event('authChanged'));
};

// === Error class ===
export class HttpError extends Error {
    status: number;
    payload?: any;

    constructor({
        status,
        message,
        payload,
    }: {
        status: number;
        message: string;
        payload?: any;
    }) {
        super(message || 'Http Error');
        this.status = status;
        this.payload = payload;
    }
}

let clientLogoutRequest: null | Promise<any> = null;
let clientRefreshRequest: null | Promise<any> = null;

type CustomOptions = Omit<RequestInit, 'method'> & {
    baseUrl?: string;
    timeoutMs?: number;
};

// === Retry wrapper ===
const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retries: number = MAX_RETRIES
): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        if (!res.ok && retries > 0 && res.status >= 500) {
            return fetchWithRetry(url, options, retries - 1);
        }
        return res;
    } catch (error) {
        if (retries > 0) {
            return fetchWithRetry(url, options, retries - 1);
        }
        throw new HttpError({
            status: 0,
            message: 'Network error',
            payload: error,
        });
    } finally {
        clearTimeout(timeout);
    }
};

// === Main request handler ===
const request = async <Response>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    url: string,
    options?: CustomOptions
) => {
    const isFormData = options?.body instanceof FormData;
    const body = isFormData ? options.body : JSON.stringify(options?.body);
    const baseUrl = options?.baseUrl ?? envConfig.NEXT_PUBLIC_API_ENDPOINT;
    const fullUrl = `${baseUrl}/${normalizePath(url)}`;

    const baseHeaders: Record<string, string> = {
        authorization: `${getAccessTokenFromLocalStorage()}`,
        'x-client-id': getUserIdFromLocalStorage(),
    };
    if (!isFormData) {
        baseHeaders['Content-Type'] = 'application/json';
    }
    const res = await fetchWithRetry(fullUrl, {
        ...options,
        method,
        body,
        headers: {
            ...baseHeaders,
            ...options?.headers,
        },
    });

    const payload: Response = await res.json();

    if (!res.ok) {
        if (res.status === AUTHENTICATION_STATUS) {
            if (isClient()) {
                // Thử tự refresh token trước khi logout
                if (!clientRefreshRequest) {
                    clientRefreshRequest = fetch('/api/auth/refresh-token', {
                        method: 'POST',
                        body: null,
                        headers: { ...baseHeaders },
                    });
                }
                const refreshRes = await clientRefreshRequest;
                clientRefreshRequest = null;

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    const {
                        metadata: {
                            tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
                            user: { _id: newUserId, role: newRole },
                        },
                    } = refreshData as any;
                    saveAuthTokens(newAccessToken, newRefreshToken, newUserId, newRole);
                    baseHeaders.authorization = `${newAccessToken}`;
                    baseHeaders['x-client-id'] = newUserId;

                    const retryRes = await fetchWithRetry(fullUrl, {
                        ...options,
                        method,
                        body,
                        headers: { ...baseHeaders, ...options?.headers },
                    });
                    const retryPayload: Response = await retryRes.json();
                    if (retryRes.ok) {
                        return { status: retryRes.status, payload: retryPayload };
                    }

                    if (retryRes.status !== AUTHENTICATION_STATUS) {
                        throw new HttpError({
                            status: retryRes.status,
                            message: (retryPayload as any).message || 'Unknown error',
                            payload: retryPayload,
                        });
                    }
                }

                if (!clientLogoutRequest) {
                    clientLogoutRequest = fetch('/api/auth/logout', {
                        method: 'POST',
                        body: null,
                        headers: { ...baseHeaders },
                    });
                    await clientLogoutRequest;
                    clearAuthTokens();
                    clientLogoutRequest = null;
                    location.href = '/';
                }
            } else {
                throw new HttpError({
                    status: AUTHENTICATION_STATUS,
                    message: `/logout?accessToken=${getAccessTokenFromLocalStorage()}`,
                });
            }
        }

        throw new HttpError({
            status: res.status,
            message: (payload as any).message || 'Unknown error',
            payload: payload,
        });
    }

    // Handle token saving after login/signup
    if (isClient()) {
        const path = normalizePath(url);
        console.log(path);
        if (
            path === 'api/auth/login' ||
            path === 'api/auth/signup' ||
            path === 'api/auth/refresh-token'
        ) {
            const resPayload = payload as
                | LoginResType
                | RegisterResType
                | RefreshTokenResBodyType;

            const {
                metadata: {
                    tokens: { accessToken, refreshToken },
                    user: { _id: userId, role },
                },
            } = resPayload;
            saveAuthTokens(accessToken, refreshToken, userId, role);
        } else if (path === 'api/auth/logout') {
            clearAuthTokens();
        }
    }

    return { status: res.status, payload };
};

// === HTTP helper ===
const http = {
    get<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
        return request<Response>('GET', url, options);
    },
    post<Response>(
        url: string,
        body: any,
        options?: Omit<CustomOptions, 'body'>
    ) {
        return request<Response>('POST', url, { ...options, body });
    },
    patch<Response>(
        url: string,
        body: any,
        options?: Omit<CustomOptions, 'body'>
    ) {
        return request<Response>('PATCH', url, { ...options, body });
    },
    delete<Response>(
        url: string,
        body: any,
        options?: Omit<CustomOptions, 'body'>
    ) {
        return request<Response>('DELETE', url, { ...options, body });
    },
};

export default http;
