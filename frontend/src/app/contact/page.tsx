'use client';

import React, { FormEvent } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, MapPin, Phone } from 'lucide-react';

const ContactPage = () => {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.message(
            'Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi sớm nhất có thể.'
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-center mb-8 text-airline-blue">
                    Liên Hệ
                </h1>

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <ContactInfo
                            icon={
                                <MapPin className="h-6 w-6 text-airline-blue" />
                            }
                            title="Địa Chỉ"
                            content="123 Đường ABC, Huyện ABC, TP.Hà Nội"
                        />
                        <ContactInfo
                            icon={
                                <Phone className="h-6 w-6 text-airline-blue" />
                            }
                            title="Điện Thoại"
                            content="1900 1234"
                        />
                        <ContactInfo
                            icon={
                                <Mail className="h-6 w-6 text-airline-blue" />
                            }
                            title="Email"
                            content="support@fly24h.com"
                        />
                    </div>

                    {/* Contact Form */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-semibold mb-6">
                                Gửi Tin Nhắn
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <FormField
                                    id="name"
                                    label="Họ và tên"
                                    placeholder="Nhập họ và tên của bạn"
                                    required
                                />
                                <FormField
                                    id="email"
                                    label="Email"
                                    type="email"
                                    placeholder="email@example.com"
                                    required
                                />
                                <div>
                                    <Label htmlFor="message">Tin nhắn</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Nhập nội dung tin nhắn"
                                        className="min-h-[120px]"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-airline-blue bg-blue-700 hover:bg-blue-800 cursor-pointer"
                                >
                                    Gửi Tin Nhắn
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const ContactInfo = ({
    icon,
    title,
    content,
}: {
    icon: React.ReactNode;
    title: string;
    content: string;
}) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex items-start space-x-4">
                {icon}
                <div>
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p className="text-gray-600">{content}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

const FormField = ({
    id,
    label,
    placeholder,
    type = 'text',
    required = false,
}: {
    id: string;
    label: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
}) => (
    <div>
        <Label htmlFor={id}>{label}</Label>
        <Input
            id={id}
            placeholder={placeholder}
            type={type}
            required={required}
        />
    </div>
);

export default ContactPage;
