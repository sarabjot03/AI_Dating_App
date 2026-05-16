export type StoredResponse = {
    type: 'single';
    value: number;
} | {
    type: 'scale';
    value: number;
} | {
    type: 'multi';
    values: string[];
};
export type StoredQuestionnaire = {
    version?: string;
    responses: Record<string, StoredResponse | undefined>;
};
export type SectionPreview = {
    id: string;
    title: string;
    weight: number;
    score: number;
    answeredRatio: number;
};
export type CompatibilityPreviewResult = {
    model: 'placeholder_v1';
    complete: boolean;
    overallScore: number | null;
    profileStrength: number | null;
    sections: SectionPreview[];
    disclaimer: string;
};
export declare function computeCompatibilityPreview(stored: StoredQuestionnaire | null): CompatibilityPreviewResult;
export declare function citiesMatch(cityA: string | null | undefined, cityB: string | null | undefined): boolean;
export declare function computePairCompatibilityScore(a: StoredQuestionnaire | null, b: StoredQuestionnaire | null): number;
export declare function computeFeedMatchScore(a: StoredQuestionnaire | null, b: StoredQuestionnaire | null, cityA: string | null | undefined, cityB: string | null | undefined): {
    matchPercent: number;
    distanceLabel: string;
};
