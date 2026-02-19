import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../store/userStore';
import { colors, radius, spacing } from '../constants/theme';
import GlowCard from '../components/GlowCard';

export default function ProfileScreen() {
    const { user, logout } = useUserStore();

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
        ]);
    };

    const rows = [
        { label: 'Name', value: user?.name ?? '—' },
        { label: 'Email', value: user?.email ?? '—' },
        { label: 'Role', value: user?.role ?? '—' },
        { label: 'Ward ID', value: user?.wardId ?? 'Not assigned' },
    ];

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() ?? '?'}
                        </Text>
                    </View>
                    <Text style={styles.name}>{user?.name ?? 'Citizen'}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user?.role ?? 'CITIZEN'}</Text>
                    </View>
                </View>

                {/* Info card */}
                <GlowCard style={styles.card}>
                    {rows.map((row, i) => (
                        <View key={row.label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
                            <Text style={styles.rowLabel}>{row.label}</Text>
                            <Text style={styles.rowValue}>{row.value}</Text>
                        </View>
                    ))}
                </GlowCard>

                {/* App info */}
                <GlowCard style={styles.card}>
                    <Text style={styles.appTitle}>⚡ Kavach</Text>
                    <Text style={styles.appSub}>AI Disease Outbreak Intelligence System</Text>
                    <Text style={styles.appVersion}>v1.0.0 — Production</Text>
                </GlowCard>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg },
    avatarWrap: { alignItems: 'center', marginBottom: spacing.xl },
    avatar: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: colors.accent,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.sm,
        shadowColor: colors.accentGlow, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1, shadowRadius: 20,
    },
    avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
    name: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 6 },
    roleBadge: {
        backgroundColor: 'rgba(59,130,246,0.15)', borderRadius: radius.full,
        borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
        paddingHorizontal: 12, paddingVertical: 3,
    },
    roleText: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    card: { marginBottom: spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    rowLabel: { fontSize: 13, color: colors.textMuted },
    rowValue: { fontSize: 13, color: colors.text, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
    appTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 2 },
    appSub: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
    appVersion: { fontSize: 11, color: colors.textDim },
    logoutBtn: {
        backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: radius.md,
        borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
        paddingVertical: 14, alignItems: 'center',
        marginTop: spacing.sm,
    },
    logoutText: { color: colors.red, fontSize: 15, fontWeight: '700' },
});
