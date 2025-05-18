/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jwt from 'jsonwebtoken';
import { UserRole } from '@/constants/users';
import { UseFormSetError } from 'react-hook-form';
import { HttpError } from '@/lib/http';
import { toast } from 'sonner';
type PayloadJWT = {
    userId: string;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const normalizePath = (path: string) => {
    return path.startsWith('/') ? path.slice(1) : path;
};

export const toQueryString = (params: Record<string, any>) =>
    Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(
            ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join('&');

export const isClient = () => typeof window !== 'undefined';

export const handleErrorClient = ({
    error,
    setError,
    duration,
}: {
    error: any;
    setError?: UseFormSetError<any>;
    duration?: number;
}) => {
    if (
        error instanceof HttpError &&
        setError &&
        Array.isArray(error.payload?.errors)
    ) {
        error.payload.errors.forEach((item: any) => {
            setError(item.field, {
                type: 'server',
                message: item.message,
            });
        });
    } else {
        const errorMessage =
            error?.payload?.message ||
            error?.message ||
            'Đã xảy ra lỗi. Vui lòng thử lại sau.';
        toast.error(errorMessage, {
            duration: duration ?? 5000,
        });
    }
};

export const decodeJWT = <Payload>(token: string) => {
    return jwt.decode(token) as Payload;
};

export const getExpireAt = (token: string): Date | undefined => {
    try {
        const decoded = decodeJWT<PayloadJWT>(token);
        if (!decoded?.exp) {
            throw new Error('Invalid token payload: missing exp');
        }

        return new Date(decoded.exp * 1000); // chuyển từ giây sang mili giây
    } catch (error) {
        console.error('Failed to decode token:', error);
    }
};

export const getUserIdFromToken = (token: string): string | undefined => {
    try {
        const decoded = decodeJWT<PayloadJWT>(token);
        if (!decoded?.userId) {
            throw new Error('Invalid token payload: missing userId');
        }

        return decoded?.userId;
    } catch (error) {
        console.error('Failed to extract userId from token:', error);
    }
};

export const getRoleFromToken = (token: string): string | undefined => {
    try {
        const decoded = decodeJWT<PayloadJWT>(token);
        if (!decoded?.role) {
            throw new Error('Invalid token payload: missing role');
        }

        return decoded?.role;
    } catch (error) {
        console.error('Failed to extract role from token:', error);
    }
};

export const getAccessTokenFromLocalStorage = () =>
    isClient() ? localStorage.getItem('accessToken') : null;

export const getRefreshTokenFromLocalStorage = () =>
    isClient() ? localStorage.getItem('refreshToken') : null;

export const getUserIdFromLocalStorage = () =>
    isClient() ? localStorage.getItem('userId') || '' : '';

export const getRoleIdFromLocalStorage = () =>
    isClient() ? localStorage.getItem('role') || '' : '';

export const getUserFromLocalStorage = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

export const setAccessTokenToLocalStorage = (token: string) => {
    if (isClient()) {
        localStorage.setItem('accessToken', token);
    }
};

export const setRefreshTokenToLocalStorage = (token: string) => {
    if (isClient()) {
        localStorage.setItem('refreshToken', token);
    }
};

export const getGenderLabel = (gender: string): string => {
    switch (gender) {
        case 'male':
            return 'Nam';
        case 'female':
            return 'Nữ';
        case 'other':
            return 'Chưa cập nhật';
        default:
            return '';
    }
};
