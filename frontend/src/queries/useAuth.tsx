import authApiRequest from '@/app/apiRequests/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: authApiRequest.login,
        onSuccess: (data) => toast.success('Đăng nhập thành công'),
        onError: (error: any) => toast.error('Đăng nhập thất bại'),
    });
};

export const useLoginOAuthMutation = () => {
    return useMutation({
        mutationFn: authApiRequest.loginOAuth,
        onSuccess: (data) => toast.success('Login thành công!'),
        onError: (error: any) => toast.error('Login thất bại'),
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

export const useVerifyEmailRegisterMutation = () => {
    return useMutation({
        mutationFn: authApiRequest.verifyEmailRegister,
        onSuccess: () =>
            toast.success('Xác thực email thành công! Vui lòng đăng nhập'),
        onError: (error: any) =>
            toast.error(
                error?.message || 'Có lỗi xảy ra khi gửi xác minh email.'
            ),
    });
};

export const useResendVerifyEmailMutation = () =>
    useMutation({
        mutationFn: authApiRequest.resendVerifyEmail,
        onSuccess: () => toast.success('Email xác minh đã được gửi'),
        onError: (error: any) =>
            toast.error(
                error?.message || 'Có lỗi xảy ra khi gửi email xác minh.'
            ),
    });

export const useResendVerifyForgotPasswordMutation = () =>
    useMutation({
        mutationFn: authApiRequest.resendVerifyForgotPassword,
        onSuccess: () => toast.success('Email đặt lại mật khẩu đã được gửi'),
        onError: (error: any) =>
            toast.error(
                error?.message ||
                    'Có lỗi xảy ra khi gửi email đặt lại mật khẩu.'
            ),
    });

export const useForgotPasswordMutation = () =>
    useMutation({
        mutationFn: authApiRequest.forgotPassword,
        onSuccess: () => toast.success('Email đặt lại mật khẩu đã được gửi'),
        onError: (error: any) =>
            toast.error(
                error?.message ||
                    'Có lỗi xảy ra khi gửi email đặt lại mật khẩu.'
            ),
    });

export const useResetPasswordMutation = () =>
    useMutation({
        mutationFn: authApiRequest.resetPassword,
        onSuccess: () =>
            toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.'),
        onError: (error: any) =>
            toast.error(
                error?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.'
            ),
    });
