import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { riskApi } from '../services/api';
import { useUserStore } from '../store/userStore';

const CACHE_KEY = 'kavach_risk_cache';

export function useRiskData() {
    const { user } = useUserStore();
    const wardId = user?.wardId;

    return useQuery({
        queryKey: ['risk', wardId],
        queryFn: async () => {
            try {
                const res = await riskApi.myWard();
                const data = res.data;
                // Cache for offline use
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
                return data;
            } catch (err: any) {
                // Network error — try cache
                if (!err.response) {
                    const cached = await AsyncStorage.getItem(CACHE_KEY);
                    if (cached) return { ...JSON.parse(cached), _fromCache: true };
                }
                throw err;
            }
        },
        enabled: !!wardId,
        staleTime: 15 * 60 * 1000,   // 15 minutes
        refetchInterval: 15 * 60 * 1000,
        retry: 1,
    });
}
