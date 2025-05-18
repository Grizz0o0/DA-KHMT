import accountApiRequest from '@/app/apiRequests/account';
import { getAccessTokenFromLocalStorage } from '@/lib/utils';
import { PaginationParamsType } from '@/schemaValidations/users.schema';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useAccountMe = () => {
    const accessToken = getAccessTokenFromLocalStorage();
    return useQuery({
        queryKey: ['account-me'],
        queryFn: accountApiRequest.me,
        enabled: !!accessToken,
    });
};

export const useUpdateMeMutation = () => {
    return useMutation({
        mutationFn: accountApiRequest.updateMe,
    });
};

export const useChangePasswordMutation = () => {
    return useMutation({
        mutationFn: accountApiRequest.changePassword,
    });
};

export const useGetGuestList = (params: PaginationParamsType) => {
    return useQuery({
        queryKey: ['guest-list', params],
        queryFn: () => accountApiRequest.getListUser(params),
    });
};
