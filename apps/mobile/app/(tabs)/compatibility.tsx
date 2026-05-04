import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { fetchCompatibilityPreview, type CompatibilityPreview } from '@/lib/compatibility-api';
import { ApiError } from '@/lib/api';

export default function CompatibilityScreen() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<CompatibilityPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const preview = await fetchCompatibilityPreview();
      setData(preview);
    } catch (e) {
      const msg = e instanceof ApiError ? `Could not load (${e.status})` : 'Could not load compatibility preview.';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const ringValue =
    data?.overallScore != null
      ? `${data.overallScore}%`
      : data?.profileStrength != null
        ? `${data.profileStrength}%`
        : '—';
  const ringHint =
    data?.overallScore != null
      ? 'Placeholder score from your answers'
      : data?.profileStrength != null
        ? 'Profile strength (answer more to unlock full score)'
        : 'Complete the questionnaire';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Compatibility</Text>
          <Text style={styles.title}>Your match % (preview)</Text>
          <Text style={styles.caption}>
            Scores below are computed on the server from your saved questionnaire. Peer-to-peer matching comes next
            with the discovery feed.
          </Text>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Brand.pink} />
          </View>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <View style={styles.ringCard}>
              <View style={styles.ringOuter}>
                <View style={styles.ringInner}>
                  <Text style={styles.ringLabel}>You (placeholder)</Text>
                  <Text style={styles.ringValue}>{ringValue}</Text>
                  <Text style={styles.ringHint}>{ringHint}</Text>
                </View>
              </View>
            </View>

            {data?.disclaimer ? <Text style={styles.disclaimer}>{data.disclaimer}</Text> : null}

            <Text style={styles.sectionTitle}>Section breakdown</Text>
            {(data?.sections ?? []).map((s) => (
              <View key={s.id} style={styles.row}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowLabel}>{s.title}</Text>
                  <Text style={styles.rowPct}>{s.score}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${s.score}%` }]} />
                </View>
                <Text style={styles.rowMeta}>
                  Weight {(s.weight * 100).toFixed(0)}% · answered {Math.round(s.answeredRatio * 100)}%
                </Text>
              </View>
            ))}

            {data && !data.sections.length ? (
              <Text style={styles.hint}>Finish onboarding and save your profile so your questionnaire syncs here.</Text>
            ) : null}
          </>
        )}

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
  centered: { paddingVertical: 40, alignItems: 'center' },
  error: { color: '#ff6b6b', marginTop: 16, fontSize: 15 },
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
  ringHint: { color: Brand.textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center', paddingHorizontal: 8 },
  disclaimer: {
    color: Brand.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: { color: Brand.text, fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 14 },
  row: { marginBottom: 16 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  rowLabel: { color: Brand.textSecondary, fontSize: 13, fontWeight: '600', flex: 1, paddingRight: 8 },
  rowPct: { color: Brand.pink, fontSize: 13, fontWeight: '800' },
  rowMeta: { color: Brand.textMuted, fontSize: 11, marginTop: 6 },
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
  hint: { color: Brand.textMuted, fontSize: 14, marginTop: 8 },
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
