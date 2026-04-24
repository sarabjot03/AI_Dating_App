import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api';
import { sendOtp, verifyOtp } from '@/lib/auth-api';
import { Brand } from '@/constants/theme';

type Step = 'phone' | 'otp';

function errorMessage(err: unknown): string {
  if (err instanceof ApiError && err.body && typeof err.body === 'object' && err.body !== null) {
    const m = err.body as { message?: string | string[] };
    if (Array.isArray(m.message)) return m.message.join(', ');
    if (typeof m.message === 'string') return m.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Try again.';
}

export default function PhoneScreen() {
  const { setSessionFromTokens } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSendOtp() {
    setError(null);
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep('otp');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function onVerify() {
    setError(null);
    setLoading(true);
    try {
      const tokens = await verifyOtp(phone, code);
      await setSessionFromTokens(tokens.accessToken, tokens.refreshToken);
      router.replace('/');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.safeWrap}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={[styles.safe, { backgroundColor: Brand.background }]}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                if (step === 'otp') {
                  setStep('phone');
                  setCode('');
                  setError(null);
                } else {
                  router.back();
                }
              }}
              hitSlop={12}>
              <Text style={[styles.back, { color: Brand.pink }]}>Back</Text>
            </Pressable>
          </View>
          <View style={styles.body}>
            {step === 'phone' ? (
              <>
                <Text style={[styles.title, { color: Brand.text }]}>Enter your number</Text>
                <Text style={[styles.caption, { color: Brand.textSecondary }]}>
                  We’ll text a one-time code. In development, the code is printed in the API server logs.
                </Text>
                <View style={[styles.field, { borderColor: Brand.border }]}>
                  <Text style={[styles.prefix, { color: Brand.text }]}>+91</Text>
                  <TextInput
                    value={phone}
                    onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                    keyboardType="phone-pad"
                    placeholder="98765 43210"
                    placeholderTextColor={Brand.textMuted}
                    style={[styles.input, { color: Brand.text }]}
                    maxLength={10}
                    autoComplete="tel-national"
                    textContentType="telephoneNumber"
                    editable={!loading}
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.title, { color: Brand.text }]}>Enter the code</Text>
                <Text style={[styles.caption, { color: Brand.textSecondary }]}>
                  Sent to +91 {phone}. Check the terminal running the API for the OTP in dev mode.
                </Text>
                <TextInput
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  placeholder="000000"
                  placeholderTextColor={Brand.textMuted}
                  style={[styles.otpField, { color: Brand.text, borderColor: Brand.border }]}
                  maxLength={6}
                  editable={!loading}
                  autoFocus
                />
              </>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
          <View style={styles.footer}>
            {step === 'phone' ? (
              <Pressable
                style={[
                  styles.primary,
                  { backgroundColor: Brand.pink, opacity: phone.length === 10 && !loading ? 1 : 0.5 },
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  void onSendOtp();
                }}
                disabled={phone.length !== 10 || loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryLabel}>Send OTP</Text>
                )}
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.primary,
                  { backgroundColor: Brand.pink, opacity: code.length === 6 && !loading ? 1 : 0.5 },
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  void onVerify();
                }}
                disabled={code.length !== 6 || loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryLabel}>Verify & continue</Text>
                )}
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeWrap: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { fontSize: 17 },
  body: { flex: 1, paddingHorizontal: 24, gap: 16, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '700' },
  caption: { fontSize: 15, lineHeight: 22 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 8,
  },
  otpField: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    letterSpacing: 4,
    textAlign: 'center',
  },
  prefix: { fontSize: 17, fontWeight: '600' },
  input: { flex: 1, fontSize: 17, paddingVertical: 12 },
  footer: { paddingHorizontal: 24, paddingBottom: 22 },
  primary: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
  error: { color: '#c62828', fontSize: 14, lineHeight: 20 },
});
