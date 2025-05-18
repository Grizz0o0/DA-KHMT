'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog';

import { useTickets, useDeleteTicketMutation } from '@/queries/useTicket';
import { handleErrorClient } from '@/lib/utils';
import { useFlights } from '@/queries/useFlight';

export default function ManageTicketsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = useTickets({ page, limit, order: 'asc' });
    const { data: flightData } = useFlights();

    const { mutate: deleteTicket } = useDeleteTicketMutation();

    const flights = flightData?.payload?.metadata.flights || [];
    const tickets = data?.payload.metadata.tickets || [];
    const pagination = data?.payload.metadata.pagination;

    const handleDelete = (ticketId: string) => {
        deleteTicket(ticketId, {
            onSuccess: () => toast.success('Xóa vé thành công'),
            onError: (err: any) => handleErrorClient(err),
        });
    };

    const getAirlineNameById = (id: string) => {
        return flights.find((a) => a._id === id)?.flightNumber ?? 'Không rõ';
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/manage')}
                        className="px-2 text-sm"
                    >
                        ← Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold">Quản lý vé</h1>
                </div>

                <Button onClick={() => router.push('/manage/tickets/create')}>
                    + Tạo vé mới
                </Button>
            </div>

            {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
            ) : (
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã vé</TableHead>
                                <TableHead>Hạng vé</TableHead>
                                <TableHead>Hành khách</TableHead>
                                <TableHead>Số ghế</TableHead>
                                <TableHead>Chuyến bay</TableHead>
                                <TableHead>Giá</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead>Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.map((ticket: any) => (
                                <TableRow key={ticket._id}>
                                    <TableCell>
                                        {ticket._id.slice(-6).toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        {ticket.seatClass === 'economy'
                                            ? 'Phổ thông'
                                            : ticket.seatClass === 'business'
                                            ? 'Thương gia'
                                            : ticket.seatClass === 'first'
                                            ? 'Hạng nhất'
                                            : '--'}
                                    </TableCell>

                                    <TableCell>
                                        {ticket.passenger?.name || '--'}
                                    </TableCell>
                                    <TableCell>{ticket.seatNumber}</TableCell>
                                    <TableCell>
                                        {getAirlineNameById(ticket.flightId)}
                                    </TableCell>
                                    <TableCell>
                                        {ticket.price.toLocaleString()}đ
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`text-sm font-medium ${
                                                ticket.status === 'unused'
                                                    ? 'text-blue-600'
                                                    : ticket.status === 'used'
                                                    ? 'text-green-600'
                                                    : ticket.status ===
                                                      'cancelled'
                                                    ? 'text-red-500'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {ticket.createdAt
                                            ? format(
                                                  new Date(ticket.createdAt),
                                                  'dd/MM/yyyy HH:mm',
                                                  { locale: vi }
                                              )
                                            : '--'}
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.push(
                                                    `/manage/tickets/update/${ticket._id}`
                                                )
                                            }
                                        >
                                            Sửa
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    Xóa
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Bạn có chắc muốn xóa vé
                                                        này?
                                                    </AlertDialogTitle>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Hủy
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            handleDelete(
                                                                ticket._id
                                                            )
                                                        }
                                                    >
                                                        Xóa
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() =>
                                setPage((prev) => Math.max(prev - 1, 1))
                            }
                        />
                    </PaginationItem>
                    {[...Array(pagination?.totalPages || 1)].map((_, i) => (
                        <PaginationItem key={i}>
                            <PaginationLink
                                isActive={page === i + 1}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                setPage((prev) =>
                                    prev < (pagination?.totalPages || 1)
                                        ? prev + 1
                                        : prev
                                )
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
