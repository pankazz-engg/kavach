import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '../services/api';
import { useUserStore } from '../store/userStore';

export function useAlerts() {
    const { user } = useUserStore();
    const wardId = user?.wardId;

    return useQuery({
        queryKey: ['alerts', wardId],
        queryFn: async () => {
            const res = await alertsApi.myWard();
            return res.data as any[];
        },
        enabled: !!wardId,
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        retry: 1,
    });
}
