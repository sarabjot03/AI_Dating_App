import questionnaireSchema from '@/constants/compatibility-questionnaire.json';

export type QSingleOption = { label: string; value: number };
export type QMultiOption = { label: string; value: string };

export type QuestionDef =
  | {
      id: string;
      type: 'single';
      question: string;
      weight: number;
      options: QSingleOption[];
    }
  | {
      id: string;
      type: 'scale';
      question: string;
      weight: number;
      scale: { min: number; max: number };
    }
  | {
      id: string;
      type: 'multi';
      question: string;
      weight: number;
      options: QMultiOption[];
    };

export type SectionDef = {
  id: string;
  title: string;
  weight: number;
  questions: QuestionDef[];
};

export type QuestionnaireSchema = {
  version: string;
  sections: SectionDef[];
};

export const COMPATIBILITY_SCHEMA = questionnaireSchema as QuestionnaireSchema;

export type QResponseSingle = { type: 'single'; value: number };
export type QResponseScale = { type: 'scale'; value: number };
export type QResponseMulti = { type: 'multi'; values: string[] };
export type QResponse = QResponseSingle | QResponseScale | QResponseMulti;

/** Full questionnaire answers + basics used for profile text and API legacy fields. */
export type QuestionnaireAnswers = {
  version: string;
  responses: Record<string, QResponse>;
  /** Shown on profile and discover cards (synced to server as displayName). */
  displayName: string;
  city: string;
  aboutLine: string;
};

export type FlatQuestion = {
  sectionId: string;
  sectionTitle: string;
  question: QuestionDef;
};

export function flattenQuestions(schema: QuestionnaireSchema = COMPATIBILITY_SCHEMA): FlatQuestion[] {
  const out: FlatQuestion[] = [];
  for (const section of schema.sections) {
    for (const q of section.questions) {
      out.push({ sectionId: section.id, sectionTitle: section.title, question: q });
    }
  }
  return out;
}

export function findQuestion(id: string): QuestionDef | undefined {
  for (const s of COMPATIBILITY_SCHEMA.sections) {
    const q = s.questions.find((x) => x.id === id);
    if (q) return q;
  }
  return undefined;
}

export function labelForSingle(questionId: string, value: number): string {
  const q = findQuestion(questionId);
  if (!q || q.type !== 'single') return String(value);
  const opt = q.options.find((o) => o.value === value);
  return opt?.label ?? String(value);
}

export function labelsForMulti(questionId: string, values: string[]): string {
  const q = findQuestion(questionId);
  if (!q || q.type !== 'multi') return values.join(', ');
  return values
    .map((v) => q.options.find((o) => o.value === v)?.label ?? v)
    .join(', ');
}

function reverseLookupSingle(questionId: string, label: string): number | undefined {
  const q = findQuestion(questionId);
  if (!q || q.type !== 'single') return undefined;
  const lower = label.trim().toLowerCase();
  const opt = q.options.find((o) => o.label.trim().toLowerCase() === lower);
  return opt?.value;
}

/** Best-effort map from legacy profile strings (pre-questionnaire JSON) for hydration. */
export function legacyStringsToQuestionnaireAnswers(p: {
  intent: string;
  city: string;
  energy: string;
  aboutLine: string;
}): QuestionnaireAnswers {
  const responses: Record<string, QResponse> = {};
  const rg = reverseLookupSingle('relationship_goal', p.intent);
  if (rg !== undefined) responses.relationship_goal = { type: 'single', value: rg };
  const st = reverseLookupSingle('sleep_type', p.energy);
  if (st !== undefined) responses.sleep_type = { type: 'single', value: st };
  return {
    version: COMPATIBILITY_SCHEMA.version,
    responses,
    displayName: 'Friend',
    city: p.city,
    aboutLine: p.aboutLine,
  };
}

function isLegacyAnswers(raw: unknown): raw is {
  intent: string;
  city: string;
  energy: string;
  aboutLine: string;
} {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return (
    typeof o.intent === 'string' &&
    typeof o.city === 'string' &&
    typeof o.energy === 'string' &&
    typeof o.aboutLine === 'string' &&
    !('responses' in o)
  );
}

/** Migrate old AsyncStorage shape; returns null if unusable. */
export function parseStoredQuestionnaireAnswers(raw: string | null): QuestionnaireAnswers | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isLegacyAnswers(parsed)) {
      return null;
    }
    const o = parsed as Partial<QuestionnaireAnswers>;
    if (
      typeof o.version === 'string' &&
      o.responses &&
      typeof o.responses === 'object' &&
      typeof o.city === 'string' &&
      typeof o.aboutLine === 'string'
    ) {
      const dn = typeof o.displayName === 'string' ? o.displayName.trim() : '';
      return {
        ...(o as QuestionnaireAnswers),
        displayName: dn.length >= 2 ? dn : 'Friend',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function buildProfileFromAnswers(a: QuestionnaireAnswers): {
  bio: string;
  prompts: { question: string; answer: string }[];
  /** Maps to legacy API string fields */
  intent: string;
  city: string;
  energy: string;
  aboutLine: string;
} {
  const intent = labelForSingle('relationship_goal', (a.responses.relationship_goal as QResponseSingle)?.value ?? 0);
  const energy = labelForSingle('sleep_type', (a.responses.sleep_type as QResponseSingle)?.value ?? 0);
  const kids = labelForSingle('kids', (a.responses.kids as QResponseSingle)?.value ?? 0);
  const love = labelForSingle('love_language', (a.responses.love_language as QResponseSingle)?.value ?? 0);
  const dealRaw = (a.responses.deal_breakers as QResponseMulti | undefined)?.values ?? [];
  const dealLabels = labelsForMulti('deal_breakers', dealRaw);
  const dealText = dealRaw.length ? dealLabels : 'No hard deal-breakers selected yet.';

  const bio = `${a.aboutLine.trim()}\n\nBased in ${a.city.trim()}. Looking for: ${intent}. Day-to-day rhythm: ${energy}.`;

  return {
    intent,
    city: a.city.trim(),
    energy,
    aboutLine: a.aboutLine.trim(),
    bio: bio.trim(),
    prompts: [
      { question: 'Kids & long-term', answer: kids },
      { question: 'Love language', answer: love },
      { question: 'Deal breakers', answer: dealText },
    ],
  };
}
