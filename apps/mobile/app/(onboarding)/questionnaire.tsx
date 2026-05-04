import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { useOnboarding } from '@/contexts/onboarding-context';
import { Brand } from '@/constants/theme';
import {
  COMPATIBILITY_SCHEMA,
  flattenQuestions,
  type QResponse,
  type QResponseMulti,
  type QResponseSingle,
  type QuestionnaireAnswers,
} from '@/lib/compatibility-questionnaire';

const FLAT = flattenQuestions();

export default function QuestionnaireScreen() {
  const { answers: saved, setAnswers } = useOnboarding();
  const { signOut } = useAuth();
  const { from } = useLocalSearchParams<{ from?: 'profile' }>();

  const totalSteps = FLAT.length + 1;

  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, QResponse>>({});
  const [city, setCity] = useState('');
  const [aboutLine, setAboutLine] = useState('');

  useEffect(() => {
    if (!saved) return;
    setResponses({ ...saved.responses });
    setCity(saved.city);
    setAboutLine(saved.aboutLine);
  }, [saved]);

  const progress = (step + 1) / totalSteps;
  const isBasicsStep = step === FLAT.length;
  const current = !isBasicsStep ? FLAT[step] : null;

  const canNext = useMemo(() => {
    if (isBasicsStep) {
      return city.trim().length >= 2 && aboutLine.trim().length >= 8;
    }
    const q = FLAT[step].question;
    const r = responses[q.id];
    if (q.type === 'single') return r?.type === 'single';
    if (q.type === 'scale') return r?.type === 'scale';
    if (q.type === 'multi') return true;
    return false;
  }, [aboutLine, city, isBasicsStep, responses, step]);

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
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      return;
    }
    const filled: Record<string, QResponse> = { ...responses };
    for (const { question } of FLAT) {
      if (question.type === 'multi' && !filled[question.id]) {
        filled[question.id] = { type: 'multi', values: [] };
      }
    }
    const next: QuestionnaireAnswers = {
      version: COMPATIBILITY_SCHEMA.version,
      responses: filled,
      city: city.trim(),
      aboutLine: aboutLine.trim(),
    };
    await setAnswers(next);
    router.push('/(onboarding)/profile');
  }

  function setSingle(id: string, value: number) {
    setResponses((prev) => ({ ...prev, [id]: { type: 'single', value } satisfies QResponseSingle }));
  }

  function setScale(id: string, value: number) {
    setResponses((prev) => ({ ...prev, [id]: { type: 'scale', value } }));
  }

  function toggleMulti(id: string, value: string) {
    setResponses((prev) => {
      const cur = prev[id];
      const existing: string[] = cur?.type === 'multi' ? [...cur.values] : [];
      const nextVals = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      const next: QResponseMulti = { type: 'multi', values: nextVals };
      return { ...prev, [id]: next };
    });
  }

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
              Step {step + 1} of {totalSteps}
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
            {isBasicsStep ? (
              <>
                <Text style={[styles.kicker, { color: Brand.pink }]}>Almost there</Text>
                <Text style={[styles.title, { color: Brand.text }]}>City & intro</Text>
                <Text style={[styles.caption, { color: Brand.textSecondary }]}>
                  We use this for distance-aware matching and your public profile line.
                </Text>
                <Text style={[styles.fieldLabel, { color: Brand.text }]}>City</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Bengaluru"
                  placeholderTextColor={Brand.textMuted}
                  style={[styles.input, { color: Brand.text, borderColor: Brand.border }]}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <Text style={[styles.fieldLabel, { color: Brand.text, marginTop: 16 }]}>One line about you</Text>
                <TextInput
                  value={aboutLine}
                  onChangeText={setAboutLine}
                  placeholder="I value honesty, good food, and slow Sundays."
                  placeholderTextColor={Brand.textMuted}
                  style={[styles.textArea, { color: Brand.text, borderColor: Brand.border }]}
                  multiline
                  textAlignVertical="top"
                  maxLength={200}
                />
                <Text style={[styles.count, { color: Brand.textMuted }]}>{aboutLine.length}/200</Text>
              </>
            ) : current ? (
              <QuestionStep
                sectionTitle={current.sectionTitle}
                showSectionKicker={step === 0 || FLAT[step - 1].sectionId !== current.sectionId}
                question={current.question}
                response={responses[current.question.id]}
                onSingle={setSingle}
                onScale={setScale}
                onToggleMulti={toggleMulti}
              />
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={() => void goNext()}
              disabled={!canNext}
              style={[styles.primary, { backgroundColor: Brand.pink, opacity: canNext ? 1 : 0.45 }]}>
              <Text style={styles.primaryLabel}>
                {step === totalSteps - 1 ? 'Build my profile' : 'Continue'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function QuestionStep({
  sectionTitle,
  showSectionKicker,
  question,
  response,
  onSingle,
  onScale,
  onToggleMulti,
}: {
  sectionTitle: string;
  showSectionKicker: boolean;
  question: (typeof FLAT)[number]['question'];
  response: QResponse | undefined;
  onSingle: (id: string, value: number) => void;
  onScale: (id: string, value: number) => void;
  onToggleMulti: (id: string, value: string) => void;
}) {
  return (
    <>
      {showSectionKicker ? (
        <Text style={[styles.kicker, { color: Brand.pink }]}>{sectionTitle}</Text>
      ) : null}
      <Text style={[styles.title, { color: Brand.text }]}>{question.question}</Text>
      <Text style={[styles.caption, { color: Brand.textSecondary }]}>
        Your answers power compatibility scoring — pick what feels true today.
      </Text>

      {question.type === 'single' &&
        question.options.map((opt) => {
          const selected = response?.type === 'single' && response.value === opt.value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => onSingle(question.id, opt.value)}
              style={[
                styles.chip,
                {
                  borderColor: Brand.border,
                  backgroundColor: selected ? 'rgba(255,45,139,0.15)' : 'transparent',
                },
              ]}>
              <Text style={[styles.chipText, { color: Brand.text }]}>{opt.label}</Text>
            </Pressable>
          );
        })}

      {question.type === 'scale' && (
        <View style={styles.scaleRow}>
          {Array.from(
            { length: question.scale.max - question.scale.min + 1 },
            (_, i) => question.scale.min + i,
          ).map((n) => {
            const selected = response?.type === 'scale' && response.value === n;
            return (
              <Pressable
                key={n}
                onPress={() => onScale(question.id, n)}
                style={[
                  styles.scaleChip,
                  {
                    borderColor: Brand.border,
                    backgroundColor: selected ? 'rgba(255,45,139,0.2)' : 'transparent',
                  },
                ]}>
                <Text style={[styles.scaleChipText, { color: Brand.text }]}>{n}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {question.type === 'multi' &&
        question.options.map((opt) => {
          const values = response?.type === 'multi' ? response.values : [];
          const selected = values.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => onToggleMulti(question.id, opt.value)}
              style={[
                styles.chip,
                {
                  borderColor: Brand.border,
                  backgroundColor: selected ? 'rgba(255,45,139,0.15)' : 'transparent',
                },
              ]}>
              <Text style={[styles.chipText, { color: Brand.text }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
    </>
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
  kicker: { fontSize: 13, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  caption: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  fieldLabel: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  chipText: { fontSize: 17 },
  scaleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  scaleChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 52,
    alignItems: 'center',
  },
  scaleChipText: { fontSize: 17, fontWeight: '700' },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    marginTop: 4,
  },
  textArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    minHeight: 120,
    marginTop: 4,
  },
  count: { fontSize: 12, alignSelf: 'flex-end' },
  footer: { paddingHorizontal: 24, paddingBottom: 22 },
  primary: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
