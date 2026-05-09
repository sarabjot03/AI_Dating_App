import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchMyProfile, upsertMyProfile } from '@/lib/profile-api';
import { useAuth } from '@/contexts/auth-context';
import {
  buildProfileFromAnswers as buildProfileFromQuestionnaire,
  legacyStringsToQuestionnaireAnswers,
  parseStoredQuestionnaireAnswers,
  type QuestionnaireAnswers,
} from '@/lib/compatibility-questionnaire';

const KEY_COMPLETE = '@spark/onboarding_complete';
const KEY_ANSWERS = '@spark/questionnaire_answers';
const KEY_PROFILE = '@spark/profile_draft';

export type ProfileDraft = {
  bio: string;
  prompts: { question: string; answer: string }[];
};

export type { QuestionnaireAnswers };

type RemoteProfilePayload = {
  answers: QuestionnaireAnswers;
  profileDraft: ProfileDraft;
  onboarded: boolean;
};

type OnboardingContextValue = {
  isReady: boolean;
  isComplete: boolean;
  answers: QuestionnaireAnswers | null;
  profileDraft: ProfileDraft | null;
  setAnswers: (a: QuestionnaireAnswers) => Promise<void>;
  setProfileDraft: (p: ProfileDraft) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  saveToServer: (payload: RemoteProfilePayload) => Promise<void>;
  reopenQuestionnaire: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

/** Public helper for profile preview screen. */
export function buildProfileFromAnswers(a: QuestionnaireAnswers): ProfileDraft {
  const built = buildProfileFromQuestionnaire(a);
  return { bio: built.bio, prompts: built.prompts };
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady: authReady } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswersState] = useState<QuestionnaireAnswers | null>(null);
  const [profileDraft, setProfileDraftState] = useState<ProfileDraft | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, a, p] = await Promise.all([
          AsyncStorage.getItem(KEY_COMPLETE),
          AsyncStorage.getItem(KEY_ANSWERS),
          AsyncStorage.getItem(KEY_PROFILE),
        ]);
        if (cancelled) return;
        setIsComplete(c === '1');
        const parsed = parseStoredQuestionnaireAnswers(a);
        if (parsed) setAnswersState(parsed);
        if (p) setProfileDraftState(JSON.parse(p) as ProfileDraft);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setAnswers = useCallback(async (next: QuestionnaireAnswers) => {
    setAnswersState(next);
    await AsyncStorage.setItem(KEY_ANSWERS, JSON.stringify(next));
  }, []);

  const setProfileDraft = useCallback(async (next: ProfileDraft) => {
    setProfileDraftState(next);
    await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(next));
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(KEY_COMPLETE, '1');
    setIsComplete(true);
  }, []);

  const saveToServer = useCallback(async (payload: RemoteProfilePayload) => {
    const derived = buildProfileFromQuestionnaire(payload.answers);
    await upsertMyProfile({
      displayName: payload.answers.displayName.trim(),
      intent: derived.intent,
      city: derived.city,
      energy: derived.energy,
      aboutLine: derived.aboutLine,
      bio: payload.profileDraft.bio,
      prompts: payload.profileDraft.prompts,
      questionnaire: {
        version: payload.answers.version,
        responses: payload.answers.responses,
      },
      onboarded: payload.onboarded,
    });
  }, []);

  const reopenQuestionnaire = useCallback(async () => {
    await AsyncStorage.removeItem(KEY_COMPLETE);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (!authReady || !isAuthenticated || !isReady) return;

    let cancelled = false;
    (async () => {
      try {
        const profile = await fetchMyProfile();
        if (cancelled || !profile || !profile.onboardedAt) return;
        if (!profile.bio || !profile.prompts || profile.prompts.length === 0) return;

        let remoteAnswers: QuestionnaireAnswers | null = null;
        if (
          profile.questionnaire &&
          typeof profile.questionnaire === 'object' &&
          profile.questionnaire !== null &&
          'responses' in profile.questionnaire
        ) {
          const pack = profile.questionnaire as {
            version?: string;
            responses: QuestionnaireAnswers['responses'];
          };
          if (profile.city && profile.aboutLine) {
            const dn = profile.displayName?.trim();
            remoteAnswers = {
              version: pack.version ?? '1.0',
              responses: pack.responses,
              displayName: dn && dn.length >= 2 ? dn : 'Friend',
              city: profile.city,
              aboutLine: profile.aboutLine,
            };
          }
        } else if (
          profile.intent &&
          profile.city &&
          profile.energy &&
          profile.aboutLine
        ) {
          remoteAnswers = {
            ...legacyStringsToQuestionnaireAnswers({
              intent: profile.intent,
              city: profile.city,
              energy: profile.energy,
              aboutLine: profile.aboutLine,
            }),
            displayName: profile.displayName?.trim() || 'Friend',
          };
        }

        if (!remoteAnswers) return;

        const remoteDraft: ProfileDraft = {
          bio: profile.bio,
          prompts: profile.prompts,
        };

        setAnswersState(remoteAnswers);
        setProfileDraftState(remoteDraft);
        setIsComplete(true);
        await AsyncStorage.multiSet([
          [KEY_ANSWERS, JSON.stringify(remoteAnswers)],
          [KEY_PROFILE, JSON.stringify(remoteDraft)],
          [KEY_COMPLETE, '1'],
        ]);
      } catch {
        // Best-effort hydration; local onboarding remains fallback.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, isAuthenticated, isReady]);

  const value = useMemo(
    () => ({
      isReady,
      isComplete,
      answers,
      profileDraft,
      setAnswers,
      setProfileDraft,
      completeOnboarding,
      saveToServer,
      reopenQuestionnaire,
    }),
    [
      answers,
      completeOnboarding,
      isComplete,
      isReady,
      profileDraft,
      reopenQuestionnaire,
      saveToServer,
      setAnswers,
      setProfileDraft,
    ],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
