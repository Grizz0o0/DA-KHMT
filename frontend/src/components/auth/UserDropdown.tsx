'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useLogoutMutation } from '@/queries/useAuth';
import { toast } from 'sonner';
import { handleErrorClient } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAccountMe } from '@/queries/useAccount';

type Props = {
    variant?: 'desktop' | 'mobile';
};

const UserDropdown = ({ variant = 'desktop' }: Props) => {
    const logoutMutation = useLogoutMutation();
    const router = useRouter();
    const { data } = useAccountMe();
    const user = data?.payload?.metadata?.user;
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const handleLogout = async () => {
        if (logoutMutation.isPending) return;
        try {
            const result: any = await logoutMutation.mutateAsync();
            toast.success(result?.payload?.message || 'Đăng xuất thành công');
            router.push('/');
        } catch (err: any) {
            handleErrorClient(err);
        }
    };

    if (!user) return null;

    const renderMenuItems = () => (
        <>
            <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile">Trang cá nhân</Link>
            </DropdownMenuItem>
            {isAdmin && (
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/manage">Quản lý</Link>
                </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/booking">Lịch sử đặt vé</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                Đăng xuất
            </DropdownMenuItem>
        </>
    );

    const getInitials = (name: string = '') => {
        const words = name.trim().split(' ');
        return words
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    if (variant === 'mobile') {
        return renderMenuItems();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div
                    className="cursor-pointer rounded-full border border-gray-200 bg-gray-100 w-10 h-10 flex items-center justify-center hover:shadow-sm hover:ring-2 hover:ring-blue-300 transition"
                    title="Tài khoản"
                    aria-label="Tài khoản"
                >
                    <Avatar className="w-8 h-8">
                        <AvatarImage
                            src={user.avatar}
                            alt="Avatar"
                            crossOrigin="anonymous"
                            onError={(e) =>
                                ((e.target as HTMLImageElement).style.display =
                                    'none')
                            }
                        />
                        <AvatarFallback className="text-sm font-medium text-gray-800">
                            {getInitials(user.username)}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Xin chào, {user.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {renderMenuItems()}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserDropdown;
