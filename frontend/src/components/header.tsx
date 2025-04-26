import { Plane } from 'lucide-react';
import Link from 'next/link';
import AuthModal from './AuthModal';

async function Header() {
    return (
        <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Plane className="h-6 w-6 text-airline-blue" />
                    <span className="font-bold text-xl text-airline-blue">
                        Fly24h
                    </span>
                </Link>
                <nav className="hidden md:flex items-center space-x-6">
                    <Link
                        href="/"
                        className="text-gray-600 hover:text-airline-blue transition-colors"
                    >
                        Trang Chủ
                    </Link>
                    <Link
                        href="/flights"
                        className="text-gray-600 hover:text-airline-blue transition-colors"
                    >
                        Chuyến Bay
                    </Link>
                    <Link
                        href="/about"
                        className="text-gray-600 hover:text-airline-blue transition-colors"
                    >
                        Giới Thiệu
                    </Link>
                    <Link
                        href="/contact"
                        className="text-gray-600 hover:text-airline-blue transition-colors"
                    >
                        Liên Hệ
                    </Link>
                </nav>
                <AuthModal />
            </div>
        </header>
    );
}

export default Header;
