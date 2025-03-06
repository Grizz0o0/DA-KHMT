import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

async function Header() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');
    const isLoggedIn = !!accessToken;

    return (
        <div className="flex justify-between items-center w-[1222] min-h-14 mx-auto py-1 px-4">
            <ul className="flex items-center space-x-4 font-bold text-gray-600 ">
                <li>
                    <Link href="/">
                        <Image
                            alt="logo"
                            src={
                                'https://d1785e74lyxkqq.cloudfront.net/_next/static/v2_2/9/97f3e7a54e9c6987283b78e016664776.svg'
                            }
                            width={135}
                            height={43}
                        />
                    </Link>
                </li>
                <li>
                    <Link href="/hotel">Khách sạn</Link>
                </li>
                <li>
                    <Link href="/flight">Vé máy bay</Link>
                </li>
                <li>
                    <Link href="/bus-and-shuttle">Vé xe khách</Link>
                </li>
                <li>
                    <Link href="/airport-transfer">Đưa đón xân bay</Link>
                </li>
                <li>
                    <Link href="/car-rental">Cho thuê xe</Link>
                </li>
                <li>
                    <Link href="/activities">Hoạt động&vui chơi</Link>
                </li>
            </ul>
            <div className="flex items-center space-x-4 ">
                <ul className="flex items-center space-x-4 font-bold text-gray-600">
                    {isLoggedIn ? (
                        <li>
                            <Link href="/logout">Đăng xuất</Link>
                        </li>
                    ) : (
                        <>
                            <li>
                                <Link href="/login">Đăng nhập</Link>
                            </li>
                            <li>
                                <Link href="/register">Đăng ký</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Header;
