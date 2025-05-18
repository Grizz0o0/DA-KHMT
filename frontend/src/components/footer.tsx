import { Plane } from 'lucide-react';
import Link from 'next/link';

function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Plane className="h-6 w-6 text-white" />
                            <span className="font-bold text-xl">Fly24h</span>
                        </Link>
                        <p className="text-gray-400">
                            Đặt vé máy bay đến các điểm đến trên khắp Việt Nam
                            và Châu Á với giá tốt nhất.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Công Ty</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Về Chúng Tôi
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/careers"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Tuyển Dụng
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/news"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Tin Tức
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/partners"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Đối Tác
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Hỗ Trợ</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/help"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Trung Tâm Hỗ Trợ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Liên Hệ Chúng Tôi
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Câu Hỏi Thường Gặp
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/booking-policy"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Chính Sách Đặt Vé
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Pháp Lý</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Điều Khoản & Điều Kiện
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Chính Sách Bảo Mật
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cookies"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Chính Sách Cookie
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6 mt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} Fly24h. Đã đăng ký
                            bản quyền.
                        </p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <a
                                href="https://www.facebook.com/"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Facebook
                            </a>
                            <a
                                href="https://www.instagram.com/"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Instagram
                            </a>
                            <a
                                href="https://x.com/?lang=vi"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                X
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
