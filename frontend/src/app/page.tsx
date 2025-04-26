import SearchFlightsForm from '@/components/SearchFlightsForm';
export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Nền trên: màu xanh */}
            <div className="bg-blue-500 text-white text-center py-12 md:py-20 h-[40vh] md:h-[50vh] flex flex-col justify-center px-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    Tìm Chuyến Bay Hoàn Hảo
                </h1>
                <p className="text-base md:text-lg max-w-xl mx-auto">
                    Đặt vé máy bay đến các điểm đến trên khắp Việt Nam và Châu Á
                    với giá tốt nhất.
                </p>
            </div>

            {/* Nền dưới: màu trắng */}
            <div className="relative bg-white h-[60vh] md:h-[50vh]">
                <div className="absolute inset-x-0 -top-16 md:-top-20 px-4">
                    <SearchFlightsForm />
                </div>
            </div>
        </main>
    );
}
