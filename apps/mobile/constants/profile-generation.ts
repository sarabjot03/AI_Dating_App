/**
 * Phase 0 product rules — keep in sync with docs/profile-ai-phase-0.md
 * and services/api/src/profile-generation/constants.ts
 */

export const PROFILE_AI_SPEC_VERSION = '1.0' as const;

export const PHOTOS_UPLOAD_MIN = 3;
export const PHOTOS_UPLOAD_MAX = 10;
export const PHOTOS_AI_SELECTED_MAX = 5;
export const PROMPT_COUNT = 3;

export function photosToSelectFromUploadCount(uploadedCount: number): number {
  return Math.min(Math.max(0, uploadedCount), PHOTOS_AI_SELECTED_MAX);
}

export const CAPTION_MAX_LENGTH = 80;

export const BIO_MIN_LENGTH = 40;
export const BIO_MAX_LENGTH = 280;

export const PROMPT_ANSWER_MIN_LENGTH = 20;
export const PROMPT_ANSWER_MAX_LENGTH = 200;

export const PHOTO_CLIENT_MAX_WIDTH_PX = 1600;
export const PHOTO_CLIENT_JPEG_QUALITY = 0.85;

/** Copy shown on photo upload screen. */
export const PHOTO_UPLOAD_COPY = {
  title: 'Your photos',
  subtitle: `Add ${PHOTOS_UPLOAD_MIN}–${PHOTOS_UPLOAD_MAX} photos of you. Our AI will pick your best shots (up to ${PHOTOS_AI_SELECTED_MAX}), write captions, and build your profile from your questionnaire.`,
  rules: [
    'Clear photos of you (face visible in most shots)',
    'No nudity, hate, or illegal content',
    'Mix of close-ups and full-body / activity shots',
  ],
  generateCta: 'Generate my profile',
  generateHint: (count: number) =>
    count < PHOTOS_UPLOAD_MIN
      ? `Add at least ${PHOTOS_UPLOAD_MIN} photos to continue`
      : count >= PHOTOS_UPLOAD_MAX
        ? 'Maximum photos added'
        : `${count} of ${PHOTOS_UPLOAD_MAX} photos`,
  buildingTitle: 'Building your profile',
  buildingSubtitle: 'Choosing your best photos and writing your bio…',
} as const;

export type ProfileAiDraft = {
  specVersion: typeof PROFILE_AI_SPEC_VERSION;
  selectedPhotoIds: string[];
  prompts: { question: string; answer: string }[];
  photoCaptions: Record<string, string>;
  bio: string;
};
