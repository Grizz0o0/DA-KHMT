'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { FormSelectField } from '@/components/form/FormSelectField';

import {
    UpdateTicketTypeBody,
    UpdateTicketSchema,
} from '@/schemaValidations/tickets.schema';
import { useTicketDetail, useUpdateTicketMutation } from '@/queries/useTicket';
import { TicketStatus } from '@/constants/tickets';
import { AircraftClass } from '@/constants/aircrafts';
import { UserGender } from '@/constants/users';

export default function UpdateTicketPage() {
    const { id: ticketId } = useParams();
    const router = useRouter();
    const form = useForm<UpdateTicketTypeBody>({
        resolver: zodResolver(UpdateTicketSchema),
        defaultValues: {
            seatNumber: '',
            price: 0,
            status: TicketStatus.Unused,
            seatClass: AircraftClass.Economy,
            passenger: {
                name: '',
                email: '',
                phone: '',
                dateOfBirth: '',
                gender: UserGender.Other,
                nationality: '',
                passportNumber: '',
                idNumber: '',
            },
        },
    });

    const { data: ticketDetail, isLoading } = useTicketDetail(
        ticketId as string
    );
    const updateMutation = useUpdateTicketMutation();

    useEffect(() => {
        const ticket = ticketDetail?.payload?.metadata?.ticket;
        if (ticket) {
            form.reset({
                ...ticket,
                seatNumber: ticket.seatNumber,
                price: ticket.price,
                status: ticket.status as TicketStatus,
                seatClass: ticket.seatClass as AircraftClass,
                passenger: {
                    name: ticket.passenger?.name || '',
                    email: ticket.passenger?.email || '',
                    phone: ticket.passenger?.phone || '',
                    dateOfBirth:
                        ticket.passenger?.dateOfBirth?.slice(0, 10) || '',
                    gender: ticket.passenger?.gender || UserGender.Other,
                    nationality: ticket.passenger?.nationality || '',
                    passportNumber: ticket.passenger?.passportNumber || '',
                    idNumber: ticket.passenger?.idNumber || '',
                },
            });
        }
    }, [ticketDetail, form.reset]);
    const onSubmit = (data: UpdateTicketTypeBody) => {
        updateMutation.mutate(
            {
                ticketId: ticketId as string,
                body: data,
            },
            {
                onSuccess: () => {
                    toast.success('Cập nhật vé thành công');
                    router.push('/manage/tickets');
                },
                onError: (err) => {
                    toast.error('Cập nhật thất bại');
                    console.error(err);
                },
            }
        );
    };

    if (isLoading || !ticketDetail) {
        return <Skeleton className="h-[400px] w-full" />;
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Cập nhật vé</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Số ghế + Giá */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="seatNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số ghế</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="A1"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá vé</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Trạng thái */}
                            <FormSelectField
                                name="status"
                                control={form.control}
                                label="Trạng thái"
                                options={[
                                    {
                                        label: 'Chưa dùng',
                                        value: TicketStatus.Unused,
                                    },
                                    {
                                        label: 'Đã dùng',
                                        value: TicketStatus.Used,
                                    },
                                    {
                                        label: 'Đã hủy',
                                        value: TicketStatus.Cancelled,
                                    },
                                ]}
                            />

                            {/* Loại ghế */}
                            <FormSelectField
                                name="seatClass"
                                control={form.control}
                                label="Hạng ghế"
                                options={[
                                    {
                                        label: 'Phổ thông',
                                        value: AircraftClass.Economy,
                                    },
                                    {
                                        label: 'Thương gia',
                                        value: AircraftClass.Business,
                                    },
                                    {
                                        label: 'Hạng nhất',
                                        value: AircraftClass.FirstClass,
                                    },
                                ]}
                            />

                            {/* Hành khách */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="passenger.name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Họ tên</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Nguyễn Văn A"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="passenger.email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="email@example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="passenger.phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Điện thoại</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="0123456789"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="passenger.dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ngày sinh</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="passenger.gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giới tính</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="w-full border p-2 rounded-md"
                                                >
                                                    <option
                                                        value={UserGender.Male}
                                                    >
                                                        Nam
                                                    </option>
                                                    <option
                                                        value={
                                                            UserGender.Female
                                                        }
                                                    >
                                                        Nữ
                                                    </option>
                                                    <option
                                                        value={UserGender.Other}
                                                    >
                                                        Khác
                                                    </option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="passenger.nationality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quốc tịch</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Việt Nam"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="passenger.passportNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số hộ chiếu</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="P123456"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="passenger.idNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số CCCD</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="0123456789"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.replace('/manage/tickets')
                                    }
                                >
                                    Quay lại
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                >
                                    Cập nhật
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
