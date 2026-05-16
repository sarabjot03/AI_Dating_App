"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeCompatibilityPreview = computeCompatibilityPreview;
exports.citiesMatch = citiesMatch;
exports.computePairCompatibilityScore = computePairCompatibilityScore;
exports.computeFeedMatchScore = computeFeedMatchScore;
const compatibility_questionnaire_v1_json_1 = __importDefault(require("./data/compatibility-questionnaire-v1.json"));
const SCHEMA = compatibility_questionnaire_v1_json_1.default;
function clamp01(n) {
    return Math.min(1, Math.max(0, n));
}
function normalizeAnswer(q, r) {
    if (!r)
        return null;
    if (q.type === 'single') {
        if (r.type !== 'single')
            return null;
        return clamp01(r.value);
    }
    if (q.type === 'scale') {
        if (r.type !== 'scale')
            return null;
        const { min, max } = q.scale;
        if (max === min)
            return null;
        return clamp01((r.value - min) / (max - min));
    }
    if (q.type === 'multi') {
        if (r.type !== 'multi')
            return null;
        const n = r.values.length;
        return clamp01(1 - n * 0.22);
    }
    return null;
}
function computeCompatibilityPreview(stored) {
    const disclaimer = 'Scores on Discover combine your questionnaire answers with distance (same city). Peer-to-peer matching uses the same model in v1.';
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
    const sections = [];
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
    const overallScore = overallDen > 0 ? Math.round(100 * (overallNum / overallDen)) : null;
    const profileStrength = totalQuestions > 0 ? Math.round((100 * answeredQuestions) / totalQuestions) : null;
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
function normalizeCity(city) {
    return (city ?? '').trim().toLowerCase();
}
function citiesMatch(cityA, cityB) {
    const a = normalizeCity(cityA);
    const b = normalizeCity(cityB);
    return a.length >= 2 && a === b;
}
function computePairCompatibilityScore(a, b) {
    if (!a?.responses || !b?.responses)
        return 72;
    let sum = 0;
    let count = 0;
    for (const sec of SCHEMA.sections) {
        for (const q of sec.questions) {
            const n1 = normalizeAnswer(q, a.responses[q.id]);
            const n2 = normalizeAnswer(q, b.responses[q.id]);
            if (n1 !== null && n2 !== null) {
                sum += 1 - Math.abs(n1 - n2);
                count += 1;
            }
        }
    }
    if (!count)
        return 72;
    const closeness = sum / count;
    return Math.round(55 + closeness * 40);
}
function computeFeedMatchScore(a, b, cityA, cityB) {
    const base = computePairCompatibilityScore(a, b);
    const sameCity = citiesMatch(cityA, cityB);
    const bonus = sameCity ? 5 : 0;
    return {
        matchPercent: Math.min(99, base + bonus),
        distanceLabel: sameCity ? 'Same city' : 'Different city',
    };
}
//# sourceMappingURL=compatibility-score.js.map