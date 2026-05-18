export declare const PROFILE_AI_SPEC_VERSION: "1.0";
export declare const PHOTOS_UPLOAD_MIN = 3;
export declare const PHOTOS_UPLOAD_MAX = 10;
export declare const PHOTOS_AI_SELECTED_MAX = 5;
export declare const PHOTOS_UPLOAD_COUNT = 10;
export declare const PHOTOS_AI_SELECTED_COUNT = 5;
export declare function photosToSelectFromUploadCount(uploadedCount: number): number;
export declare const PROMPT_COUNT = 3;
export declare const CAPTION_MAX_LENGTH = 80;
export declare const BIO_MIN_LENGTH = 40;
export declare const BIO_MAX_LENGTH = 280;
export declare const PROMPT_QUESTION_MIN_LENGTH = 10;
export declare const PROMPT_QUESTION_MAX_LENGTH = 80;
export declare const PROMPT_ANSWER_MIN_LENGTH = 20;
export declare const PROMPT_ANSWER_MAX_LENGTH = 200;
export declare const PHOTO_MAX_UPLOAD_BYTES: number;
export declare const PHOTO_CLIENT_MAX_WIDTH_PX = 1600;
export declare const PHOTO_AI_MAX_EDGE_PX = 1024;
export declare const ALLOWED_PHOTO_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/heic", "image/heif"];
export type AllowedPhotoMimeType = (typeof ALLOWED_PHOTO_MIME_TYPES)[number];
export declare const PROFILE_REGENERATE_LIMIT_PER_DAY = 2;
export declare const PROFILE_GENERATION_JOB_STATUS: {
    readonly pending: "pending";
    readonly moderating: "moderating";
    readonly processing: "processing";
    readonly done: "done";
    readonly failed: "failed";
};
export type ProfileGenerationJobStatus = (typeof PROFILE_GENERATION_JOB_STATUS)[keyof typeof PROFILE_GENERATION_JOB_STATUS];
export type ProfileAiDraft = {
    specVersion: typeof PROFILE_AI_SPEC_VERSION;
    selectedPhotoIds: string[];
    prompts: {
        question: string;
        answer: string;
    }[];
    photoCaptions: Record<string, string>;
    bio: string;
};
