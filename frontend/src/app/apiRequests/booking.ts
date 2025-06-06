import http from '@/lib/http';
import { toQueryString } from '@/lib/utils';
import {
    BookingDetailResType,
    CreateBookingResType,
    CreateBookingTypeBody,
    DeleteBookingResType,
    GetBookingByIdResType,
    GetListBookingResType,
    PaginationParamsType,
    UpdateBookingResType,
    UpdateBookingTypeBody,
} from '@/schemaValidations/bookings.schema';

const bookingApiRequest = {
    // Lấy danh sách booking
    getBookings: (query?: PaginationParamsType) =>
        http.get<GetListBookingResType>(
            `/v1/api/bookings?${query ? `${toQueryString(query)}` : ''}`
        ),

    getBookingHistory: (query?: PaginationParamsType) =>
        http.get<BookingDetailResType>(
            `/v1/api/bookings/booking-history?${
                query ? `${toQueryString(query)}` : ''
            }`
        ),

    // Lấy chi tiết booking theo ID
    getBookingDetail: (bookingId: string) =>
        http.get<GetBookingByIdResType>(`/v1/api/bookings/${bookingId}`),

    // Tạo booking mới
    createBooking: (body: CreateBookingTypeBody) =>
        http.post<CreateBookingResType>('/v1/api/bookings', body),

    // Cập nhật trạng thái booking
    updateBooking: (bookingId: string, body: UpdateBookingTypeBody) =>
        http.patch<UpdateBookingResType>(`/v1/api/bookings/${bookingId}`, body),

    // Xoá booking
    deleteBooking: (bookingId: string) =>
        http.delete<DeleteBookingResType>(`/v1/api/bookings/${bookingId}`, {}),

    // Thống kê  booking
    getBookingStats: () => http.get('/v1/api/bookings/stats'),
};

export default bookingApiRequest;
