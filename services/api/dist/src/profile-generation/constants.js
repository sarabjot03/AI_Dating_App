"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFILE_GENERATION_JOB_STATUS = exports.PROFILE_REGENERATE_LIMIT_PER_DAY = exports.ALLOWED_PHOTO_MIME_TYPES = exports.PHOTO_AI_MAX_EDGE_PX = exports.PHOTO_CLIENT_MAX_WIDTH_PX = exports.PHOTO_MAX_UPLOAD_BYTES = exports.PROMPT_ANSWER_MAX_LENGTH = exports.PROMPT_ANSWER_MIN_LENGTH = exports.PROMPT_QUESTION_MAX_LENGTH = exports.PROMPT_QUESTION_MIN_LENGTH = exports.BIO_MAX_LENGTH = exports.BIO_MIN_LENGTH = exports.CAPTION_MAX_LENGTH = exports.PROMPT_COUNT = exports.PHOTOS_AI_SELECTED_COUNT = exports.PHOTOS_UPLOAD_COUNT = exports.PHOTOS_AI_SELECTED_MAX = exports.PHOTOS_UPLOAD_MAX = exports.PHOTOS_UPLOAD_MIN = exports.PROFILE_AI_SPEC_VERSION = void 0;
exports.photosToSelectFromUploadCount = photosToSelectFromUploadCount;
exports.PROFILE_AI_SPEC_VERSION = '1.0';
exports.PHOTOS_UPLOAD_MIN = 3;
exports.PHOTOS_UPLOAD_MAX = 10;
exports.PHOTOS_AI_SELECTED_MAX = 5;
exports.PHOTOS_UPLOAD_COUNT = exports.PHOTOS_UPLOAD_MAX;
exports.PHOTOS_AI_SELECTED_COUNT = exports.PHOTOS_AI_SELECTED_MAX;
function photosToSelectFromUploadCount(uploadedCount) {
    return Math.min(Math.max(0, uploadedCount), exports.PHOTOS_AI_SELECTED_MAX);
}
exports.PROMPT_COUNT = 3;
exports.CAPTION_MAX_LENGTH = 80;
exports.BIO_MIN_LENGTH = 40;
exports.BIO_MAX_LENGTH = 280;
exports.PROMPT_QUESTION_MIN_LENGTH = 10;
exports.PROMPT_QUESTION_MAX_LENGTH = 80;
exports.PROMPT_ANSWER_MIN_LENGTH = 20;
exports.PROMPT_ANSWER_MAX_LENGTH = 200;
exports.PHOTO_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
exports.PHOTO_CLIENT_MAX_WIDTH_PX = 1600;
exports.PHOTO_AI_MAX_EDGE_PX = 1024;
exports.ALLOWED_PHOTO_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
];
exports.PROFILE_REGENERATE_LIMIT_PER_DAY = 2;
exports.PROFILE_GENERATION_JOB_STATUS = {
    pending: 'pending',
    moderating: 'moderating',
    processing: 'processing',
    done: 'done',
    failed: 'failed',
};
//# sourceMappingURL=constants.js.map