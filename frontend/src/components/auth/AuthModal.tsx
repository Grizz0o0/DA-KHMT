'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import envConfig from '@/config';
import Link from 'next/link';
import LoginFormFields from '@/components/auth/LoginFormFields';
import RegisterFormFields from '@/components/auth/RegisterFormFields';
import Image from 'next/image';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    isLogin: boolean;
    setIsLogin: (isLogin: boolean) => void;
};

export default function AuthModal({
    open,
    setOpen,
    isLogin,
    setIsLogin,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md p-6 rounded-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-center mb-2">
                        Chào mừng bạn đến với Fly24h
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-gray-500">
                        Vui lòng đăng nhập hoặc đăng ký để tiếp tục
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center mb-4 border-b">
                    <button
                        className={`p-2 w-1/2 cursor-pointer ${
                            isLogin
                                ? 'border-b-2 border-blue-500 font-semibold'
                                : ''
                        }`}
                        onClick={() => setIsLogin(true)}
                    >
                        Đăng nhập
                    </button>
                    <button
                        className={`p-2 w-1/2 cursor-pointer ${
                            !isLogin
                                ? 'border-b-2 border-blue-500 font-semibold'
                                : ''
                        }`}
                        onClick={() => setIsLogin(false)}
                    >
                        Đăng ký
                    </button>
                </div>

                {isLogin ? (
                    <>
                        <LoginFormFields setOpen={setOpen} />
                        <div className="flex items-center my-2">
                            <hr className="flex-grow border-gray-300" />
                            <span className="mx-2 text-gray-500">hoặc</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>
                        <Button
                            type="button"
                            asChild
                            className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            <Link href={googleOAuthUrl}>
                                <Image
                                    src={'/google-logo.png'}
                                    alt="Google"
                                    width={20}
                                    height={20}
                                />
                                Đăng nhập với Google
                            </Link>
                        </Button>
                        <p className="text-sm text-center text-blue-500 cursor-pointer">
                            Quên mật khẩu?
                        </p>
                    </>
                ) : (
                    <RegisterFormFields setOpen={setOpen} />
                )}
            </DialogContent>
        </Dialog>
    );
}

const getGoogleAuthUrl = () => {
    const { NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_GOOGLE_REDIRECT_URI } =
        envConfig;
    const url = `https://accounts.google.com/o/oauth2/v2/auth`;
    const query = {
        client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        redirect_uri: NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
        prompt: 'consent',
        access_type: 'offline',
    };

    const queryString = new URLSearchParams(query).toString();
    return `${url}?${queryString}`;
};

const googleOAuthUrl = getGoogleAuthUrl();
