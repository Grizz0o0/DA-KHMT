'use client';

import Link from 'next/link';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    Plane,
    MapPin,
    Building,
    Tag,
    CreditCard,
    ArrowRight,
    ClipboardList,
    Ticket,
} from 'lucide-react';

const managementSections = [
    {
        title: 'Quản lý chuyến bay',
        href: '/manage/flights',
        icon: <Plane className="h-5 w-5" />,
        description: 'Thêm, sửa, xóa và quản lý các chuyến bay',
    },
    {
        title: 'Quản lý sân bay',
        href: '/manage/airports',
        icon: <MapPin className="h-5 w-5" />,
        description: 'Thêm, sửa và quản lý thông tin các sân bay',
    },
    {
        title: 'Quản lý hãng bay',
        href: '/manage/airlines',
        icon: <Building className="h-5 w-5" />,
        description: 'Quản lý thông tin về các hãng hàng không',
    },
    {
        title: 'Quản lý máy bay',
        href: '/manage/aircrafts',
        icon: <Plane className="h-5 w-5" />,
        description: 'Quản lý thông tin và trạng thái của máy bay',
    },
    {
        title: 'Quản lý mã khuyến mãi',
        href: '/manage/promocodes',
        icon: <Tag className="h-5 w-5" />,
        description: 'Tạo và quản lý các mã giảm giá, khuyến mãi',
    },
    {
        title: 'Quản lý thanh toán',
        href: '/manage/payments',
        icon: <CreditCard className="h-5 w-5" />,
        description: 'Theo dõi và quản lý các giao dịch thanh toán',
    },
    {
        title: 'Quản lý đặt chỗ',
        href: '/manage/bookings',
        icon: <ClipboardList className="h-5 w-5" />,
        description: 'Xem và quản lý các đặt chỗ của khách hàng',
    },
    {
        title: 'Quản lý vé',
        href: '/manage/tickets',
        icon: <Ticket className="h-5 w-5" />,
        description: 'Quản lý vé và trạng thái sử dụng',
    },
];

function ManagementGrid({ sections }: { sections: typeof managementSections }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {sections.map((section) => (
                <Link key={section.href} href={section.href}>
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary hover:-translate-y-1 overflow-hidden group">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    {section.icon}
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <CardTitle className="mt-4 text-xl">
                                {section.title}
                            </CardTitle>
                            <CardDescription>
                                {section.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-6">
                            <Button
                                variant="outline"
                                className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                            >
                                Truy cập
                            </Button>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

export default function Manage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <div className="container mx-auto py-8 px-4 flex-grow">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-bold">Quản Lý Hệ Thống</h1>
                    <p className="text-muted-foreground">
                        Quản lý tất cả các khía cạnh của hệ thống đặt vé máy bay
                    </p>
                    <Separator className="my-2" />
                </div>

                <Tabs defaultValue="all" className="mb-8">
                    <TabsList>
                        <TabsTrigger value="all">Tất cả</TabsTrigger>
                        <TabsTrigger value="flights">Chuyến bay</TabsTrigger>
                        <TabsTrigger value="airports">Sân bay</TabsTrigger>
                        <TabsTrigger value="airlines">Hãng bay</TabsTrigger>
                        <TabsTrigger value="bookings">Đặt chỗ</TabsTrigger>
                        <TabsTrigger value="tickets">Vé</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <ManagementGrid sections={managementSections} />
                    </TabsContent>

                    <TabsContent value="flights">
                        <ManagementGrid
                            sections={managementSections.filter((s) =>
                                s.title.toLowerCase().includes('chuyến bay')
                            )}
                        />
                    </TabsContent>

                    <TabsContent value="airports">
                        <ManagementGrid
                            sections={managementSections.filter((s) =>
                                s.title.toLowerCase().includes('sân bay')
                            )}
                        />
                    </TabsContent>

                    <TabsContent value="airlines">
                        <ManagementGrid
                            sections={managementSections.filter((s) =>
                                s.title.toLowerCase().includes('hãng bay')
                            )}
                        />
                    </TabsContent>

                    <TabsContent value="bookings">
                        <ManagementGrid
                            sections={managementSections.filter((s) =>
                                s.title.toLowerCase().includes('đặt chỗ')
                            )}
                        />
                    </TabsContent>

                    <TabsContent value="tickets">
                        <ManagementGrid
                            sections={managementSections.filter((s) =>
                                s.title.toLowerCase().includes('vé')
                            )}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
