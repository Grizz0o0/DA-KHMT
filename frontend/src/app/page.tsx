import FlightList from '@/components/FlightList';
import SearchFlightsForm from '@/components/SearchFlightsForm';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export default function HomePage() {
    return (
        <main className="min-h-screen">
            {/* Banner */}
            <div className="bg-blue-500 text-white text-center py-12 md:py-20 h-[40vh] md:h-[50vh] flex flex-col justify-center px-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    Tìm Chuyến Bay Hoàn Hảo
                </h1>
                <p className="text-base md:text-lg max-w-xl mx-auto">
                    Đặt vé máy bay đến các điểm đến trên khắp Việt Nam và Châu Á
                    với giá tốt nhất.
                </p>
            </div>

            {/* Search Form */}
            <div className="relative bg-white h-[60vh] md:h-[50vh]">
                <div className="absolute inset-x-0 -top-16 md:-top-20 px-4">
                    <SearchFlightsForm />
                </div>
            </div>

            {/* Why Us */}
            <section className="py-16 bg-gray-100 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                    Vì Sao Chọn Chúng Tôi?
                </h2>
                <div className="flex flex-wrap justify-center gap-8">
                    <div className="max-w-xs">
                        <h3 className="text-xl font-semibold mb-2">
                            Giá Tốt Nhất
                        </h3>
                        <p>
                            So sánh giá vé và tìm giá tốt nhất trên thị trường.
                        </p>
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-xl font-semibold mb-2">
                            Hỗ Trợ 24/7
                        </h3>
                        <p>
                            Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn mọi lúc mọi
                            nơi.
                        </p>
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-xl font-semibold mb-2">
                            Đa Dạng Điểm Đến
                        </h3>
                        <p>Khám phá hơn 50 điểm đến khắp Việt Nam và Châu Á.</p>
                    </div>
                </div>
            </section>

            {/* Flight List */}
            <section className="py-12 bg-white px-4 md:px-8 lg:px-16">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
                    Danh Sách Chuyến Bay
                </h2>
                <FlightList />
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-r from-airline-blue to-airline-orange py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Sẵn Sàng Cho Chuyến Đi Tiếp Theo?
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                        Đăng ký nhận thông tin về các ưu đãi đặc biệt và cập
                        nhật mới nhất từ Fly24h
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                            className="px-4 py-3 rounded-lg flex-1 w-full sm:w-auto"
                        />
                        <Button className="bg-white text-airline-blue hover:bg-gray-100 px-8 py-3 w-full sm:w-auto">
                            <Heart className="h-4 w-4 mr-2" />
                            Đăng Ký
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}
