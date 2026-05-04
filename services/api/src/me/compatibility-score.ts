import raw from './data/compatibility-questionnaire-v1.json';

type ScaleDef = { min: number; max: number };

type QuestionJson =
  | { id: string; type: 'single'; weight: number; options: { label: string; value: number }[] }
  | { id: string; type: 'scale'; weight: number; scale: ScaleDef }
  | { id: string; type: 'multi'; weight: number; options: { label: string; value: string }[] };

type SectionJson = { id: string; title: string; weight: number; questions: QuestionJson[] };

type SchemaJson = { version: string; sections: SectionJson[] };

const SCHEMA = raw as SchemaJson;

export type StoredResponse =
  | { type: 'single'; value: number }
  | { type: 'scale'; value: number }
  | { type: 'multi'; values: string[] };

export type StoredQuestionnaire = {
  version?: string;
  responses: Record<string, StoredResponse | undefined>;
};

export type SectionPreview = {
  id: string;
  title: string;
  weight: number;
  /** 0–100 */
  score: number;
  /** 0–1 fraction of questions answered in this section */
  answeredRatio: number;
};

export type CompatibilityPreviewResult = {
  model: 'placeholder_v1';
  complete: boolean;
  /** 0–100, null if no questionnaire saved */
  overallScore: number | null;
  /** 0–100 share of questions answered */
  profileStrength: number | null;
  sections: SectionPreview[];
  disclaimer: string;
};

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function normalizeAnswer(q: QuestionJson, r: StoredResponse | undefined): number | null {
  if (!r || r.type !== q.type) return null;
  if (q.type === 'single') {
    return clamp01(r.value);
  }
  if (q.type === 'scale') {
    const { min, max } = q.scale;
    if (max === min) return null;
    return clamp01((r.value - min) / (max - min));
  }
  const n = r.values?.length ?? 0;
  return clamp01(1 - n * 0.22);
}

export function computeCompatibilityPreview(stored: StoredQuestionnaire | null): CompatibilityPreviewResult {
  const disclaimer =
    'This is a placeholder score from your own answers (not a match to another person yet). Real compatibility vs other users will ship with the discovery feed.';

  if (!stored || !stored.responses || typeof stored.responses !== 'object') {
    return {
      model: 'placeholder_v1',
      complete: false,
      overallScore: null,
      profileStrength: null,
      sections: [],
      disclaimer,
    };
  }

  const responses = stored.responses;
  let totalQuestions = 0;
  let answeredQuestions = 0;

  const sections: SectionPreview[] = [];
  let overallNum = 0;
  let overallDen = 0;

  for (const sec of SCHEMA.sections) {
    let num = 0;
    let den = 0;
    let answered = 0;
    for (const q of sec.questions) {
      totalQuestions += 1;
      const n = normalizeAnswer(q, responses[q.id]);
      if (n !== null) {
        answered += 1;
        answeredQuestions += 1;
        num += n * q.weight;
        den += q.weight;
      }
    }
    const answeredRatio = sec.questions.length ? answered / sec.questions.length : 0;
    const sectionScore01 = den > 0 ? num / den : 0.5;
    const score = Math.round(100 * sectionScore01);
    sections.push({
      id: sec.id,
      title: sec.title,
      weight: sec.weight,
      score,
      answeredRatio: Math.round(100 * answeredRatio) / 100,
    });
    overallNum += sectionScore01 * sec.weight;
    overallDen += sec.weight;
  }

  const overallScore =
    overallDen > 0 ? Math.round(100 * (overallNum / overallDen)) : null;
  const profileStrength =
    totalQuestions > 0 ? Math.round((100 * answeredQuestions) / totalQuestions) : null;
  const complete = totalQuestions > 0 && answeredQuestions === totalQuestions;

  return {
    model: 'placeholder_v1',
    complete,
    overallScore,
    profileStrength,
    sections,
    disclaimer,
  };
}
