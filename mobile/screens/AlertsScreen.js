import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAlerts } from '../services/api';

const SEVERITY_CONFIG = {
    CRITICAL: { color: '#ef4444', bg: '#ef444415', icon: '🚨', label: 'CRITICAL' },
    HIGH: { color: '#f97316', bg: '#f9731615', icon: '🔴', label: 'HIGH' },
    MEDIUM: { color: '#eab308', bg: '#eab30815', icon: '🟠', label: 'MEDIUM' },
    LOW: { color: '#22c55e', bg: '#22c55e15', icon: '🟡', label: 'LOW' },
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertsScreen() {
    const [alerts, setAlerts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadAlerts = async () => {
        try {
            const data = await getAlerts('ward-01');
            setAlerts(data);
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => { loadAlerts(); }, []);

    const renderAlert = ({ item }) => {
        const cfg = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.LOW;
        return (
            <View style={[styles.alertCard, { backgroundColor: cfg.bg, borderColor: cfg.color + '40' }]}>
                <View style={styles.alertHeader}>
                    <View style={styles.alertLeft}>
                        <Text style={styles.alertIcon}>{cfg.icon}</Text>
                        <View>
                            <Text style={[styles.alertSeverity, { color: cfg.color }]}>{cfg.label}</Text>
                            <Text style={styles.alertCategory}>{item.outbreakCategory?.replace('_', ' ')}</Text>
                        </View>
                    </View>
                    <Text style={styles.alertTime}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text style={styles.alertMessage}>{item.message}</Text>
                {item.recommendedAction && (
                    <View style={styles.actionBox}>
                        <Text style={styles.actionLabel}>💡 What to do:</Text>
                        <Text style={styles.actionText}>{item.recommendedAction}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🔔 Health Alerts</Text>
                <Text style={styles.subtitle}>Active alerts for your area</Text>
            </View>

            <FlatList
                data={alerts}
                keyExtractor={(item) => item.id}
                renderItem={renderAlert}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAlerts(); }} tintColor="#3b82f6" />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>✅</Text>
                        <Text style={styles.emptyTitle}>No Active Alerts</Text>
                        <Text style={styles.emptySubtitle}>Your area is currently safe. We'll notify you if anything changes.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0f1e' },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
    title: { fontSize: 22, fontWeight: '700', color: '#f9fafb' },
    subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    list: { padding: 16, gap: 12 },
    alertCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
    alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    alertIcon: { fontSize: 22 },
    alertSeverity: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    alertCategory: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
    alertTime: { fontSize: 11, color: '#6b7280' },
    alertMessage: { fontSize: 13, color: '#e5e7eb', lineHeight: 19 },
    actionBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
    actionLabel: { fontSize: 11, fontWeight: '600', color: '#9ca3af', marginBottom: 3 },
    actionText: { fontSize: 12, color: '#d1d5db', lineHeight: 17 },
    empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#f9fafb' },
    emptySubtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', paddingHorizontal: 32 },
});
