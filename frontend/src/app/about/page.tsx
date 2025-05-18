// src/app/about/page.tsx

import React from 'react';

const AboutPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6 text-primary">
                Về Chúng Tôi
            </h1>

            <section className="mb-8">
                <p className="text-gray-700 leading-relaxed mb-4">
                    Chúng tôi là nền tảng đặt vé máy bay trực tuyến được phát
                    triển nhằm đơn giản hóa trải nghiệm di chuyển của người dùng
                    Việt Nam trong kỷ nguyên số.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    Với giao diện thân thiện, tốc độ tìm kiếm nhanh, cùng khả
                    năng so sánh giá minh bạch giữa nhiều hãng hàng không, hệ
                    thống giúp người dùng dễ dàng tìm được chuyến bay phù hợp
                    nhất với nhu cầu và ngân sách.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                    Sứ Mệnh & Tầm Nhìn
                </h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                    💡 <strong>Sứ mệnh:</strong> Tạo ra một nền tảng đặt vé
                    thông minh, thuận tiện và đáng tin cậy dành cho mọi người
                    dùng, từ khách du lịch cho đến doanh nhân.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    🌍 <strong>Tầm nhìn:</strong> Trở thành ứng dụng đặt vé máy
                    bay hàng đầu tại Việt Nam và mở rộng sang thị trường Đông
                    Nam Á trong 5 năm tới.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Giá Trị Cốt Lõi</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                        <strong>Khách hàng là trung tâm:</strong> Chúng tôi cam
                        kết phục vụ với chất lượng tốt nhất.
                    </li>
                    <li>
                        <strong>Minh bạch:</strong> Giá vé và chi phí luôn rõ
                        ràng, không phụ thu ẩn.
                    </li>
                    <li>
                        <strong>Đổi mới:</strong> Không ngừng cải tiến tính năng
                        và trải nghiệm người dùng.
                    </li>
                    <li>
                        <strong>Bảo mật:</strong> Dữ liệu cá nhân và thanh toán
                        luôn được mã hóa và bảo vệ nghiêm ngặt.
                    </li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                    Công Nghệ Sử Dụng
                </h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                    Chúng tôi áp dụng các công nghệ hiện đại như:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>
                        ⛓ <strong>Frontend:</strong> Next.js, TailwindCSS,
                        Zustand
                    </li>
                    <li>
                        ⚙️ <strong>Backend:</strong> Express.js, Node.js,
                        MongoDB
                    </li>
                    <li>
                        🧪 <strong>Validation:</strong> Zod
                    </li>
                    <li>
                        🔐 <strong>Bảo mật:</strong> JWT, bcrypt, HTTPS
                    </li>
                    <li>
                        💳 <strong>Thanh toán:</strong> Tích hợp MoMo API
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Liên Hệ</h2>
                <p className="text-gray-700 leading-relaxed">
                    Nếu bạn có bất kỳ thắc mắc hoặc góp ý nào, vui lòng liên hệ
                    qua
                    <a href="/contact" className="text-blue-600 underline ml-1">
                        trang Liên Hệ
                    </a>
                    . Chúng tôi luôn sẵn sàng hỗ trợ bạn!
                </p>
            </section>
        </div>
    );
};

export default AboutPage;
