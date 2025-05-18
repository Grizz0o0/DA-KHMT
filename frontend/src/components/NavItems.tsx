'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { Skeleton } from '@/components/ui/skeleton';

type NavItem = {
    label: string;
    href: string;
    authRequired?: boolean;
};

const navItems: NavItem[] = [
    { label: 'Trang Chủ', href: '/' },
    { label: 'Chuyến Bay', href: '/flights' },
    { label: 'Giới Thiệu', href: '/about' },
    { label: 'Liên Hệ', href: '/contact' },
];

type NavItemsProps = {
    variant?: 'link' | 'dropdown';
    className?: string;
    onItemClick?: () => void;
};

const NavItems = ({
    variant = 'link',
    className,
    onItemClick,
}: NavItemsProps) => {
    const { isAuth, isAuthReady } = useIsAuthenticated();
    const [visibleItems, setVisibleItems] = useState<NavItem[]>([]);

    useEffect(() => {
        if (!isAuthReady) return;
        const filtered = navItems.filter((item) => {
            if (item.authRequired && !isAuth) return false;
            return true;
        });
        setVisibleItems(filtered);
    }, [isAuth, isAuthReady]);

    if (!isAuthReady) {
        return (
            <>
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                        key={index}
                        className="h-5 w-20 mx-2 rounded bg-gray-200"
                    />
                ))}
            </>
        );
    }

    if (variant === 'dropdown') {
        return (
            <>
                {visibleItems.map((item) => (
                    <div key={item.href} onClick={onItemClick}>
                        <Link
                            href={item.href}
                            className="w-full block px-2 py-1 text-sm hover:bg-gray-100 rounded"
                        >
                            {item.label}
                        </Link>
                    </div>
                ))}
            </>
        );
    }

    return (
        <>
            {visibleItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={
                        className ||
                        'text-gray-600 hover:text-blue-500 transition-colors'
                    }
                >
                    {item.label}
                </Link>
            ))}
        </>
    );
};

export default NavItems;
