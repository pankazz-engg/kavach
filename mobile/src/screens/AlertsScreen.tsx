import React from 'react';
import {
    View, Text, FlatList, StyleSheet,
    RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlerts } from '../hooks/useAlerts';
import AlertCard from '../components/AlertCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { colors, spacing } from '../constants/theme';

export default function AlertsScreen() {
    const { data, isLoading, isFetching, refetch, isError } = useAlerts();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Alerts</Text>
                {data && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{data.length}</Text>
                    </View>
                )}
            </View>

            {isLoading ? (
                <View style={styles.skeletons}>
                    {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} height={80} style={{ marginBottom: 10 }} />)}
                </View>
            ) : isError ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>⚠️ Could not load alerts</Text>
                </View>
            ) : !data?.length ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>✅</Text>
                    <Text style={styles.emptyText}>No active alerts for your ward</Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <AlertCard alert={item} />}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.accent} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        padding: spacing.lg, paddingBottom: spacing.md,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    title: { fontSize: 20, fontWeight: '700', color: colors.text },
    badge: {
        backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 999,
        borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
        paddingHorizontal: 8, paddingVertical: 2,
    },
    badgeText: { color: colors.red, fontSize: 12, fontWeight: '700' },
    list: { padding: spacing.lg },
    skeletons: { padding: spacing.lg },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    emptyIcon: { fontSize: 40 },
    emptyText: { color: colors.textMuted, fontSize: 14 },
});
