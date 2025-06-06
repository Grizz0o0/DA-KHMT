'use client';

import React, { useState } from 'react';
import { useBookingHistory } from '@/queries/useBooking';
import { useDeleteBookingMutation } from '@/queries/useBooking';
import { format } from 'date-fns';
import { BadgeCheck, Clock, Eye, Trash2 } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const statusColorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const paymentStatusColorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
};

const BookingHistoryPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [page, setPage] = useState(1);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const { data, isLoading, error } = useBookingHistory({ page, limit });
    const deleteMutation = useDeleteBookingMutation();
    const bookings = data?.payload?.metadata.bookings ?? [];
    const pagination = data?.payload?.metadata.pagination;

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        setPage(newPage);
        params.set('page', newPage.toString());
        router.push(`/booking?${params.toString()}`);
    };

    const handleDeleteBooking = async (bookingId: string) => {
        await deleteMutation.mutateAsync(bookingId, {
            onSuccess: () => {
                toast.success('Hủy booking thành công!');
            },
            onError: () => {
                toast.error('Hủy booking thất bại. Vui lòng thử lại.');
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Card className="w-[300px]">
                    <CardHeader>
                        <CardTitle>Đang tải dữ liệu...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
                    </CardContent>
                </Card>
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
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-semibold text-center">
                Lịch sử đặt vé
            </h1>

            {bookings.length === 0 ? (
                <div className="text-center text-gray-500">
                    Bạn chưa có lịch sử đặt vé nào.
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <Card
                                key={booking._id}
                                className="shadow hover:shadow-md transition"
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <BadgeCheck className="text-blue-500 w-5 h-5" />
                                            <CardTitle
                                                onClick={() =>
                                                    router.push(
                                                        `/booking/${booking._id}`
                                                    )
                                                }
                                                className="cursor-pointer"
                                            >
                                                Mã đặt chỗ: {booking._id}
                                            </CardTitle>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {format(
                                                new Date(booking.bookingTime),
                                                'dd/MM/yyyy HH:mm'
                                            )}
                                        </span>
                                    </div>
                                    <CardDescription className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-600">
                                        <span>
                                            <strong>Số lượng:</strong>{' '}
                                            {booking.quantity}
                                        </span>
                                        <span>
                                            <strong>Tổng giá:</strong>{' '}
                                            {booking.totalPrice.toLocaleString()}{' '}
                                            VND
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            {format(
                                                new Date(booking.bookingTime),
                                                'dd/MM/yyyy HH:mm'
                                            )}
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        className={
                                            statusColorMap[booking.status]
                                        }
                                    >
                                        Trạng thái: {booking.status}
                                    </Badge>
                                    <Badge
                                        className={
                                            paymentStatusColorMap[
                                                booking.paymentStatus
                                            ]
                                        }
                                    >
                                        Thanh toán: {booking.paymentStatus}
                                    </Badge>
                                    <div className="flex gap-2 ml-auto">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                router.push(
                                                    `/booking/${booking._id}`
                                                )
                                            }
                                            className="cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Xem chi tiết
                                        </Button>
                                        {booking.status !== 'cancelled' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        className="flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Hủy vé
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Xác nhận hủy
                                                            booking?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Thao tác này sẽ
                                                            không thể hoàn tác.
                                                            Bạn chắc chắn muốn
                                                            hủy booking này?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Hủy bỏ
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleDeleteBooking(
                                                                    booking._id
                                                                )
                                                            }
                                                        >
                                                            Đồng ý
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {pagination && (
                        <div className="flex justify-center mt-6">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() =>
                                                handlePageChange(
                                                    Math.max(page - 1, 1)
                                                )
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
                                                onClick={() =>
                                                    handlePageChange(i + 1)
                                                }
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() =>
                                                handlePageChange(page + 1)
                                            }
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
                </>
            )}
        </div>
    );
};

export default BookingHistoryPage;
