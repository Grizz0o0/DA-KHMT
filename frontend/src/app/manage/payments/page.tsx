// File: src/app/manage/payments/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
    usePayments,
    useUpdatePaymentStatusMutation,
} from '@/queries/usePayment';
import { toast } from 'sonner';
import { PaymentStatus } from '@/constants/payments';

const statusText = (status: string) =>
    status === 'success'
        ? 'Thành công'
        : status === 'pending'
        ? 'Đang xử lý'
        : 'Thất bại';

export default function ManagePaymentsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = usePayments({ page, limit });
    const updateStatusMutation = useUpdatePaymentStatusMutation();
    const payments = data?.payload?.metadata.payments || [];
    const pagination = data?.payload?.metadata?.pagination;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="relative flex items-center justify-center mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/manage')}
                    className="absolute left-0 flex items-center text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                    ← Quay lại
                </Button>
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Quản lý thanh toán
                </h1>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
                {isLoading ? (
                    <Skeleton className="h-4 w-64" />
                ) : (
                    <>
                        Tổng: {pagination?.totalItems} giao dịch | Trang{' '}
                        {pagination?.page} / {pagination?.totalPages}
                    </>
                )}
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã giao dịch</TableHead>
                            <TableHead>Booking</TableHead>
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Số tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Phương thức</TableHead>
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
                                          <Skeleton className="h-4 w-20" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-32" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-24" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-20" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-24" />
                                      </TableCell>
                                      <TableCell className="text-right">
                                          <Skeleton className="h-8 w-24" />
                                      </TableCell>
                                  </TableRow>
                              ))
                            : payments.map((payment: any) => (
                                  <TableRow key={payment._id}>
                                      <TableCell>{payment.orderId}</TableCell>
                                      <TableCell>{payment.bookingId}</TableCell>
                                      <TableCell>{payment.userId}</TableCell>
                                      <TableCell className="text-orange-600 font-semibold">
                                          {`${payment.amount.toLocaleString(
                                              'vi-VN'
                                          )}₫`}
                                      </TableCell>
                                      <TableCell>
                                          <span
                                              className={
                                                  payment.status === 'success'
                                                      ? 'text-green-600 font-medium'
                                                      : payment.status ===
                                                        'failed'
                                                      ? 'text-red-500 font-medium'
                                                      : 'text-yellow-500 font-medium'
                                              }
                                          >
                                              {statusText(payment.status)}
                                          </span>
                                      </TableCell>
                                      <TableCell>
                                          {payment.paymentMethod.toUpperCase()}
                                      </TableCell>
                                      <TableCell className="text-right">
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button
                                                      variant="outline"
                                                      size="sm"
                                                  >
                                                      Đổi trạng thái
                                                  </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                  {[
                                                      'success',
                                                      'pending',
                                                      'failed',
                                                  ].map((target) => (
                                                      <DropdownMenuItem
                                                          key={target}
                                                          disabled={
                                                              payment.status ===
                                                              target
                                                          }
                                                          className="cursor-pointer"
                                                          onClick={() =>
                                                              updateStatusMutation.mutate(
                                                                  {
                                                                      paymentId:
                                                                          payment._id,
                                                                      body: {
                                                                          status: target as PaymentStatus,
                                                                      },
                                                                  },
                                                                  {
                                                                      onSuccess:
                                                                          () =>
                                                                              toast.success(
                                                                                  `Cập nhật thành ${statusText(
                                                                                      target
                                                                                  )}`
                                                                              ),
                                                                      onError:
                                                                          () =>
                                                                              toast.error(
                                                                                  'Lỗi cập nhật trạng thái'
                                                                              ),
                                                                  }
                                                              )
                                                          }
                                                      >
                                                          {statusText(target)}
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
