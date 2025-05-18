// File: src/app/manage/bookings/create/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    CreateBookingSchema,
    CreateBookingTypeBody,
} from '@/schemaValidations/bookings.schema';
import { useCreateBookingMutation } from '@/queries/useBooking';
import { useFlights } from '@/queries/useFlight';
import { useGetGuestList } from '@/queries/useAccount';
import { AircraftClass } from '@/constants/aircrafts';

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

export default function CreateBookingPage() {
    const router = useRouter();
    const form = useForm<CreateBookingTypeBody>({
        resolver: zodResolver(CreateBookingSchema.body),
        defaultValues: {
            userId: '',
            flightId: '',
            seatClass: AircraftClass.Economy,
            quantity: 1,
            totalPrice: 0,
        },
    });

    const createMutation = useCreateBookingMutation();
    const { data: flights } = useFlights({
        limit: 100,
        page: 1,
        order: 'asc',
        sortBy: 'price',
    });
    const { data: users } = useGetGuestList({
        limit: 100,
        page: 1,
        order: 'asc',
        sortBy: 'createdAt',
    });

    const onSubmit = (values: CreateBookingTypeBody) => {
        createMutation.mutate(values, {
            onSuccess: () => {
                toast.success('Tạo đặt chỗ thành công');
                router.push('/manage/bookings');
            },
            onError: () => {
                toast.error('Tạo thất bại');
            },
        });
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
                </Button>
                <h1 className="text-2xl font-bold">Tạo đặt chỗ</h1>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        name="userId"
                        control={form.control}
                        render={() => (
                            <FormSelectField
                                name="userId"
                                label="Người dùng"
                                placeholder="Chọn người dùng"
                                control={form.control}
                                options={
                                    users?.payload?.metadata?.users?.map(
                                        (u) => ({
                                            label: u.username,
                                            value: u._id,
                                        })
                                    ) ?? []
                                }
                            />
                        )}
                    />

                    <FormField
                        name="flightId"
                        control={form.control}
                        render={() => (
                            <FormSelectField
                                name="flightId"
                                label="Chuyến bay"
                                placeholder="Chọn chuyến bay"
                                control={form.control}
                                options={
                                    flights?.payload?.metadata?.flights?.map(
                                        (f) => ({
                                            label: f.flightNumber,
                                            value: f._id,
                                        })
                                    ) ?? []
                                }
                            />
                        )}
                    />

                    <FormField
                        name="seatClass"
                        control={form.control}
                        render={() => (
                            <FormSelectField
                                name="seatClass"
                                label="Hạng ghế"
                                placeholder="Chọn hạng"
                                control={form.control}
                                options={Object.values(AircraftClass).map(
                                    (cls) => ({
                                        label: cls,
                                        value: cls,
                                    })
                                )}
                            />
                        )}
                    />

                    <FormField
                        name="quantity"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số lượng vé</FormLabel>
                                <FormControl>
                                    <Input type="number" min={1} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="totalPrice"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tổng tiền (VNĐ)</FormLabel>
                                <FormControl>
                                    <Input type="number" min={0} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="w-full"
                    >
                        {createMutation.isPending && (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        )}
                        Tạo đặt chỗ
                    </Button>
                </form>
            </Form>
        </div>
    );
}
