declare class ProfilePromptDto {
    question: string;
    answer: string;
}
export declare class UpdateProfileDto {
    displayName: string;
    avatarDataUrl?: string | null;
    intent: string;
    city: string;
    energy: string;
    aboutLine: string;
    bio: string;
    prompts: ProfilePromptDto[];
    onboarded?: boolean;
    questionnaire?: unknown;
}
export {};
