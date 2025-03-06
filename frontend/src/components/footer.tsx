import Image from 'next/image';
import Link from 'next/link';

function Footer() {
    return (
        <div className="flex pt-14 pb-4 w-full overflow-x-hidden overflow-y-hidden bg-gray-800">
            <div className="flex items-center space-x-4 w-[1222] min-h-14 mb-[100] p-4 mx-auto">
                <div className="w-1/3 mb-auto mt-[-40] ">
                    <div className="">
                        <Link className="min-w-[278] px-3 " href="/">
                            <Image
                                alt="logo"
                                src={
                                    'https://d1785e74lyxkqq.cloudfront.net/_next/static/v2_2/a/ad89f39fe62c8b500e6f9a25fa4427d8.svg'
                                }
                                width={200}
                                height={90}
                            />
                        </Link>
                    </div>
                    <div className="">
                        <ul className="text-gray-400 text-sm font-medium">
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                Điện thoại: 08 1919 8989
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                Email: contact@fullstack.edu.vn
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                Địa chỉ: Số 1, ngõ 41, Trần Duy Hưng, Cầu Giấy,
                                Hà Nội
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="flex w-2/3 px-3">
                    <div className="flex flex-col w-1/3 px-3">
                        <div className="mb-8">
                            <div className="mb-3">
                                <h3 className="text-white text-base font-bold leading-5">
                                    Về Traveloka
                                </h3>
                            </div>
                            <ul className="text-gray-400 text-sm font-medium">
                                <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                    <Link href="/activities">Cách đặt chỗ</Link>
                                </li>
                                <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                    <Link href="/activities">
                                        Liên hệ chúng tôi
                                    </Link>
                                </li>
                                <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                    <Link href="/activities">Trợ giúp</Link>
                                </li>
                                <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                    <Link href="/activities">Tuyển dụng</Link>
                                </li>
                                <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                    <Link href="/activities">Về chúng tôi</Link>
                                </li>
                            </ul>
                        </div>
                        <div className="mb-8">
                            <div className="mb-3">
                                <h3 className="text-white text-base font-bold leading-5">
                                    Theo dõi chúng tôi trên
                                </h3>
                            </div>
                            <ul className="text-gray-400 text-sm font-medium">
                                <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                    <Link href="/activities">Facebook</Link>
                                </li>
                                <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                    <Link href="/activities">Instagram</Link>
                                </li>
                                <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                    <Link href="/activities">TikTok</Link>
                                </li>
                                <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                    <Link href="/activities">Youtube</Link>
                                </li>
                                <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                    <Link href="/activities">Telegram</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/3 px-3">
                        <div className="mb-3">
                            <h3 className="text-white text-base font-bold leading-5">
                                Sản phẩm
                            </h3>
                        </div>
                        <ul className="text-gray-400 text-sm font-medium">
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">Khách sạn</Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">Vé máy bay</Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">Vé xe khách</Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">Đưa đón sân bay</Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">Cho thuê xe</Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">
                                    Hoạt động & Vui chơi
                                </Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">Du thuyền</Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">Biệt thự</Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">Căn hộ</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="flex flex-col w-1/3 px-3">
                        <div className="mb-3">
                            <h3 className="text-white text-base font-bold leading-5">
                                Khác
                            </h3>
                        </div>
                        <ul className="text-gray-400 text-sm font-medium">
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">
                                    Traveloka Affiliate
                                </Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">Traveloka Blog</Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">
                                    Chính Sách Quyền Riêng
                                </Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">
                                    Đăng ký nơi nghỉ của bạn
                                </Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">
                                    Đăng ký doanh nghiệp hoạt động du lịch của
                                    bạn
                                </Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">Khu vực báo chí</Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">
                                    Quy chế hoạt động
                                </Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">
                                    Vulnerability Disclosure Program
                                </Link>
                            </li>
                            <li className="mb-3 cursor-pointer hover:underline hover:text-white">
                                <Link href="/activities">
                                    APAC Travel Insights
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
