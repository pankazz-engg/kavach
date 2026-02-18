import React, { useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { submitReport } from '../services/api';

const SYNDROMES = [
    { key: 'DIARRHEA', label: 'Diarrhea', icon: '🚽' },
    { key: 'FEVER', label: 'Fever', icon: '🌡️' },
    { key: 'VOMITING', label: 'Vomiting', icon: '🤢' },
    { key: 'COUGH', label: 'Cough', icon: '😷' },
    { key: 'RESPIRATORY_DISTRESS', label: 'Breathing Difficulty', icon: '🫁' },
    { key: 'SKIN_RASH', label: 'Skin Rash', icon: '🔴' },
    { key: 'JAUNDICE', label: 'Jaundice', icon: '🟡' },
    { key: 'HEADACHE', label: 'Headache', icon: '🤕' },
];

const SEVERITY_LABELS = ['', 'Mild', 'Moderate', 'Significant', 'Severe', 'Critical'];

export default function ReportScreen({ navigation }) {
    const [selectedSyndrome, setSelectedSyndrome] = useState(null);
    const [severity, setSeverity] = useState(1);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedSyndrome) {
            Alert.alert('Select Symptom', 'Please select at least one symptom to report.');
            return;
        }

        setSubmitting(true);
        try {
            await submitReport({
                wardId: 'ward-01',        // In production: use GPS to determine ward
                latitude: 19.0419,
                longitude: 72.8530,
                syndromeType: selectedSyndrome,
                description,
                severity,
            });

            Alert.alert(
                '✅ Report Submitted',
                'Thank you! Your report helps us track disease patterns and protect your community.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (err) {
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Text style={styles.backText}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Report Symptoms</Text>
                        <Text style={styles.subtitle}>Your anonymous report helps detect outbreaks early</Text>
                    </View>

                    {/* Symptom selector */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What are you experiencing?</Text>
                        <View style={styles.syndromeGrid}>
                            {SYNDROMES.map((s) => (
                                <TouchableOpacity
                                    key={s.key}
                                    onPress={() => setSelectedSyndrome(s.key)}
                                    style={[
                                        styles.syndromeBtn,
                                        selectedSyndrome === s.key && styles.syndromeBtnSelected,
                                    ]}
                                >
                                    <Text style={styles.syndromeIcon}>{s.icon}</Text>
                                    <Text style={[
                                        styles.syndromeLabel,
                                        selectedSyndrome === s.key && { color: '#3b82f6' },
                                    ]}>{s.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Severity */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Severity: <Text style={{ color: '#f97316' }}>{SEVERITY_LABELS[severity]}</Text></Text>
                        <View style={styles.severityRow}>
                            {[1, 2, 3, 4, 5].map((v) => (
                                <TouchableOpacity
                                    key={v}
                                    onPress={() => setSeverity(v)}
                                    style={[
                                        styles.severityBtn,
                                        severity === v && { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
                                    ]}
                                >
                                    <Text style={[styles.severityNum, severity === v && { color: '#fff' }]}>{v}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.severityLabels}>
                            <Text style={styles.severityHint}>Mild</Text>
                            <Text style={styles.severityHint}>Critical</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Details (optional)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Describe your symptoms, duration, or any other relevant info..."
                            placeholderTextColor="#4b5563"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            maxLength={500}
                        />
                        <Text style={styles.charCount}>{description.length}/500</Text>
                    </View>

                    {/* Submit */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitText}>Submit Anonymous Report</Text>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.privacyNote}>🔒 Your identity is never shared. Reports are anonymous.</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0f1e' },
    header: { padding: 20, paddingBottom: 8 },
    backBtn: { marginBottom: 12 },
    backText: { color: '#3b82f6', fontSize: 14 },
    title: { fontSize: 22, fontWeight: '700', color: '#f9fafb' },
    subtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
    section: { paddingHorizontal: 16, marginBottom: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    syndromeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    syndromeBtn: {
        width: '47%', backgroundColor: '#111827', borderRadius: 12,
        borderWidth: 1, borderColor: '#1f2937', padding: 14,
        alignItems: 'center', gap: 6,
    },
    syndromeBtnSelected: { borderColor: '#3b82f6', backgroundColor: '#3b82f610' },
    syndromeIcon: { fontSize: 24 },
    syndromeLabel: { fontSize: 12, fontWeight: '500', color: '#d1d5db', textAlign: 'center' },
    severityRow: { flexDirection: 'row', gap: 10 },
    severityBtn: {
        flex: 1, height: 44, borderRadius: 10, borderWidth: 1,
        borderColor: '#1f2937', backgroundColor: '#111827',
        alignItems: 'center', justifyContent: 'center',
    },
    severityNum: { fontSize: 16, fontWeight: '700', color: '#9ca3af' },
    severityLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    severityHint: { fontSize: 11, color: '#4b5563' },
    textInput: {
        backgroundColor: '#111827', borderRadius: 12, borderWidth: 1,
        borderColor: '#1f2937', color: '#f9fafb', padding: 14,
        fontSize: 14, minHeight: 100, textAlignVertical: 'top',
    },
    charCount: { fontSize: 11, color: '#4b5563', textAlign: 'right', marginTop: 4 },
    submitBtn: {
        backgroundColor: '#3b82f6', borderRadius: 14, padding: 16,
        alignItems: 'center',
    },
    submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    privacyNote: { fontSize: 12, color: '#4b5563', textAlign: 'center', marginTop: 10 },
});
