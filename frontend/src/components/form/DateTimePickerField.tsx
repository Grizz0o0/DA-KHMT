'use client';

import { CalendarIcon } from 'lucide-react';
import { format, setHours, setMinutes, getHours, getMinutes } from 'date-fns';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Props = {
    control: any;
    name: string;
    label: string;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
};

export function DateTimePickerField({
    control,
    name,
    label,
    minDate,
    maxDate,
    className,
}: Props) {
    const hours = Array.from({ length: 24 }, (_, i) => i); // 0–23
    const minutes = [0, 15, 30, 45];

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const isValidDate = (d: any): d is Date =>
                    d instanceof Date && !isNaN(d.getTime());

                const now = new Date();
                const current = isValidDate(field.value) ? field.value : now;

                const selectedHour = getHours(current);
                const selectedMinute = getMinutes(current);

                const handleDateChange = (date: Date | undefined) => {
                    if (!date) return;
                    const withTime = setHours(
                        setMinutes(date, selectedMinute),
                        selectedHour
                    );
                    field.onChange(withTime);
                };

                const handleHourChange = (val: string) => {
                    const updated = setHours(current, parseInt(val));
                    field.onChange(updated);
                };

                const handleMinuteChange = (val: string) => {
                    const updated = setMinutes(current, parseInt(val));
                    field.onChange(updated);
                };

                return (
                    <FormItem className={cn('space-y-2', className)}>
                        <FormLabel>{label}</FormLabel>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-[180px] pl-3 text-left font-normal',
                                                !field.value &&
                                                    'text-muted-foreground'
                                            )}
                                        >
                                            {isValidDate(field.value)
                                                ? format(
                                                      field.value,
                                                      'dd/MM/yyyy'
                                                  )
                                                : 'Chọn ngày'}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={
                                            isValidDate(field.value)
                                                ? field.value
                                                : undefined
                                        }
                                        onSelect={handleDateChange}
                                        initialFocus
                                        fromDate={minDate}
                                        toDate={maxDate}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Select
                                value={selectedHour.toString()}
                                onValueChange={handleHourChange}
                            >
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue>
                                        {selectedHour
                                            .toString()
                                            .padStart(2, '0')}
                                        h
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {hours.map((h) => (
                                        <SelectItem
                                            key={h}
                                            value={h.toString()}
                                        >
                                            {h.toString().padStart(2, '0')}h
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedMinute.toString()}
                                onValueChange={handleMinuteChange}
                            >
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue>
                                        {selectedMinute
                                            .toString()
                                            .padStart(2, '0')}
                                        p
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {minutes.map((m) => (
                                        <SelectItem
                                            key={m}
                                            value={m.toString()}
                                        >
                                            {m.toString().padStart(2, '0')}p
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
