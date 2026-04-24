import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { useOnboarding, type QuestionnaireAnswers } from '@/contexts/onboarding-context';
import { Brand } from '@/constants/theme';

const STEPS = 4;

const INTENTS = ['Serious relationship', 'Something casual', 'Still figuring it out'] as const;
const ENERGIES = ['Early mornings', 'Late evenings', 'Weekend explorer'] as const;

export default function QuestionnaireScreen() {
  const { answers: saved, setAnswers } = useOnboarding();
  const { signOut } = useAuth();
  const { from } = useLocalSearchParams<{ from?: 'profile' }>();

  const initial = useMemo(
    () =>
      saved ?? {
        intent: INTENTS[0],
        city: '',
        energy: ENERGIES[0],
        aboutLine: '',
      },
    [saved],
  );

  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState(initial.intent);
  const [city, setCity] = useState(initial.city);
  const [energy, setEnergy] = useState(initial.energy);
  const [aboutLine, setAboutLine] = useState(initial.aboutLine);

  const progress = (step + 1) / STEPS;

  async function goBack() {
    Keyboard.dismiss();
    if (step > 0) setStep((s) => s - 1);
    else if (from === 'profile') router.back();
    else {
      await signOut();
      router.replace('/(auth)/welcome');
    }
  }

  async function goNext() {
    Keyboard.dismiss();
    if (step < STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    const next: QuestionnaireAnswers = { intent, city: city.trim(), energy, aboutLine: aboutLine.trim() };
    await setAnswers(next);
    router.push('/(onboarding)/profile');
  }

  const canNext =
    step === 0
      ? true
      : step === 1
        ? city.trim().length >= 2
        : step === 2
          ? true
          : aboutLine.trim().length >= 8;

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={[styles.safe, { backgroundColor: Brand.background }]}>
          <View style={styles.top}>
            <Pressable onPress={() => void goBack()} hitSlop={12}>
              <Text style={[styles.back, { color: Brand.pink }]}>
                {step > 0 ? 'Back' : from === 'profile' ? 'Close' : 'Sign out'}
              </Text>
            </Pressable>
            <Text style={[styles.stepLabel, { color: Brand.textMuted }]}>
              Step {step + 1} of {STEPS}
            </Text>
          </View>
          <View style={[styles.barTrack, { backgroundColor: Brand.border }]}>
            <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: Brand.pink }]} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {step === 0 && (
              <>
                <Text style={[styles.title, { color: Brand.text }]}>What brings you here?</Text>
                <Text style={[styles.caption, { color: Brand.textSecondary }]}>
                  Pick the closest match — you can refine your profile later.
                </Text>
                {INTENTS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setIntent(item)}
                    style={[
                      styles.chip,
                      {
                        borderColor: Brand.border,
                        backgroundColor: intent === item ? 'rgba(255,45,139,0.15)' : 'transparent',
                      },
                    ]}>
                    <Text style={[styles.chipText, { color: Brand.text }]}>{item}</Text>
                  </Pressable>
                ))}
              </>
            )}

            {step === 1 && (
              <>
                <Text style={[styles.title, { color: Brand.text }]}>Where are you based?</Text>
                <Text style={[styles.caption, { color: Brand.textSecondary }]}>
                  City helps with distance and date ideas (India-first).
                </Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Bengaluru"
                  placeholderTextColor={Brand.textMuted}
                  style={[styles.input, { color: Brand.text, borderColor: Brand.border }]}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </>
            )}

            {step === 2 && (
              <>
                <Text style={[styles.title, { color: Brand.text }]}>When are you most yourself?</Text>
                <Text style={[styles.caption, { color: Brand.textSecondary }]}>We use this for vibe-matching later.</Text>
                {ENERGIES.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setEnergy(item)}
                    style={[
                      styles.chip,
                      {
                        borderColor: Brand.border,
                        backgroundColor: energy === item ? 'rgba(255,45,139,0.15)' : 'transparent',
                      },
                    ]}>
                    <Text style={[styles.chipText, { color: Brand.text }]}>{item}</Text>
                  </Pressable>
                ))}
              </>
            )}

            {step === 3 && (
              <>
                <Text style={[styles.title, { color: Brand.text }]}>In one line, who are you?</Text>
                <Text style={[styles.caption, { color: Brand.textSecondary }]}>
                  Later, AI can expand this — for now, write what feels true.
                </Text>
                <TextInput
                  value={aboutLine}
                  onChangeText={setAboutLine}
                  placeholder="I’m the friend who plans the trips but also needs Sunday reset."
                  placeholderTextColor={Brand.textMuted}
                  style={[styles.textArea, { color: Brand.text, borderColor: Brand.border }]}
                  multiline
                  textAlignVertical="top"
                  maxLength={200}
                />
                <Text style={[styles.count, { color: Brand.textMuted }]}>{aboutLine.length}/200</Text>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={goNext}
              disabled={!canNext}
              style={[styles.primary, { backgroundColor: Brand.pink, opacity: canNext ? 1 : 0.45 }]}>
              <Text style={styles.primaryLabel}>{step === STEPS - 1 ? 'Build my profile' : 'Continue'}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  safe: { flex: 1 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  back: { fontSize: 17 },
  stepLabel: { fontSize: 13, fontWeight: '600' },
  barTrack: { height: 4, marginHorizontal: 16, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  caption: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  chipText: { fontSize: 17 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    marginTop: 8,
  },
  textArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    minHeight: 120,
    marginTop: 8,
  },
  count: { fontSize: 12, alignSelf: 'flex-end' },
  footer: { paddingHorizontal: 24, paddingBottom: 22 },
  primary: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
