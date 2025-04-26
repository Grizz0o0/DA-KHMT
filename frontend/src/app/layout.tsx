import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import Footer from '@/components/footer';

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
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased',
                    roboto.className
                )}
            >
                <Header />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    );
}
