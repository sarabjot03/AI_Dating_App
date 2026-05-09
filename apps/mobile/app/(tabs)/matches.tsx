import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { fetchMatches, type MatchRow } from '@/lib/discover-api';

export default function MatchesScreen() {
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchMatches());
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Your hive</Text>
        <Text style={styles.title}>Matches</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.pink} />
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.headline}>No matches yet</Text>
          <Text style={styles.body}>
            When you and someone else both like each other on Discover, they show up here. Use two onboarded test
            accounts and like each other to try it.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.matchId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <MatchCard row={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function MatchCard({ row }: { row: MatchRow }) {
  const u = row.user;
  const name = u.displayName?.trim() || 'Member';
  const sub = u.city?.trim() || u.aboutLine?.trim() || 'Say hi soon';

  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        {u.avatarDataUrl ? (
          <Image source={{ uri: u.avatarDataUrl }} style={styles.avatarImg} contentFit="cover" />
        ) : (
          <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardSub} numberOfLines={2}>
          {sub}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  kicker: { color: Brand.pink, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: Brand.text, fontSize: 34, fontWeight: '900', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 8 },
  headline: { color: Brand.text, fontSize: 20, fontWeight: '800' },
  body: { color: Brand.textSecondary, fontSize: 16, lineHeight: 24 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.surfaceElevated,
    borderWidth: 2,
    borderColor: Brand.pink,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarLetter: { color: Brand.pink, fontSize: 22, fontWeight: '900' },
  cardText: { flex: 1 },
  cardName: { color: Brand.text, fontSize: 18, fontWeight: '800' },
  cardSub: { color: Brand.textSecondary, fontSize: 14, marginTop: 4, lineHeight: 20 },
});
