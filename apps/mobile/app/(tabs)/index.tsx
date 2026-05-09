import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand } from '@/constants/theme';
import {
  fetchDiscoverCandidates,
  likeDiscoverUser,
  type DiscoverCandidate,
} from '@/lib/discover-api';

export default function DiscoverScreen() {
  const [queue, setQueue] = useState<DiscoverCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    try {
      const rows = await fetchDiscoverCandidates();
      setQueue(rows);
    } catch {
      if (mode === 'refresh') {
        Alert.alert('Could not refresh', 'Check your connection and try again.');
      }
    } finally {
      if (mode === 'initial') setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load('initial');
  }, [load]);

  const current = queue[0] ?? null;

  function shift() {
    setQueue((q) => q.slice(1));
  }

  async function onLike() {
    if (!current || busy) return;
    setBusy(true);
    try {
      const { matched } = await likeDiscoverUser(current.id);
      if (matched) {
        Alert.alert("It's a match!", 'Open the Matches tab to see them.');
      }
    } catch {
      Alert.alert('Could not send like', 'Try again in a moment.');
      setBusy(false);
      return;
    }
    shift();
    setBusy(false);
  }

  function onPass() {
    if (busy) return;
    shift();
  }

  const title = current?.displayName?.trim() || 'Member';
  const metaCity = current?.city?.trim();
  const tagline = current?.aboutLine?.trim() || current?.bio?.trim() || '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>spark</Text>
        <View style={styles.topRight}>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/(tabs)/dates')}>
            <IconSymbol name="gift.fill" size={22} color={Brand.text} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/(tabs)/profile')}>
            <IconSymbol name="person.crop.circle.fill" size={26} color={Brand.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.cardWrap}
        contentContainerStyle={styles.cardWrapContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} tintColor={Brand.pink} />
        }>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Brand.pink} />
            <Text style={[styles.hint, { marginTop: 12 }]}>Loading people near you…</Text>
          </View>
        ) : !current ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptyBody}>
              Pull to refresh, or check back after more people join. Both accounts need to finish onboarding to appear
              here.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.photo}>
              {current.avatarDataUrl ? (
                <Image source={{ uri: current.avatarDataUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <LinearGradient colors={['#2a2a2a', '#0a0a0a']} style={StyleSheet.absoluteFill} />
              )}
              <LinearGradient
                colors={['transparent', Brand.overlay, '#000000']}
                locations={[0.35, 0.75, 1]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.nameBlock}>
                <Text style={styles.name}>{title}</Text>
                <Text style={styles.meta}>{metaCity ? `${metaCity}` : 'City not shared'}</Text>
              </View>
            </View>

            <View style={styles.infoStrip}>
              <Text style={styles.matchPill}>{Math.round(current.matchPercent)}% match</Text>
              <Text style={styles.prompt} numberOfLines={3}>
                {tagline || 'They’re keeping it mysterious for now.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {current ? (
        <View style={styles.actions}>
          <Pressable style={styles.passOuter} onPress={onPass} disabled={busy}>
            <Text style={styles.passX}>✕</Text>
          </Pressable>
          <Pressable style={styles.super} onPress={() => {}} disabled>
            <IconSymbol name="sparkles" size={28} color={Brand.pink} />
          </Pressable>
          <Pressable style={styles.likeOuter} onPress={() => void onLike()} disabled={busy}>
            <Text style={styles.likeHeart}>♥</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  logo: {
    color: Brand.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
    textTransform: 'lowercase',
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.border,
  },
  cardWrap: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  cardWrapContent: { flexGrow: 1, paddingBottom: 8 },
  centerBox: {
    flex: 1,
    minHeight: 360,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  hint: { color: Brand.textMuted, fontSize: 15, textAlign: 'center' },
  emptyTitle: { color: Brand.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  emptyBody: { color: Brand.textSecondary, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 10 },
  card: {
    flex: 1,
    minHeight: 420,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  photo: { flex: 1, minHeight: 360 },
  nameBlock: { position: 'absolute', left: 20, right: 20, bottom: 100 },
  name: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  meta: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600', marginTop: 4 },
  infoStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: Brand.surface,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  matchPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,45,139,0.2)',
    color: Brand.pink,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  prompt: { color: Brand.textSecondary, fontSize: 15, lineHeight: 22, fontWeight: '500' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
    paddingVertical: 20,
    paddingBottom: 28,
  },
  passOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  passX: { color: '#fff', fontSize: 28, fontWeight: '300' },
  super: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Brand.pink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surfaceElevated,
    opacity: 0.45,
  },
  likeOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Brand.pink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.pink,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  likeHeart: { color: '#fff', fontSize: 32, marginTop: 2 },
});
