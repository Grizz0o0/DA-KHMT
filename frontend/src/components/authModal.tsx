'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import envConfig from '@/config';
import Link from 'next/link';
export default function AuthModal() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost">Đăng nhập / Đăng ký</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-6 rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-center mb-4">
                        Chào mừng bạn đến với FlyNow
                    </DialogTitle>
                </DialogHeader>

                <div className="flex justify-center mb-4 border-b">
                    <button
                        className={`p-2 w-1/2 ${
                            isLogin
                                ? 'border-b-2 border-blue-500 font-semibold'
                                : ''
                        }`}
                        onClick={() => setIsLogin(true)}
                    >
                        Đăng nhập
                    </button>
                    <button
                        className={`p-2 w-1/2 ${
                            !isLogin
                                ? 'border-b-2 border-blue-500 font-semibold'
                                : ''
                        }`}
                        onClick={() => setIsLogin(false)}
                    >
                        Đăng ký
                    </button>
                </div>

                {isLogin ? <LoginForm /> : <RegisterForm />}
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

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // const handleLogin = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     // Xử lý đăng nhập với email/mật khẩu (sẽ cần API riêng)
    // };
    return (
        <form className="space-y-4">
            <div>
                <Label>Email</Label>
                <Input
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <Label>Mật khẩu</Label>
                <Input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="">
                <Button className="w-full mt-2">Đăng nhập</Button>
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
                    {/* <FcGoogle size={20} /> */}
                    <Link href={googleOAuthUrl}>Đăng nhập với Google</Link>
                </Button>
            </div>
            <p className="text-sm text-center text-blue-500 cursor-pointer">
                Quên mật khẩu?
            </p>
        </form>
    );
};

const RegisterForm = () => {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <form className="space-y-4">
            <div>
                <Label>Họ & Tên</Label>
                <Input type="text" placeholder="Nhập họ và tên" />
            </div>
            <div>
                <Label>Số điện thoại</Label>
                <Input type="tel" placeholder="Nhập số điện thoại" />
            </div>
            <div>
                <Label>Email</Label>
                <Input type="email" placeholder="Nhập email của bạn" />
            </div>
            <div>
                <Label>Mật khẩu</Label>
                <Input type="password" placeholder="Nhập mật khẩu" />
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="terms"
                    className="mr-2 cursor-pointer"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                />
                <label htmlFor="terms" className="text-sm cursor-pointer">
                    Tôi đồng ý với{' '}
                    <span className="text-blue-500 cursor-pointer">
                        Điều khoản và điều kiện
                    </span>
                </label>
            </div>
            <Button className="w-full mt-2" disabled={!isChecked}>
                Đăng ký
            </Button>
        </form>
    );
};
