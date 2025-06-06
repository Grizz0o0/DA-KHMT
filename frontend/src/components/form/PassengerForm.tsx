'use client';

import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { PassengerFormType } from '@/schemaValidations/tickets.schema';
import PassengerItemForm from './PassengerItemForm';
import { UserGender } from '@/constants/users';

type PassengerFormProps = {
    totalPassengers: number;
};

export default function PassengerForm({ totalPassengers }: PassengerFormProps) {
    const { control } = useFormContext<PassengerFormType>();
    const { fields, replace } = useFieldArray({
        control,
        name: 'passengers',
    });

    // Tự động thêm dòng hành khách khi chưa đủ
    useEffect(() => {
        const passengers = Array.from({ length: totalPassengers }).map(() => ({
            name: '',
            email: '',
            phone: '',
            gender: UserGender.Male,
            dateOfBirth: '',
            nationality: '',
            passportNumber: '',
            idNumber: '',
        }));
        replace(passengers);
    }, [totalPassengers, replace]);

    return (
        <div className="space-y-6">
            {fields.map((field, index) => (
                <PassengerItemForm key={field.id} index={index} />
            ))}
        </div>
    );
}
