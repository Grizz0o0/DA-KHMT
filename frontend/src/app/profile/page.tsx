'use client';

import { useRouter } from 'next/navigation';
import { useAccountMe } from '@/queries/useAccount';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { getGenderLabel } from '@/lib/utils';

const ProfilePage = () => {
    const { data, isLoading } = useAccountMe();
    const user = data?.payload?.metadata?.user;
    const router = useRouter();

    if (isLoading || !user) {
        return (
            <div className="container mx-auto p-6">
                <Skeleton className="h-10 w-1/3 mb-4" />
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-2" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <Card className="p-6 shadow-md">
                <CardHeader className="flex flex-col items-center gap-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2">
                        {user.avatar ? (
                            <Image
                                src={user.avatar}
                                alt="Avatar"
                                width={112}
                                height={112}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                No Avatar
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-center text-xl font-bold">
                        {user.username}
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/profile/update')}
                            className="cursor-pointer"
                        >
                            Cập nhật hồ sơ
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.push('/profile/change-password')
                            }
                            className="cursor-pointer"
                        >
                            Đổi mật khẩu
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="mt-4 space-y-3 text-sm text-gray-700">
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow
                        label="Số điện thoại"
                        value={user.phoneNumber || 'Chưa cập nhật'}
                    />
                    <InfoRow
                        label="Giới tính"
                        value={getGenderLabel(user.gender)}
                    />
                    <InfoRow
                        label="Địa chỉ"
                        value={user.address || 'Chưa cập nhật'}
                    />
                    <InfoRow
                        label="Vai trò"
                        value={user.role === 'user' ? 'Người dùng' : user.role}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between border-b py-2">
        <span className="font-medium text-gray-600">{label}:</span>
        <span className="text-gray-900">{value}</span>
    </div>
);

export default ProfilePage;
