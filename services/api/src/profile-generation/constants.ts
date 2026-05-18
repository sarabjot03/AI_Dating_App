/**
 * Phase 0 product rules — keep in sync with docs/profile-ai-phase-0.md
 * and apps/mobile/constants/profile-generation.ts
 */

export const PROFILE_AI_SPEC_VERSION = '1.0' as const;

/** Minimum photos before AI generation can run. */
export const PHOTOS_UPLOAD_MIN = 3;

/** Maximum photos per profile upload session. */
export const PHOTOS_UPLOAD_MAX = 10;

/** AI selects at most this many photos for the public profile. */
export const PHOTOS_AI_SELECTED_MAX = 5;

/** @deprecated Use PHOTOS_UPLOAD_MAX — kept for older imports */
export const PHOTOS_UPLOAD_COUNT = PHOTOS_UPLOAD_MAX;

/** @deprecated Use PHOTOS_AI_SELECTED_MAX */
export const PHOTOS_AI_SELECTED_COUNT = PHOTOS_AI_SELECTED_MAX;

/** How many photos the AI should pick given how many the user uploaded. */
export function photosToSelectFromUploadCount(uploadedCount: number): number {
  return Math.min(Math.max(0, uploadedCount), PHOTOS_AI_SELECTED_MAX);
}

/** Hinge-style prompts generated from questionnaire. */
export const PROMPT_COUNT = 3;

export const CAPTION_MAX_LENGTH = 80;

export const BIO_MIN_LENGTH = 40;
export const BIO_MAX_LENGTH = 280;

export const PROMPT_QUESTION_MIN_LENGTH = 10;
export const PROMPT_QUESTION_MAX_LENGTH = 80;
export const PROMPT_ANSWER_MIN_LENGTH = 20;
export const PROMPT_ANSWER_MAX_LENGTH = 200;

/** Server accepts up to this per file at storage (bytes). */
export const PHOTO_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Client should resize to this max width before upload. */
export const PHOTO_CLIENT_MAX_WIDTH_PX = 1600;

/** Thumbnails sent to vision model (max edge). */
export const PHOTO_AI_MAX_EDGE_PX = 1024;

export const ALLOWED_PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
] as const;

export type AllowedPhotoMimeType = (typeof ALLOWED_PHOTO_MIME_TYPES)[number];

/** Max profile regenerations per user per rolling 24h. */
export const PROFILE_REGENERATE_LIMIT_PER_DAY = 2;

export const PROFILE_GENERATION_JOB_STATUS = {
  pending: 'pending',
  moderating: 'moderating',
  processing: 'processing',
  done: 'done',
  failed: 'failed',
} as const;

export type ProfileGenerationJobStatus =
  (typeof PROFILE_GENERATION_JOB_STATUS)[keyof typeof PROFILE_GENERATION_JOB_STATUS];

/** Shape returned to mobile on successful generation (preview screen). */
export type ProfileAiDraft = {
  specVersion: typeof PROFILE_AI_SPEC_VERSION;
  selectedPhotoIds: string[];
  prompts: { question: string; answer: string }[];
  photoCaptions: Record<string, string>;
  bio: string;
};
