'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAircrafts, useDeleteAircraftMutation } from '@/queries/useAircraft';
import { useAirlines } from '@/queries/useAirline';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, ArrowLeft } from 'lucide-react';
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
import { toast } from 'sonner';

export default function ManageAircraftsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = useAircrafts({ page, limit });
    const deleteMutation = useDeleteAircraftMutation();
    const { data: airlineData } = useAirlines();

    const aircrafts = data?.payload?.metadata?.aircrafts || [];
    const pagination = data?.payload?.metadata?.pagination;
    const airlines = airlineData?.payload?.metadata?.airlines || [];

    const getAirlineNameById = (id: string) => {
        return airlines.find((a) => a._id === id)?.name ?? 'Không rõ';
    };

    const handleDelete = async (id: string) => {
        const confirmed = confirm('Bạn có chắc chắn muốn xoá máy bay này?');
        if (!confirmed) return;

        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Xoá máy bay thành công');
        } catch {
            toast.error('Lỗi khi xoá máy bay');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/manage')}
                        className="cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold">Quản lý máy bay</h1>
                </div>
                <Button
                    className="cursor-pointer"
                    onClick={() => router.push('/manage/aircrafts/create')}
                >
                    + Thêm máy bay
                </Button>
            </div>

            {/* Pagination Info */}
            <div className="mb-4 text-sm text-muted-foreground">
                {isLoading ? (
                    <Skeleton className="h-4 w-64" />
                ) : (
                    <>
                        Tổng: {pagination?.totalItems} máy bay | Trang{' '}
                        {pagination?.page} / {pagination?.totalPages}
                    </>
                )}
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Model</TableHead>
                            <TableHead>Mã máy bay</TableHead>
                            <TableHead>Hãng hàng không</TableHead>
                            <TableHead>Ghế (Eco / Biz / First)</TableHead>
                            <TableHead className="text-right">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(isLoading
                            ? Array.from({ length: limit })
                            : aircrafts
                        ).map((aircraft: any, i) => (
                            <TableRow
                                key={aircraft?._id || i}
                                className="hover:bg-muted"
                            >
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-32" />
                                    ) : (
                                        aircraft.model
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-24" />
                                    ) : (
                                        aircraft.aircraftCode
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-32" />
                                    ) : (
                                        getAirlineNameById(aircraft.airlineId)
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-40" />
                                    ) : (
                                        `${
                                            aircraft.seatConfiguration?.economy
                                                ?.rows ?? 0
                                        }x${
                                            aircraft.seatConfiguration?.economy
                                                ?.seatsPerRow ?? 0
                                        } / ${
                                            aircraft.seatConfiguration?.business
                                                ?.rows ?? 0
                                        }x${
                                            aircraft.seatConfiguration?.business
                                                ?.seatsPerRow ?? 0
                                        } / ${
                                            aircraft.seatConfiguration
                                                ?.firstClass?.rows ?? 0
                                        }x${
                                            aircraft.seatConfiguration
                                                ?.firstClass?.seatsPerRow ?? 0
                                        }`
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
                                                        `/manage/aircrafts/update/${aircraft._id}`
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
                                                    handleDelete(aircraft._id)
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

            {/* Pagination */}
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
                                            className="cursor-pointer"
                                            onClick={() => setPage(i + 1)}
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
