'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

import {
    useDeletePromoCodeMutation,
    usePromoCodes,
    useActivatePromoCodeMutation,
} from '@/queries/usePromoCode';

export default function ManagePromoCodesPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = usePromoCodes({
        page,
        limit,
        order: 'desc',
        sortBy: 'code',
    });

    const deleteMutation = useDeletePromoCodeMutation();
    const activateMutation = useActivatePromoCodeMutation();

    const promoCodes = data?.payload.metadata.promocodes || [];
    const pagination = data?.payload.metadata.pagination;
    const totalPages = pagination?.totalPages || 1;

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id, {
            onSuccess: () => toast.success('Xoá mã giảm giá thành công'),
            onError: () => toast.error('Xoá thất bại, thử lại sau'),
        });
        router.refresh();
    };

    const handleActive = (id: string) => {
        activateMutation.mutate(id, {
            onSuccess: () => toast.success('Kích hoạt mã giảm giá thành công'),
            onError: () => toast.error('Kích hoạt thất bại, thử lại sau'),
        });
        router.refresh();
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/manage')}
                        className="px-2 text-sm cursor-pointer"
                    >
                        ← Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
                </div>
                <Button
                    className="cursor-pointer"
                    onClick={() => router.push('/manage/promocodes/create')}
                >
                    + Thêm mã mới
                </Button>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
                {isLoading ? (
                    <Skeleton className="h-4 w-64" />
                ) : (
                    <>
                        Tổng: {pagination?.totalItems} mã | Trang{' '}
                        {pagination?.page} / {pagination?.totalPages}
                    </>
                )}
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Giảm giá</TableHead>
                            <TableHead>Hiệu lực</TableHead>
                            <TableHead>Số lượt dùng</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(isLoading
                            ? Array.from({ length: limit })
                            : promoCodes
                        ).map((promo: any, i) => (
                            <TableRow key={promo?._id || i}>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-24" />
                                    ) : (
                                        promo.code
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-20" />
                                    ) : promo.discountPercentage ? (
                                        `-${promo.discountPercentage}%`
                                    ) : promo.discountAmount ? (
                                        `-${promo.discountAmount.toLocaleString()}đ`
                                    ) : (
                                        'Không xác định'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-32" />
                                    ) : (
                                        `${format(
                                            new Date(promo.startDate),
                                            'dd/MM/yyyy',
                                            { locale: vi }
                                        )} - ${format(
                                            new Date(promo.endDate),
                                            'dd/MM/yyyy',
                                            { locale: vi }
                                        )}`
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-16" />
                                    ) : (
                                        `${promo.usedCount}/${
                                            promo.maxUsage ?? '∞'
                                        }`
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-20" />
                                    ) : promo.isActive ? (
                                        <span className="text-green-600 font-medium">
                                            Đang hoạt động
                                        </span>
                                    ) : (
                                        <span className="text-red-500 font-medium">
                                            Ngừng
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {isLoading ? (
                                        <div className="flex justify-end gap-2">
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    ) : (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    router.push(
                                                        `/manage/promocodes/update/${promo._id}`
                                                    )
                                                }
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>

                                            {promo.isActive ? (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        handleDelete(promo._id)
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="bg-green-400 hover:bg-green-500 text-white cursor-pointer"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleActive(promo._id)
                                                    }
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() =>
                                        setPage((p) => Math.max(p - 1, 1))
                                    }
                                    className={
                                        page === 1
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={page === i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className="cursor-pointer"
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(p + 1, totalPages)
                                        )
                                    }
                                    className={
                                        page === totalPages
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
