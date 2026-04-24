import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand } from '@/constants/theme';

export default function DiscoverScreen() {
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

      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <View style={styles.photo}>
            <LinearGradient colors={['#2a2a2a', '#0a0a0a']} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['transparent', Brand.overlay, '#000000']}
              locations={[0.35, 0.75, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.nameBlock}>
              <Text style={styles.name}>Aisha, 27</Text>
              <Text style={styles.meta}>4 km away · Bengaluru</Text>
            </View>
          </View>

          <View style={styles.infoStrip}>
            <Text style={styles.matchPill}>84% match</Text>
            <Text style={styles.prompt} numberOfLines={2}>
              Loves filter kaapi, indie gigs, and long drives out of the city.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.passOuter} onPress={() => {}}>
          <Text style={styles.passX}>✕</Text>
        </Pressable>
        <Pressable style={styles.super} onPress={() => {}}>
          <IconSymbol name="sparkles" size={28} color={Brand.pink} />
        </Pressable>
        <Pressable style={styles.likeOuter} onPress={() => {}}>
          <Text style={styles.likeHeart}>♥</Text>
        </Pressable>
      </View>
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
  card: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  photo: { flex: 1, minHeight: 360 },
  photoFade: { ...StyleSheet.absoluteFillObject },
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
