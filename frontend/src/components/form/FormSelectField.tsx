// components/form/FormSelectField.tsx
'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';

type Option = {
    label: string;
    value: string;
};

interface Props {
    name: string;
    label: string;
    placeholder?: string;
    options: Option[];
    control: any;
    disabled?: boolean;
}

export function FormSelectField({
    name,
    label,
    placeholder,
    options,
    control,
    disabled,
}: Props) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={disabled}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={placeholder}
                                    defaultValue={field.value}
                                />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
