import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { Brand } from '@/constants/theme';

export default function ProfileScreen() {
  const { signOut } = useAuth();

  async function onSignOut() {
    await signOut();
    router.replace('/(auth)/welcome');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>Y</Text>
        </View>
        <Text style={styles.name}>You</Text>
        <Text style={styles.sub}>Edit questionnaire anytime — your match % sharpens with richer answers.</Text>
      </View>

      <View style={styles.list}>
        <Pressable
          onPress={() => router.push('/(onboarding)/questionnaire?from=profile')}
          style={styles.row}>
          <Text style={styles.rowLabel}>Questionnaire & bio</Text>
          <Text style={styles.chev}>›</Text>
        </Pressable>
        <Row label="Account" />
        <Row label="Privacy & data" />
        <Row label="Safety center" />
        <Row label="Notifications" />
      </View>

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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
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
