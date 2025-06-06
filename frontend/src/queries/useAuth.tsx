import authApiRequest from '@/app/apiRequests/auth';
import { useMutation } from '@tanstack/react-query';

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: authApiRequest.login,
    });
};

export const useLoginOAuthMutation = () => {
    return useMutation({
        mutationFn: authApiRequest.loginOAuth,
        onSuccess: (data) => {
            console.log('Login thành công', data);
        },
        onError: (error) => {
            console.error('Login thất bại', error);
        },
    });
};

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: authApiRequest.register,
    });
};

export const useLogoutMutation = () => {
    return useMutation({
        mutationFn: authApiRequest.logout,
    });
};

export const useRefreshTokenMutation = () => {
    return useMutation({
        mutationFn: authApiRequest.refreshToken,
    });
};
