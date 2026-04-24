import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';

const FACTORS = [
  { label: 'Values & intent', score: 88 },
  { label: 'Lifestyle fit', score: 79 },
  { label: 'Conversation style', score: 84 },
  { label: 'Distance & logistics', score: 91 },
];

export default function CompatibilityScreen() {
  const overall = 84;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Compatibility</Text>
          <Text style={styles.title}>How your match % works</Text>
          <Text style={styles.caption}>
            We only show people above your threshold (default 80%). Scores blend questionnaire fit, intent, and
            location — real ML hooks into the API next.
          </Text>
        </View>

        <View style={styles.ringCard}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.ringLabel}>Sample match</Text>
              <Text style={styles.ringValue}>{`${overall}%`}</Text>
              <Text style={styles.ringHint}>with “Sample · 27”</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Score breakdown</Text>
        {FACTORS.map((f) => (
          <View key={f.label} style={styles.row}>
            <Text style={styles.rowLabel}>{f.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${f.score}%` }]} />
            </View>
            <Text style={styles.rowPct}>{f.score}%</Text>
          </View>
        ))}

        <Pressable style={styles.secondary} onPress={() => router.push('/(onboarding)/questionnaire?from=profile')}>
          <Text style={styles.secondaryText}>Refine my answers</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { paddingTop: 8 },
  kicker: { color: Brand.pink, fontSize: 12, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: Brand.text, fontSize: 28, fontWeight: '800', marginTop: 6, letterSpacing: -0.5 },
  caption: { color: Brand.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 10 },
  ringCard: { alignItems: 'center', marginTop: 28, marginBottom: 8 },
  ringOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 10,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 164,
    height: 164,
    borderRadius: 82,
    borderWidth: 10,
    borderColor: Brand.pink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surface,
  },
  ringLabel: { color: Brand.textMuted, fontSize: 12, fontWeight: '700' },
  ringValue: { color: Brand.text, fontSize: 44, fontWeight: '900', marginTop: 4 },
  ringHint: { color: Brand.textSecondary, fontSize: 13, marginTop: 4 },
  sectionTitle: { color: Brand.text, fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 14 },
  row: { marginBottom: 16 },
  rowLabel: { color: Brand.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.border,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Brand.pink,
  },
  rowPct: { color: Brand.pink, fontSize: 13, fontWeight: '800', marginTop: 6, alignSelf: 'flex-end' },
  secondary: {
    marginTop: 28,
    marginBottom: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Brand.pink,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: { color: Brand.pink, fontSize: 16, fontWeight: '800' },
});
