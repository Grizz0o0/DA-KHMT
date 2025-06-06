'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

import { FormSelectField } from '@/components/form/FormSelectField';
import {
    CreateTicketFormType,
    CreateTicketSchemaWithoutUser,
} from '@/schemaValidations/tickets.schema';

import { useFlights } from '@/queries/useFlight';
import { useCreateTicketMutation } from '@/queries/useTicket';
import { TicketStatus } from '@/constants/tickets';
import { AircraftClass } from '@/constants/aircrafts';
import { UserGender } from '@/constants/users';

export default function CreateTicketPage() {
    const router = useRouter();

    const form = useForm<CreateTicketFormType>({
        resolver: zodResolver(CreateTicketSchemaWithoutUser),
        defaultValues: {
            bookingId: '',
            flightId: '',
            seatNumber: '',
            seatClass: AircraftClass.Economy,
            price: 0,
            status: TicketStatus.Unused,
            passenger: {
                name: '',
                email: '',
                phone: '',
                dateOfBirth: undefined,
                gender: UserGender.Other,
                nationality: '',
                passportNumber: '',
                idNumber: '',
            },
        },
    });

    const { data: flightData } = useFlights({ page: 1, limit: 100 });
    const { mutate: createTicket, isPending } = useCreateTicketMutation();

    const flights = flightData?.payload?.metadata.flights || [];

    const onSubmit = (data: CreateTicketFormType) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Không tìm thấy thông tin người dùng');
            return;
        }
        console.log({
            ...data,
            userId,
        });
        createTicket(
            {
                ...data,
                userId,
            },
            {
                onSuccess: () => {
                    toast.success('Tạo vé thành công');
                    router.push('/manage/tickets');
                },
                onError: (err) => {
                    console.error(err);
                    toast.error('Tạo vé thất bại');
                },
            }
        );
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Tạo vé mới</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit, (errors) => {
                                console.log('❌ Form không hợp lệ:', errors);
                            })}
                            className="space-y-6"
                        >
                            {/* CHUYẾN BAY */}
                            <FormSelectField
                                name="flightId"
                                control={form.control}
                                label="Chuyến bay"
                                placeholder="Chọn chuyến bay"
                                options={flights.map((f) => ({
                                    label: `${f.flightNumber} (${new Date(
                                        f.departureTime
                                    ).toLocaleDateString()})`,
                                    value: f._id,
                                }))}
                            />

                            {/* BOOKING ID */}
                            <FormField
                                control={form.control}
                                name="bookingId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mã Booking</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Booking ID"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* SỐ GHẾ + GIÁ */}
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

                            {/* HẠNG GHẾ */}
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

                            {/* TRẠNG THÁI */}
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

                            {/* THÔNG TIN HÀNH KHÁCH */}
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
                                                    type="email"
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
                                                <Input
                                                    type="date"
                                                    value={
                                                        field.value
                                                            ? format(
                                                                  field.value,
                                                                  'yyyy-MM-dd'
                                                              )
                                                            : ''
                                                    }
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                ? new Date(
                                                                      e.target.value
                                                                  )
                                                                : undefined
                                                        )
                                                    }
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
                                    name="passenger.gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giới tính</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="w-full border p-2 rounded-md"
                                                >
                                                    <option value="male">
                                                        Nam
                                                    </option>
                                                    <option value="female">
                                                        Nữ
                                                    </option>
                                                    <option value="other">
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
                                                    placeholder="P1234567"
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
                                    variant="outline"
                                    type="button"
                                    className="cursor-pointer"
                                    onClick={() => router.back()}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    Tạo vé
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
