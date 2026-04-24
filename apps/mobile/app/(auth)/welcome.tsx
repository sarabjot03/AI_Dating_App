import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.kicker}>India · AI-first dating</Text>
        <Text style={styles.title}>Make the first move.</Text>
        <Text style={styles.subtitle}>
          Spark pairs a Bumble-style flow with compatibility-first matching, date packages, and safer chats.
        </Text>
      </View>
      <View style={styles.footer}>
        <Link href="/(auth)/phone" asChild>
          <Pressable style={styles.primary}>
            <Text style={styles.primaryLabel}>Continue with phone</Text>
          </Pressable>
        </Link>
        <Text style={styles.legal}>By continuing you agree to our Terms and Privacy Policy.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  body: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', gap: 14 },
  kicker: { fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: Brand.pink, fontWeight: '800' },
  title: { fontSize: 40, fontWeight: '900', lineHeight: 44, color: Brand.text, letterSpacing: -1 },
  subtitle: { fontSize: 17, lineHeight: 26, color: Brand.textSecondary, fontWeight: '500' },
  footer: { paddingHorizontal: 28, paddingBottom: 28, gap: 14 },
  primary: {
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: Brand.pink,
  },
  primaryLabel: { color: '#fff', fontSize: 17, fontWeight: '800' },
  legal: { fontSize: 12, lineHeight: 18, textAlign: 'center', color: Brand.textMuted },
});
