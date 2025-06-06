// File: src/app/manage/bookings/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { useBookings, useUpdateBookingMutation } from '@/queries/useBooking';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { BookingStatus } from '@/constants/bookings';

export default function ManageBookingsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = useBookings({ page, limit });
    const updateBookingMutation = useUpdateBookingMutation();
    const bookings = data?.payload?.metadata?.bookings || [];
    const pagination = data?.payload?.metadata?.pagination;

    const formatStatus = (status: string) => {
        if (status === 'confirmed')
            return (
                <span className="text-green-600 font-medium">Đã xác nhận</span>
            );
        if (status === 'cancelled')
            return <span className="text-red-500 font-medium">Đã huỷ</span>;
        return <span className="text-yellow-500 font-medium">Chờ xử lý</span>;
    };

    const formatPayment = (status: string) => {
        if (status === 'success')
            return (
                <span className="text-green-600 font-medium">
                    Đã thanh toán
                </span>
            );
        return (
            <span className="text-red-500 font-medium">Chưa thanh toán</span>
        );
    };

    const handleStatusUpdate = (booking: any, target: string) => {
        if (target === 'cancelled') {
            const confirmCancel = window.confirm(
                'Bạn có chắc chắn muốn huỷ đặt chỗ này?'
            );
            if (!confirmCancel) return;
        }

        updateBookingMutation.mutate(
            {
                bookingId: booking._id,
                body: { status: target as BookingStatus },
            },
            {
                onSuccess: () => toast.success(`Đã chuyển sang ${target}`),
                onError: (err: any) =>
                    toast.error(err?.message || 'Cập nhật thất bại'),
            }
        );
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
                    <h1 className="text-2xl font-bold">Quản lý đặt chỗ</h1>
                </div>
                <Button
                    className="cursor-pointer"
                    onClick={() => router.push('/manage/bookings/create')}
                >
                    + Thêm đặt chỗ
                </Button>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
                {isLoading ? (
                    <Skeleton className="h-4 w-64" />
                ) : (
                    <>
                        Tổng: {pagination?.totalItems} đặt chỗ | Trang{' '}
                        {pagination?.page} / {pagination?.totalPages}
                    </>
                )}
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã đặt chỗ</TableHead>
                            <TableHead>Ngày đặt</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thanh toán</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead className="text-right">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading
                            ? Array.from({ length: limit }).map((_, i) => (
                                  <TableRow key={i}>
                                      <TableCell>
                                          <Skeleton className="h-4 w-28" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-32" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-24" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-24" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-20" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-8 w-24" />
                                      </TableCell>
                                  </TableRow>
                              ))
                            : bookings.map((booking: any) => (
                                  <TableRow key={booking._id}>
                                      <TableCell>{booking._id}</TableCell>
                                      <TableCell>
                                          {format(
                                              new Date(booking.bookingTime),
                                              'dd/MM/yyyy HH:mm',
                                              { locale: vi }
                                          )}
                                      </TableCell>
                                      <TableCell>
                                          {formatStatus(booking.status)}
                                      </TableCell>
                                      <TableCell>
                                          {formatPayment(booking.paymentStatus)}
                                      </TableCell>
                                      <TableCell className="text-orange-600 font-semibold">
                                          {booking.totalPrice.toLocaleString(
                                              'vi-VN'
                                          )}
                                          ₫
                                      </TableCell>
                                      <TableCell className="text-right">
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button
                                                      variant="outline"
                                                      size="sm"
                                                  >
                                                      Cập nhật
                                                  </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                  {[
                                                      'pending',
                                                      'confirmed',
                                                      'cancelled',
                                                  ].map((target) => (
                                                      <DropdownMenuItem
                                                          key={target}
                                                          disabled={
                                                              booking.status ===
                                                                  target ||
                                                              [
                                                                  'confirmed',
                                                                  'cancelled',
                                                              ].includes(
                                                                  booking.status
                                                              )
                                                          }
                                                          className="cursor-pointer"
                                                          onClick={() =>
                                                              handleStatusUpdate(
                                                                  booking,
                                                                  target
                                                              )
                                                          }
                                                      >
                                                          {target ===
                                                          'confirmed'
                                                              ? 'Xác nhận'
                                                              : target ===
                                                                'cancelled'
                                                              ? 'Huỷ'
                                                              : 'Chờ xử lý'}
                                                      </DropdownMenuItem>
                                                  ))}
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                      </TableCell>
                                  </TableRow>
                              ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-center mt-6">
                {isLoading ? (
                    <Skeleton className="h-8 w-[200px]" />
                ) : !isLoading &&
                  pagination?.totalPages &&
                  pagination.totalPages > 1 ? (
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
                            {Array.from({ length: pagination.totalPages }).map(
                                (_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={page === i + 1}
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
                                        !pagination?.hasNextPage
                                            ? 'pointer-events-none opacity-50'
                                            : ''
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
