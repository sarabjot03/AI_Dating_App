import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';

const VIBES = ['Romantic', 'Playful', 'Adventure', 'Low-key', 'Sporty'] as const;

const SAMPLE_PACKAGES = [
  { title: 'Pink hour', subtitle: 'Coffee + dessert · Koramangala', price: '₹1,800 – ₹2,400' },
  { title: 'Courts & cocktails', subtitle: 'Badminton slot + drinks · Indiranagar', price: '₹3,200 – ₹4,000' },
  { title: 'Night out', subtitle: 'Dinner + live music · MG Road', price: '₹4,500 – ₹6,000' },
];

export default function DatesScreen() {
  const [budget, setBudget] = useState(3500);
  const [vibe, setVibe] = useState<(typeof VIBES)[number]>('Romantic');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Spark Dates</Text>
        <Text style={styles.title}>Plan a date in your budget</Text>
        <Text style={styles.caption}>
          Pick a vibe and budget — when partners go live, we’ll lock venues with Razorpay. This is a preview layout.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Budget (₹)</Text>
          <Text style={styles.budgetValue}>₹{budget.toLocaleString('en-IN')}</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${((budget - 1500) / (12000 - 1500)) * 100}%` }]} />
          </View>
          <View style={styles.sliderTicks}>
            {[1500, 3500, 6000, 12000].map((n) => (
              <Pressable key={n} onPress={() => setBudget(n)} hitSlop={8}>
                <Text style={[styles.tick, budget === n && styles.tickActive]}>₹{(n / 1000).toFixed(n % 1000 ? 1 : 0)}k</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Vibe</Text>
        <View style={styles.chips}>
          {VIBES.map((v) => (
            <Pressable
              key={v}
              onPress={() => setVibe(v)}
              style={[styles.chip, vibe === v && styles.chipActive]}>
              <Text style={[styles.chipText, vibe === v && styles.chipTextActive]}>{v}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Sample packages</Text>
        {SAMPLE_PACKAGES.map((p) => (
          <View key={p.title} style={styles.packageRow}>
            <View style={styles.packageAccent} />
            <View style={styles.packageBody}>
              <Text style={styles.packageTitle}>{p.title}</Text>
              <Text style={styles.packageSub}>{p.subtitle}</Text>
              <Text style={styles.packagePrice}>{p.price}</Text>
            </View>
          </View>
        ))}

        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>Reserve with Spark (coming soon)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  kicker: { color: Brand.pink, fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginTop: 8, textTransform: 'uppercase' },
  title: { color: Brand.text, fontSize: 30, fontWeight: '800', marginTop: 6, letterSpacing: -0.5 },
  caption: { color: Brand.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 10 },
  card: {
    marginTop: 22,
    backgroundColor: Brand.surfaceElevated,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  cardLabel: { color: Brand.textMuted, fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  budgetValue: { color: Brand.text, fontSize: 34, fontWeight: '800', marginTop: 8 },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.border,
    marginTop: 16,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Brand.pink,
  },
  sliderTicks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  tick: { color: Brand.textMuted, fontSize: 12, fontWeight: '600' },
  tickActive: { color: Brand.pink },
  sectionTitle: { color: Brand.text, fontSize: 18, fontWeight: '800', marginTop: 28, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
  },
  chipActive: { borderColor: Brand.pink, backgroundColor: 'rgba(255,45,139,0.12)' },
  chipText: { color: Brand.textSecondary, fontSize: 14, fontWeight: '700' },
  chipTextActive: { color: Brand.pink },
  packageRow: {
    flexDirection: 'row',
    backgroundColor: Brand.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  packageAccent: { width: 5, backgroundColor: Brand.pink },
  packageBody: { flex: 1, padding: 16 },
  packageTitle: { color: Brand.text, fontSize: 17, fontWeight: '800' },
  packageSub: { color: Brand.textSecondary, fontSize: 14, marginTop: 4 },
  packagePrice: { color: Brand.pink, fontSize: 15, fontWeight: '800', marginTop: 10 },
  cta: {
    marginTop: 24,
    backgroundColor: Brand.pink,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
