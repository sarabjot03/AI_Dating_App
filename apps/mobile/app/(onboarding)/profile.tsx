import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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

import { buildProfileFromAnswers, useOnboarding } from '@/contexts/onboarding-context';
import { Brand } from '@/constants/theme';

export default function ProfilePreviewScreen() {
  const { answers, setProfileDraft, completeOnboarding, saveToServer } = useOnboarding();

  const [bio, setBio] = useState('');
  const [p0, setP0] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');

  useEffect(() => {
    if (!answers) {
      router.replace('/(onboarding)/questionnaire');
      return;
    }
    const draft = buildProfileFromAnswers(answers);
    setBio(draft.bio);
    setP0(draft.prompts[0]?.answer ?? '');
    setP1(draft.prompts[1]?.answer ?? '');
    setP2(draft.prompts[2]?.answer ?? '');
  }, [answers]);

  async function onSaveAndEnter() {
    Keyboard.dismiss();
    if (!answers) return;
    const draft = buildProfileFromAnswers(answers);
    draft.bio = bio.trim();
    draft.prompts = [
      { question: draft.prompts[0].question, answer: p0.trim() },
      { question: draft.prompts[1].question, answer: p1.trim() },
      { question: draft.prompts[2].question, answer: p2.trim() },
    ];
    await setProfileDraft(draft);
    try {
      await saveToServer({ answers, profileDraft: draft, onboarded: true });
    } catch {
      Alert.alert('Could not sync profile', 'Please check your connection and try again.');
      return;
    }
    await completeOnboarding();
    router.replace('/');
  }

  if (!answers) {
    return null;
  }

  const canSave = bio.trim().length >= 20 && p0.trim().length >= 3 && p1.trim().length >= 3 && p2.trim().length >= 3;

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={[styles.safe, { backgroundColor: Brand.background }]}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={[styles.back, { color: Brand.pink }]}>Back</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={[styles.kicker, { color: Brand.pink }]}>Your profile draft</Text>
            <Text style={[styles.title, { color: Brand.text }]}>Edit before you go live</Text>
            <Text style={[styles.caption, { color: Brand.textSecondary }]}>
              Built from your questionnaire. Replace with real AI copy on the server when you’re ready.
            </Text>

            <Text style={[styles.label, { color: Brand.text }]}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={[styles.textArea, { color: Brand.text, borderColor: Brand.border }]}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.label, { color: Brand.text, marginTop: 16 }]}>Prompt: Typical Sunday</Text>
            <TextInput
              value={p0}
              onChangeText={setP0}
              style={[styles.input, { color: Brand.text, borderColor: Brand.border }]}
            />

            <Text style={[styles.label, { color: Brand.text, marginTop: 12 }]}>Prompt: What I’m looking for</Text>
            <TextInput
              value={p1}
              onChangeText={setP1}
              style={[styles.input, { color: Brand.text, borderColor: Brand.border }]}
            />

            <Text style={[styles.label, { color: Brand.text, marginTop: 12 }]}>Prompt: You should know</Text>
            <TextInput
              value={p2}
              onChangeText={setP2}
              style={[styles.input, { color: Brand.text, borderColor: Brand.border }]}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={onSaveAndEnter}
              disabled={!canSave}
              style={[styles.primary, { backgroundColor: Brand.pink, opacity: canSave ? 1 : 0.45 }]}>
              <Text style={styles.primaryLabel}>Save & enter Spark</Text>
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
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { fontSize: 17 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  kicker: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  caption: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  textArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 120,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 22 },
  primary: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
