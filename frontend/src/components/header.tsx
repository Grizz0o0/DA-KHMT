'use client';

import { Plane, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import NavItems from '@/components/NavItems';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import AuthModal from './auth/AuthModal';
import UserDropdown from './auth/UserDropdown';

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const { isAuth, isAuthReady } = useIsAuthenticated();

    return (
        <>
            <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Plane className="h-6 w-6 text-blue-500" />
                        <span className="font-bold text-xl text-gray-800">
                            Fly24h
                        </span>
                    </Link>

                    {/* Desktop menu */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <NavItems />
                    </nav>

                    {/* Auth (Desktop) */}
                    {isAuthReady && !isAuth ? (
                        <div className="hidden md:flex gap-2">
                            <Button
                                variant="ghost"
                                className="cursor-pointer"
                                onClick={() => {
                                    setIsLogin(true);
                                    setAuthOpen(true);
                                }}
                            >
                                Đăng nhập
                            </Button>
                            <Button
                                className="bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                onClick={() => {
                                    setIsLogin(false);
                                    setAuthOpen(true);
                                }}
                            >
                                Đăng ký
                            </Button>
                        </div>
                    ) : (
                        <div className="hidden md:block">
                            <UserDropdown variant="desktop" />
                        </div>
                    )}

                    {/* Mobile menu */}
                    <div className="md:hidden">
                        <DropdownMenu
                            open={menuOpen}
                            onOpenChange={setMenuOpen}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    {menuOpen ? (
                                        <X className="w-6 h-6" />
                                    ) : (
                                        <Menu className="w-6 h-6" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-64 mt-2 mr-2">
                                <DropdownMenuLabel className="text-sm text-gray-700">
                                    Tính năng
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <NavItems
                                    variant="dropdown"
                                    onItemClick={() => setMenuOpen(false)}
                                />
                                <DropdownMenuSeparator />
                                {isAuthReady && !isAuth ? (
                                    <>
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                setIsLogin(true);
                                                setAuthOpen(true);
                                            }}
                                        >
                                            Đăng nhập
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                setIsLogin(false);
                                                setAuthOpen(true);
                                            }}
                                        >
                                            Đăng ký
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <UserDropdown variant="mobile" />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <AuthModal
                open={authOpen}
                setOpen={setAuthOpen}
                isLogin={isLogin}
                setIsLogin={setIsLogin}
            />
        </>
    );
}

export default Header;
