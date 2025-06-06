'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const goId = searchParams.get('goId');
    const returnId = searchParams.get('returnId');
    const passengerCount = parseInt(
        searchParams.get('passengerCount') || '1',
        10
    );
    const seatClassGo = searchParams.get('seatClassGo');
    const seatClassReturn = searchParams.get('seatClassReturn');
    const finalPriceParam = searchParams.get('finalPrice');

    const finalPrice = finalPriceParam ? parseInt(finalPriceParam, 10) : 0;

    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (!goId || finalPrice <= 0) {
            router.push('/flights');
        }
    }, [goId, finalPrice, router]);

    const handleConfirmPayment = () => {
        if (!selectedMethod) {
            setShowAlert(true);
            return;
        }

        setShowAlert(false);

        const query = new URLSearchParams();
        query.set('goId', goId || '');
        if (returnId) query.set('returnId', returnId);
        query.set('passengerCount', passengerCount.toString());
        if (seatClassGo) query.set('seatClassGo', seatClassGo);
        if (seatClassReturn) query.set('seatClassReturn', seatClassReturn);
        query.set('finalPrice', finalPrice.toString());
        query.set('method', selectedMethod);

        router.push(`/payment/confirm?${query.toString()}`);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-6 space-y-6">
            <h2 className="text-xl font-semibold">Xác nhận thanh toán</h2>

            <div className="border rounded-lg p-4">
                <p className="text-muted-foreground text-sm mb-1">
                    Giá cuối cùng
                </p>
                <p className="text-2xl font-bold text-orange-500">
                    {finalPrice.toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    (Áp dụng cho {passengerCount} hành khách)
                </p>
            </div>

            <div>
                <h3 className="font-semibold text-lg mb-3">
                    Phương thức thanh toán
                </h3>
                <RadioGroup
                    value={selectedMethod}
                    onValueChange={setSelectedMethod}
                    className="space-y-3"
                >
                    <Card
                        className={`cursor-pointer ${
                            selectedMethod === 'momo' ? 'border-orange-500' : ''
                        }`}
                        onClick={() => setSelectedMethod('momo')}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <RadioGroupItem value="momo" id="momo" />
                                Thanh toán qua MoMo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-500">
                            Hỗ trợ ví MoMo và thanh toán QR Code tiện lợi.
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer ${
                            selectedMethod === 'bank' ? 'border-orange-500' : ''
                        } `}
                        // onClick={() => setSelectedMethod('bank')}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="bank"
                                    id="bank"
                                    disabled
                                />
                                Chuyển khoản ngân hàng (Tạm dừng)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-500">
                            Hỗ trợ thanh toán qua Internet Banking và ATM.
                        </CardContent>
                    </Card>
                </RadioGroup>
            </div>

            {showAlert && (
                <Alert variant="destructive">
                    <AlertTitle className="text-lg">Thông báo!</AlertTitle>
                    <AlertDescription className="text-base">
                        Vui lòng chọn phương thức thanh toán trước khi tiếp tục.
                    </AlertDescription>
                </Alert>
            )}

            <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleConfirmPayment}
            >
                Xác nhận thanh toán
            </Button>
        </div>
    );
}
