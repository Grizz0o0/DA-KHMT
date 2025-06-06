'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useDebounce } from '@/hooks/useDebounce';
import { useAirlines } from '@/queries/useAirline';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AirlineDetailType } from '@/schemaValidations/airlines.schema';

export function FlightFilterSidebar() {
    const router = useRouter();

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(20000000);
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
    const [minHour, setMinHour] = useState(0);
    const [maxHour, setMaxHour] = useState(23);

    const debouncedMin = useDebounce(minPrice, 300);
    const debouncedMax = useDebounce(maxPrice, 300);
    const debouncedMinHour = useDebounce(minHour, 300);
    const debouncedMaxHour = useDebounce(maxHour, 300);

    const { data: airlinesData } = useAirlines();
    const airlines = airlinesData?.payload?.metadata?.airlines || [];

    const resetFilters = () => {
        setMinPrice(0);
        setMaxPrice(20000000);
        setSelectedAirlines([]);
        setMinHour(0);
        setMaxHour(23);

        const params = new URLSearchParams(window.location.search);
        [
            'minPrice',
            'maxPrice',
            'airlineIds',
            'minHour',
            'maxHour',
            'page',
        ].forEach((key) => params.delete(key));
        router.push(`/flights?${params.toString()}`);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (debouncedMin !== 0) {
            params.set('minPrice', debouncedMin.toString());
        } else {
            params.delete('minPrice');
        }

        if (debouncedMax !== 20000000) {
            params.set('maxPrice', debouncedMax.toString());
        } else {
            params.delete('maxPrice');
        }

        if (selectedAirlines.length > 0) {
            params.set('airlineIds', selectedAirlines.join(','));
        } else {
            params.delete('airlineIds');
        }

        if (debouncedMinHour !== 0) {
            params.set('minHour', debouncedMinHour.toString());
        } else {
            params.delete('minHour');
        }

        if (debouncedMaxHour !== 23) {
            params.set('maxHour', debouncedMaxHour.toString());
        } else {
            params.delete('maxHour');
        }

        router.push(`/flights?${params.toString()}`);
    }, [
        debouncedMin,
        debouncedMax,
        selectedAirlines,
        debouncedMinHour,
        debouncedMaxHour,
        router,
    ]);

    const toggleAirline = (id: string) => {
        setSelectedAirlines((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    return (
        <aside className="space-y-4 select-none">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold select-none">Bộ lọc</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-blue-500 cursor-pointer"
                >
                    Đặt lại tất cả
                </Button>
            </div>

            {/* Khoảng giá */}
            <Card>
                <CardHeader>
                    <CardTitle>Khoảng giá vé</CardTitle>
                    <CardDescription>
                        Chọn mức giá bạn mong muốn
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Slider
                        min={0}
                        max={20000000}
                        step={500000}
                        value={[minPrice, maxPrice]}
                        onValueChange={([min, max]) => {
                            setMinPrice(min);
                            setMaxPrice(max);
                        }}
                        className="cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>{minPrice.toLocaleString('vi-VN')} ₫</span>
                        <span>{maxPrice.toLocaleString('vi-VN')} ₫</span>
                    </div>
                </CardContent>
            </Card>

            {/* Hãng hàng không */}
            <Card>
                <CardHeader>
                    <CardTitle>Hãng hàng không</CardTitle>
                    <CardDescription>Chọn hãng bạn muốn bay</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="select-all-airlines"
                            checked={
                                selectedAirlines.length === airlines.length &&
                                airlines.length > 0
                            }
                            className="cursor-pointer"
                            onCheckedChange={() => {
                                if (
                                    selectedAirlines.length === airlines.length
                                ) {
                                    setSelectedAirlines([]);
                                } else {
                                    setSelectedAirlines(
                                        airlines.map((a) => a._id)
                                    );
                                }
                            }}
                        />
                        <Label htmlFor="select-all-airlines">Chọn tất cả</Label>
                    </div>
                    {airlines.map((airline: AirlineDetailType) => (
                        <div
                            key={airline._id}
                            className="flex items-center space-x-2"
                        >
                            <Checkbox
                                id={airline._id}
                                checked={selectedAirlines.includes(airline._id)}
                                onCheckedChange={() =>
                                    toggleAirline(airline._id)
                                }
                                className="cursor-pointer"
                            />
                            <Label htmlFor={airline._id}>{airline.name}</Label>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Giờ bay */}
            <Card>
                <CardHeader>
                    <CardTitle>Giờ bay</CardTitle>
                    <CardDescription>
                        Khoảng giờ khởi hành mong muốn
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Slider
                        min={0}
                        max={23}
                        step={1}
                        value={[minHour, maxHour]}
                        onValueChange={([min, max]) => {
                            setMinHour(min);
                            setMaxHour(max);
                        }}
                        className="cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>{minHour}:00</span>
                        <span>{maxHour}:00</span>
                    </div>
                </CardContent>
            </Card>
        </aside>
    );
}
