import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY_COMPLETE = '@spark/onboarding_complete';
const KEY_ANSWERS = '@spark/questionnaire_answers';
const KEY_PROFILE = '@spark/profile_draft';

export type QuestionnaireAnswers = {
  intent: string;
  city: string;
  energy: string;
  aboutLine: string;
};

export type ProfileDraft = {
  bio: string;
  prompts: { question: string; answer: string }[];
};

type OnboardingContextValue = {
  isReady: boolean;
  isComplete: boolean;
  answers: QuestionnaireAnswers | null;
  profileDraft: ProfileDraft | null;
  setAnswers: (a: QuestionnaireAnswers) => Promise<void>;
  setProfileDraft: (p: ProfileDraft) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  /** Re-open questionnaire from Settings (keeps profile until they save again). */
  reopenQuestionnaire: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function buildProfileFromAnswers(a: QuestionnaireAnswers): ProfileDraft {
  const bio = `${a.aboutLine.trim()}\n\nBased in ${a.city.trim()}. ${a.intent} — ${a.energy}.`;
  return {
    bio: bio.trim(),
    prompts: [
      {
        question: 'Typical Sunday',
        answer: a.energy.includes('Morning')
          ? 'Slow coffee, a walk, and something low-key.'
          : a.energy.includes('Evening')
            ? 'Late brunch, friends, maybe a gig or a film.'
            : 'Exploring the city or a quick getaway when I can.',
      },
      {
        question: 'What I’m looking for',
        answer: a.intent,
      },
      {
        question: 'You should know',
        answer: `I’m rooted in ${a.city.trim()} and value honest conversation.`,
      },
    ],
  };
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
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
        if (a) setAnswersState(JSON.parse(a) as QuestionnaireAnswers);
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

  const reopenQuestionnaire = useCallback(async () => {
    await AsyncStorage.removeItem(KEY_COMPLETE);
    setIsComplete(false);
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      isComplete,
      answers,
      profileDraft,
      setAnswers,
      setProfileDraft,
      completeOnboarding,
      reopenQuestionnaire,
    }),
    [answers, completeOnboarding, isComplete, isReady, profileDraft, reopenQuestionnaire, setAnswers, setProfileDraft],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
