'use client';

import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useTicketByBooking } from '@/queries/useTicket';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusColorMap: Record<string, string> = {
    unused: 'bg-yellow-100 text-yellow-700',
    used: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const BookingDetailPage = () => {
    const { id } = useParams() as { id: string };
    const searchParams = useSearchParams();
    const router = useRouter();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const { data, isLoading, error } = useTicketByBooking(id, {
        page,
        limit,
        sortBy: 'seatNumber',
        order: 'asc',
    });
    const tickets = data?.payload?.metadata.tickets ?? [];
    const pagination = data?.payload?.metadata.pagination;

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`/booking/${id}?${params.toString()}`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Skeleton className="w-40 h-6" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <span className="text-red-500">
                    Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.
                </span>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-blue-600">
                Chi tiết đặt vé: {id}
            </h1>

            {tickets.length === 0 ? (
                <p className="text-gray-500">Không có vé nào được tìm thấy.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tickets.map((ticket) => (
                        <Card key={ticket._id}>
                            <CardHeader>
                                <CardTitle>Ghế {ticket.seatNumber}</CardTitle>
                                <CardDescription className="flex gap-2 flex-wrap">
                                    <Badge
                                        className={cn(
                                            'capitalize',
                                            statusColorMap[ticket.status]
                                        )}
                                    >
                                        {ticket.status}
                                    </Badge>
                                    <Badge>
                                        {ticket.price.toLocaleString('vi-VN')} ₫
                                    </Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-600">
                                <p>
                                    <span className="font-medium">
                                        Hành khách:
                                    </span>{' '}
                                    {ticket.passenger.name}
                                </p>
                                <p>
                                    <span className="font-medium">Email:</span>{' '}
                                    {ticket.passenger.email}
                                </p>
                                <p>
                                    <span className="font-medium">SĐT:</span>{' '}
                                    {ticket.passenger.phone}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Ngày sinh:
                                    </span>{' '}
                                    {format(
                                        new Date(ticket.passenger.dateOfBirth),
                                        'dd/MM/yyyy',
                                        { locale: vi }
                                    )}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Quốc tịch:
                                    </span>{' '}
                                    {ticket.passenger.nationality}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {pagination && (
                <div className="flex justify-center mt-6">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() =>
                                        handlePageChange(Math.max(page - 1, 1))
                                    }
                                    className={
                                        pagination.hasPrevPage
                                            ? ''
                                            : 'pointer-events-none opacity-50'
                                    }
                                />
                            </PaginationItem>
                            {Array.from({
                                length: pagination.totalPages,
                            }).map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={page === i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(page + 1)}
                                    className={
                                        pagination.hasNextPage
                                            ? ''
                                            : 'pointer-events-none opacity-50'
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default BookingDetailPage;
