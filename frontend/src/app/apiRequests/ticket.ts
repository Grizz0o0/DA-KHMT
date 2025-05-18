import http from '@/lib/http';
import { toQueryString } from '@/lib/utils';
import {
    CreateTicketTypeBody,
    CreateMultipleTicketsTypeBody,
    UpdateTicketStatusTypeBody,
    PaginationParamsType,
    GetListTicketResType,
    CreateTicketResType,
    CreateMultipleTicketsResType,
    GetTicketResType,
    UpdateTicketResType,
} from '@/schemaValidations/tickets.schema';

const ticketApiRequest = {
    // Tạo vé đơn
    createTicket: (data: CreateTicketTypeBody) =>
        http.post<CreateTicketResType>('/v1/api/ticket', data),

    // Tạo nhiều vé cùng lúc
    createMultipleTickets: (data: CreateMultipleTicketsTypeBody) =>
        http.post<CreateMultipleTicketsResType>(
            '/v1/api/ticket/multiple',
            data
        ),

    // Lấy danh sách vé (admin)
    getTickets: (query?: PaginationParamsType) =>
        http.get<GetListTicketResType>(
            `/v1/api/tickets?${query ? toQueryString(query) : ''}`
        ),

    // Lấy vé theo ID
    getTicketById: (ticketId: string) =>
        http.get<GetTicketResType>(`/v1/api/tickets/${ticketId}`),

    // Cập nhật vé
    updateTicket: (ticketId: string, data: UpdateTicketStatusTypeBody) =>
        http.patch<UpdateTicketResType>(`/v1/api/tickets/${ticketId}`, data),

    // Xoá vé
    deleteTicket: (ticketId: string) =>
        http.delete(`/v1/api/tickets/${ticketId}`, {}),

    // Lấy thống kê vé theo flight
    getTicketStats: (flightId: string) =>
        http.get(`/v1/api/tickets/stats/${flightId}`),

    // Ghế còn trống của chuyến bay
    getAvailableSeats: (flightId: string) =>
        http.get(`/v1/api/tickets/available-seats/${flightId}`),

    // Ghế đã đặt của chuyến bay (admin)
    getBookedSeats: (flightId: string) =>
        http.get(`/v1/api/tickets/booked-seats/${flightId}`),

    // Kiểm tra vé có thể huỷ không
    canCancelTicket: (ticketId: string) =>
        http.get(`/v1/api/tickets/can-cancel/${ticketId}`),
};

export default ticketApiRequest;
