'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAirports, useDeleteAirportMutation } from '@/queries/useAirport';
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageAirportsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = useAirports({
        page,
        limit,
        order: 'desc',
        sortBy: 'name',
    });

    const deleteMutation = useDeleteAirportMutation();
    const airports = data?.payload?.metadata?.airports || [];
    const pagination = data?.payload.pagination;
    const handleDelete = async (id: string) => {
        const confirmed = confirm('Bạn có chắc chắn muốn xoá sân bay này?');
        if (!confirmed) return;

        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Xoá sân bay thành công');
        } catch (error) {
            toast.error('Lỗi khi xoá sân bay');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Nút quay lại và tiêu đề */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/manage')}
                    className="px-2 text-sm cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay lại
                </Button>
                <h1 className="text-2xl font-bold">Quản lý sân bay</h1>
                <Button
                    className="cursor-pointer"
                    onClick={() => router.push('/manage/airports/create')}
                >
                    + Thêm sân bay
                </Button>
            </div>

            {/* Thông tin phân trang */}
            <div className="mb-4 text-sm text-muted-foreground">
                {isLoading ? (
                    <Skeleton className="h-4 w-64" />
                ) : (
                    <>
                        Tổng: {pagination?.totalItems} sân bay | Trang{' '}
                        {pagination?.page} / {pagination?.totalPages}
                    </>
                )}
            </div>

            {/* Bảng dữ liệu */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên sân bay</TableHead>
                            <TableHead>Mã sân bay</TableHead>
                            <TableHead>Thành phố</TableHead>
                            <TableHead>Quốc gia</TableHead>
                            <TableHead className="text-right">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(isLoading
                            ? Array.from({ length: limit })
                            : airports
                        ).map((airport: any, index) => (
                            <TableRow
                                key={airport?._id || index}
                                className="hover:bg-muted"
                            >
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-32" />
                                    ) : (
                                        airport.name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-20" />
                                    ) : (
                                        airport.code
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-32" />
                                    ) : (
                                        airport.city
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-32" />
                                    ) : (
                                        airport.country
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
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
                                                        `/manage/airports/update/${airport._id}`
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
                                                    handleDelete(airport._id)
                                                }
                                            >
                                                <Trash className="w-4 h-4 mr-1" />
                                                Xoá
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Phân trang */}
            <div className="flex justify-center mt-6">
                {isLoading ? (
                    <Skeleton className="h-8 w-[200px]" />
                ) : pagination ? (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() =>
                                        setPage((p) => Math.max(p - 1, 1))
                                    }
                                    className={
                                        pagination.hasPrevPage
                                            ? ''
                                            : 'pointer-events-none opacity-50'
                                    }
                                />
                            </PaginationItem>
                            {Array.from({ length: pagination.totalPages }).map(
                                (_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={pagination.page === i + 1}
                                            onClick={() => setPage(i + 1)}
                                            className="cursor-pointer"
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            )}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage((p) => p + 1)}
                                    className={
                                        pagination.hasNextPage
                                            ? ''
                                            : 'pointer-events-none opacity-50'
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                ) : null}
            </div>
        </div>
    );
}
