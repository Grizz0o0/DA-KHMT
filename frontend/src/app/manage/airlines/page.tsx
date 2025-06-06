'use client';

import { useRouter } from 'next/navigation';
import { useAirlines, useDeleteAirlineMutation } from '@/queries/useAirline';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function ManageAirlinesPage() {
    const router = useRouter();
    const { data, isLoading } = useAirlines();
    const deleteMutation = useDeleteAirlineMutation();

    const handleDelete = async (id: string) => {
        const confirmed = confirm(
            'Bạn có chắc chắn muốn xoá hãng hàng không này?'
        );
        if (!confirmed) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Xoá hãng hàng không thành công');
        } catch (error) {
            toast.error('Lỗi khi xoá hãng hàng không');
        }
    };

    const airlines = data?.payload?.metadata?.airlines || [];

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Nút quay lại + tiêu đề */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/manage')}
                        className="px-2 text-sm cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold">
                        Quản lý hãng hàng không
                    </h1>
                </div>
                <Button
                    className="cursor-pointer"
                    onClick={() => router.push('/manage/airlines/create')}
                >
                    + Thêm hãng
                </Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Tên hãng</TableHead>
                            <TableHead>Mã hãng</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="text-right">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {(isLoading ? Array.from({ length: 5 }) : airlines).map(
                            (airline: any, index) => (
                                <TableRow
                                    key={airline?._id || index}
                                    className="hover:bg-muted"
                                >
                                    <TableCell className="px-4 py-2">
                                        {isLoading || !airline ? (
                                            <Skeleton className="h-8 w-16 rounded-md" />
                                        ) : airline.logo?.startsWith('http') ? (
                                            <Image
                                                src={airline.logo}
                                                alt={airline.name}
                                                className="h-8 w-auto rounded-md"
                                                width={32}
                                                height={32}
                                            />
                                        ) : (
                                            <span className="text-gray-400 italic">
                                                Không có
                                            </span>
                                        )}
                                    </TableCell>

                                    <TableCell className="px-4 py-2">
                                        {isLoading ? (
                                            <Skeleton className="h-4 w-32" />
                                        ) : (
                                            airline.name
                                        )}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {isLoading ? (
                                            <Skeleton className="h-4 w-20" />
                                        ) : (
                                            airline.code
                                        )}
                                    </TableCell>
                                    <TableCell className="px-4 py-2 max-w-xs truncate text-sm text-gray-600">
                                        {isLoading ? (
                                            <Skeleton className="h-4 w-40" />
                                        ) : (
                                            airline.description || (
                                                <span className="text-gray-400 italic">
                                                    Không có mô tả
                                                </span>
                                            )
                                        )}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {isLoading || !airline ? (
                                            <div className="flex justify-end gap-2">
                                                <Skeleton className="h-8 w-16" />
                                                <Skeleton className="h-8 w-16" />
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        router.push(
                                                            `/manage/airlines/update/${airline._id}`
                                                        )
                                                    }
                                                >
                                                    <Pencil className="w-4 h-4 mr-1" />
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        handleDelete(
                                                            airline._id
                                                        )
                                                    }
                                                >
                                                    <Trash className="w-4 h-4 mr-1" />
                                                    Xoá
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
