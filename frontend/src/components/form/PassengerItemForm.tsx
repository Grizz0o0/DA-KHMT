'use client';

import { useFormContext } from 'react-hook-form';
import { PassengerFormType } from '@/schemaValidations/tickets.schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { UserGender } from '@/constants/users';

type Props = { index: number };

const genderMap: { [key: string]: UserGender } = {
    male: UserGender.Male,
    female: UserGender.Female,
    other: UserGender.Other,
};

export default function PassengerItemForm({ index }: Props) {
    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext<PassengerFormType>();

    const dobValue = watch(`passengers.${index}.dateOfBirth`);
    const dobDate = dobValue ? new Date(dobValue) : undefined;
    const gender = watch(`passengers.${index}.gender`);

    const renderError = (field: keyof PassengerFormType['passengers'][0]) =>
        errors.passengers?.[index]?.[field]?.message && (
            <p className="text-xs text-red-500 mt-1">
                {errors.passengers[index][field]?.message}
            </p>
        );

    return (
        <div className="p-4 border rounded-xl bg-white space-y-4">
            <h3 className="font-semibold text-blue-600">
                Hành khách {index + 1}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Họ và tên</Label>
                    <Input {...register(`passengers.${index}.name`)} />
                    {renderError('name')}
                </div>
                <div>
                    <Label>Email</Label>
                    <Input {...register(`passengers.${index}.email`)} />
                    {renderError('email')}
                </div>
                <div>
                    <Label>Số điện thoại</Label>
                    <Input
                        {...register(`passengers.${index}.phone`)}
                        inputMode="numeric"
                    />
                    {renderError('phone')}
                </div>
                <div>
                    <Label>Giới tính</Label>
                    <Select
                        value={gender}
                        onValueChange={(val) =>
                            setValue(
                                `passengers.${index}.gender`,
                                genderMap[val]
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Nam</SelectItem>
                            <SelectItem value="female">Nữ</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                    </Select>
                    {renderError('gender')}
                </div>
                <div className="space-y-1">
                    <Label>Ngày sinh</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-sm"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dobDate
                                    ? format(dobDate, 'dd/MM/yyyy')
                                    : 'Chọn ngày'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={dobDate}
                                onSelect={(date) =>
                                    setValue(
                                        `passengers.${index}.dateOfBirth`,
                                        date?.toISOString() || ''
                                    )
                                }
                                locale={vi}
                                disabled={(date) => date > new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                    {renderError('dateOfBirth')}
                </div>
                <div>
                    <Label>Quốc tịch</Label>
                    <Input {...register(`passengers.${index}.nationality`)} />
                    {renderError('nationality')}
                </div>
                <div>
                    <Label>Số hộ chiếu</Label>
                    <Input
                        {...register(`passengers.${index}.passportNumber`)}
                    />
                    {renderError('passportNumber')}
                </div>
                <div>
                    <Label>Số CMND/CCCD</Label>
                    <Input {...register(`passengers.${index}.idNumber`)} />
                    {renderError('idNumber')}
                </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
                Đối với hành khách là trẻ em hoặc trẻ sơ sinh, vui lòng nhập
                giấy tờ tùy thân của người giám hộ đi cùng trẻ. (Vui lòng đảm
                bảo chỉ nhập số trong trường này)
            </p>
        </div>
    );
}
