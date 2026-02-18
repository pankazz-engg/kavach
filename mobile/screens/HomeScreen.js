import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyWardRisk, getHeatmap } from '../services/api';

const RISK_COLOR = (score) => {
    if (score >= 0.8) return '#ef4444';
    if (score >= 0.6) return '#f97316';
    if (score >= 0.4) return '#eab308';
    return '#22c55e';
};

const RISK_LABEL = (score) => {
    if (score >= 0.8) return 'CRITICAL';
    if (score >= 0.6) return 'HIGH';
    if (score >= 0.4) return 'MEDIUM';
    return 'LOW';
};

const CATEGORY_ICON = {
    WATERBORNE: '💧', FOODBORNE: '🍽️', AIRBORNE: '💨',
    VECTOR_BORNE: '🦟', HOSPITAL_ACQUIRED: '🏥', UNKNOWN: '❓',
};

export default function HomeScreen({ navigation }) {
    const [wardRisk, setWardRisk] = useState(null);
    const [allWards, setAllWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Demo: use Ward 1 as the user's ward
    const MY_WARD_ID = 'ward-01';

    const loadData = async () => {
        try {
            const [risk, heatmap] = await Promise.all([
                getMyWardRisk(MY_WARD_ID).catch(() => null),
                getHeatmap().catch(() => []),
            ]);
            setWardRisk(risk);
            setAllWards(heatmap.sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0)));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const score = wardRisk?.riskScore ?? 0;
    const color = RISK_COLOR(score);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#3b82f6" size="large" />
                <Text style={styles.loadingText}>Loading outbreak data...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#3b82f6" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>⚕️ Kavach</Text>
                    <Text style={styles.subtitle}>Your Area Health Status</Text>
                </View>

                {/* My Ward Risk Card */}
                <View style={[styles.riskCard, { borderColor: color + '60' }]}>
                    <View style={[styles.riskBadge, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.riskScore, { color }]}>{(score * 100).toFixed(0)}%</Text>
                        <Text style={[styles.riskLabel, { color }]}>{RISK_LABEL(score)}</Text>
                    </View>
                    <View style={styles.riskInfo}>
                        <Text style={styles.wardName}>Ward 1 — Dharavi</Text>
                        <Text style={styles.wardCity}>Mumbai, Maharashtra</Text>
                        {wardRisk?.outbreakCategory && (
                            <Text style={styles.category}>
                                {CATEGORY_ICON[wardRisk.outbreakCategory]} {wardRisk.outbreakCategory.replace('_', ' ')}
                            </Text>
                        )}
                    </View>
                </View>

                {/* AI Insight Box */}
                {wardRisk?.outbreakReasons?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🧠 Why is your area at risk?</Text>
                        {wardRisk.outbreakReasons.map((reason, i) => (
                            <View key={i} style={styles.reasonCard}>
                                <Text style={styles.reasonText}>{reason}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#3b82f620', borderColor: '#3b82f640' }]}
                            onPress={() => navigation.navigate('Report')}
                        >
                            <Text style={styles.actionIcon}>📝</Text>
                            <Text style={[styles.actionLabel, { color: '#3b82f6' }]}>Report Symptom</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#f9731620', borderColor: '#f9731640' }]}
                            onPress={() => navigation.navigate('Alerts')}
                        >
                            <Text style={styles.actionIcon}>🔔</Text>
                            <Text style={[styles.actionLabel, { color: '#f97316' }]}>View Alerts</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Nearby Wards */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nearby Ward Risk</Text>
                    {allWards.slice(0, 5).map((ward) => {
                        const wScore = ward.riskScore ?? 0;
                        const wColor = RISK_COLOR(wScore);
                        return (
                            <View key={ward.wardId} style={styles.wardRow}>
                                <View style={[styles.wardDot, { backgroundColor: wColor }]} />
                                <Text style={styles.wardRowName} numberOfLines={1}>{ward.name}</Text>
                                <Text style={[styles.wardRowScore, { color: wColor }]}>{(wScore * 100).toFixed(0)}%</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0f1e' },
    center: { flex: 1, backgroundColor: '#0a0f1e', alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { color: '#6b7280', fontSize: 13 },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
    logo: { fontSize: 22, fontWeight: '700', color: '#f9fafb' },
    subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    riskCard: {
        margin: 16, borderRadius: 16, borderWidth: 1,
        backgroundColor: '#111827', padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 16,
    },
    riskBadge: { borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 80 },
    riskScore: { fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
    riskLabel: { fontSize: 10, fontWeight: '700', marginTop: 2 },
    riskInfo: { flex: 1 },
    wardName: { fontSize: 15, fontWeight: '600', color: '#f9fafb' },
    wardCity: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    category: { fontSize: 12, color: '#9ca3af', marginTop: 6 },
    section: { paddingHorizontal: 16, marginBottom: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: '#9ca3af', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    reasonCard: { backgroundColor: '#111827', borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: '#1f2937' },
    reasonText: { fontSize: 13, color: '#e5e7eb', lineHeight: 18 },
    actionRow: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 16, alignItems: 'center', gap: 8 },
    actionIcon: { fontSize: 24 },
    actionLabel: { fontSize: 12, fontWeight: '600' },
    wardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1f2937', gap: 10 },
    wardDot: { width: 8, height: 8, borderRadius: 4 },
    wardRowName: { flex: 1, fontSize: 13, color: '#d1d5db' },
    wardRowScore: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
