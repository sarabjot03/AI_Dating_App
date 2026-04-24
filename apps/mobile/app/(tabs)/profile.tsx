import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { Brand } from '@/constants/theme';
import { fetchMyProfile, type MyProfile } from '@/lib/profile-api';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProfile = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') setIsLoading(true);
      else setIsRefreshing(true);
      try {
        const data = await fetchMyProfile();
        setProfile(data);
      } catch {
        if (mode === 'refresh') {
          Alert.alert('Refresh failed', 'Could not fetch latest profile details.');
        }
      } finally {
        if (mode === 'initial') setIsLoading(false);
        else setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function onSignOut() {
    await signOut();
    router.replace('/(auth)/welcome');
  }

  const displayName =
    profile?.aboutLine?.trim().split(' ').slice(0, 2).join(' ') || profile?.phoneE164 || 'You';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{avatarLetter}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.sub}>
          {profile?.bio?.trim() || 'Edit questionnaire anytime — your match % sharpens with richer answers.'}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          <Pressable
            onPress={() => router.push('/(onboarding)/questionnaire?from=profile')}
            style={styles.row}>
            <Text style={styles.rowLabel}>Questionnaire & bio</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>
          <Pressable onPress={() => void loadProfile('refresh')} style={styles.row} disabled={isRefreshing}>
            <Text style={styles.rowLabel}>Refresh profile from server</Text>
            {isRefreshing ? <ActivityIndicator size="small" color={Brand.textMuted} /> : <Text style={styles.chev}>↻</Text>}
          </Pressable>
          <Row label="Account" />
          <Row label="Privacy & data" />
          <Row label="Safety center" />
          <Row label="Notifications" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Saved profile data</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={Brand.textMuted} />
          ) : (
            <>
              <Info label="Intent" value={profile?.intent ?? 'Not set'} />
              <Info label="City" value={profile?.city ?? 'Not set'} />
              <Info label="Energy" value={profile?.energy ?? 'Not set'} />
              <Info label="About line" value={profile?.aboutLine ?? 'Not set'} />
              <Info label="Onboarded" value={profile?.onboardedAt ? 'Yes' : 'No'} />
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={onSignOut} style={styles.signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Row({ label }: { label: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chev}>›</Text>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  hero: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20, alignItems: 'center' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Brand.surfaceElevated,
    borderWidth: 3,
    borderColor: Brand.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: Brand.pink, fontSize: 40, fontWeight: '900' },
  name: { color: Brand.text, fontSize: 28, fontWeight: '900', marginTop: 14 },
  sub: { color: Brand.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, maxWidth: 320 },
  list: { paddingHorizontal: 20, marginTop: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
  },
  rowLabel: { color: Brand.text, fontSize: 17, fontWeight: '600' },
  chev: { color: Brand.textMuted, fontSize: 20, fontWeight: '300' },
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Brand.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: Brand.surfaceElevated,
  },
  cardTitle: { color: Brand.text, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  infoRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
  },
  infoLabel: { color: Brand.textMuted, fontSize: 12, marginBottom: 3 },
  infoValue: { color: Brand.text, fontSize: 15, lineHeight: 21 },
  footer: { marginTop: 'auto', padding: 24 },
  signOut: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Brand.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: { color: Brand.text, fontSize: 16, fontWeight: '800' },
});
