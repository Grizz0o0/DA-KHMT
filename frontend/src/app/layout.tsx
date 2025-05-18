import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppProvider from '@/components/AppProvider';
import TokenAutoRefresh from '@/components/auth/AutoRefreshToken';

const roboto = Roboto({
    subsets: ['vietnamese'],
    weight: ['100', '300', '400', '500', '700'],
});

export const metadata: Metadata = {
    title: 'Đặt vé máy bay giá rẻ - Fly24h',
    description: 'Đặt vé máy bay giá rẻ - Fly24h',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="min-h-screen">
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased flex flex-col',
                    roboto.className
                )}
            >
                <AppProvider>
                    <TokenAutoRefresh />
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                    <Toaster richColors position="top-right" />
                </AppProvider>
            </body>
        </html>
    );
}
