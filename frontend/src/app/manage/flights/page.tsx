'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFlights, useDeleteFlightMutation } from '@/queries/useFlight';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { handleErrorClient } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export default function ManageFlightsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = useFlights({
        page,
        limit,
        order: 'desc',
        sortBy: 'departureTime',
    });

    const deleteMutation = useDeleteFlightMutation();

    const handleDelete = async (id: string) => {
        const confirmed = confirm('Bạn có chắc chắn muốn xoá chuyến bay này?');
        if (!confirmed) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Xoá chuyến bay thành công');
        } catch (error) {
            toast.error('Lỗi khi xoá chuyến bay');
            handleErrorClient({ error });
        }
    };

    const flights = (data?.payload?.metadata?.flights || []).filter(
        (flight) => flight.isActive !== false
    );

    const pagination = data?.payload?.metadata?.pagination;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/manage')}
                    className="mb-4 px-2 text-sm cursor-pointer"
                >
                    ← Quay lại
                </Button>
                <h1 className="text-2xl font-bold">Quản lý chuyến bay</h1>
                <Button
                    onClick={() => router.push('/manage/flights/create')}
                    className="cursor-pointer text-white"
                >
                    + Thêm chuyến bay
                </Button>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
                {isLoading ? (
                    <Skeleton className="h-4 w-64" />
                ) : (
                    <>
                        Tổng số chuyến bay: {pagination?.totalItems} | Trang{' '}
                        {pagination?.page} / {pagination?.totalPages}
                    </>
                )}
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Hãng</TableHead>
                            <TableHead>Điểm đi</TableHead>
                            <TableHead>Điểm đến</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Máy bay</TableHead>
                            <TableHead>Giá thấp nhất</TableHead>
                            <TableHead>Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(isLoading
                            ? Array.from({ length: limit })
                            : flights
                        ).map((flight: any, i) => (
                            <TableRow key={flight?._id || i}>
                                <TableCell>
                                    {isLoading || !flight ? (
                                        <Skeleton className="h-4 w-16" />
                                    ) : (
                                        flight.flightNumber
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading || !flight ? (
                                        <Skeleton className="h-4 w-40" />
                                    ) : (
                                        `${flight.airline?.name ?? '-'} (${
                                            flight.airline?.code
                                        })`
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading || !flight ? (
                                        <Skeleton className="h-4 w-32" />
                                    ) : (
                                        `${flight.departureAirport?.city} (${flight.departureAirport?.code})`
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading || !flight ? (
                                        <Skeleton className="h-4 w-32" />
                                    ) : (
                                        `${flight.arrivalAirport?.city} (${flight.arrivalAirport?.code})`
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading || !flight ? (
                                        <Skeleton className="h-4 w-48" />
                                    ) : (
                                        `${format(
                                            new Date(flight.departureTime),
                                            'HH:mm dd/MM/yyyy',
                                            { locale: vi }
                                        )} → ${format(
                                            new Date(flight.arrivalTime),
                                            'HH:mm dd/MM/yyyy',
                                            { locale: vi }
                                        )}`
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading || !flight ? (
                                        <Skeleton className="h-4 w-40" />
                                    ) : (
                                        `${flight.aircraft?.model} (${flight.aircraft?.manufacturer})`
                                    )}
                                </TableCell>
                                <TableCell className="text-orange-600 font-semibold">
                                    {isLoading || !flight ? (
                                        <Skeleton className="h-4 w-20" />
                                    ) : (
                                        `${Math.min(
                                            ...flight.fareOptions.map(
                                                (f: any) => f.price
                                            )
                                        ).toLocaleString('vi-VN')} ₫`
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading || !flight ? (
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-16" />
                                            <Skeleton className="h-8 w-16" />
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.push(
                                                        `/manage/flights/update/${flight._id}`
                                                    )
                                                }
                                                className="cursor-pointer"
                                            >
                                                <Pencil className="w-4 h-4 mr-1" />
                                                Sửa
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(flight._id)
                                                }
                                                className="cursor-pointer"
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
