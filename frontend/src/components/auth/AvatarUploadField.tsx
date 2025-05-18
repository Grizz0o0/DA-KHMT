'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

type Props = {
    value: string; // URL hiện tại từ form
    onChange: (file: File | null) => void;
};

export default function AvatarUploadField({ value, onChange }: Props) {
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (localPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(localPreview);
            }
        };
    }, [localPreview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
            setLocalPreview(URL.createObjectURL(file));
        } else {
            onChange(null);
            setLocalPreview(null);
        }
    };

    return (
        <div>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {(localPreview || value) && (
                <Image
                    src={localPreview || value}
                    alt="Avatar Preview"
                    width={80}
                    height={80}
                    className="mt-2 rounded-full object-cover"
                />
            )}
        </div>
    );
}
