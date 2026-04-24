import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Inbox</Text>
        <Text style={styles.title}>Chats</Text>
      </View>
      <View style={styles.empty}>
        <Text style={styles.headline}>No conversations yet</Text>
        <Text style={styles.body}>
          After you match, chats appear here with read receipts and AI icebreakers when we wire the backend.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  kicker: { color: Brand.pink, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: Brand.text, fontSize: 34, fontWeight: '900', marginTop: 4 },
  empty: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 8 },
  headline: { color: Brand.text, fontSize: 20, fontWeight: '800' },
  body: { color: Brand.textSecondary, fontSize: 16, lineHeight: 24 },
});
