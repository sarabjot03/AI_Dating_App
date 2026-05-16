"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SAMPLE_QUESTIONNAIRE = {
    version: '1.0',
    responses: {
        kids: { type: 'single', value: 0.5 },
        religion_importance: { type: 'scale', value: 3 },
        relationship_goal: { type: 'single', value: 0.7 },
        career_ambition: { type: 'scale', value: 4 },
        sleep_type: { type: 'single', value: 0.5 },
        social_style: { type: 'single', value: 0.5 },
        drinking: { type: 'single', value: 0.5 },
        love_language: { type: 'single', value: 1 },
        deal_breakers: { type: 'multi', values: [] },
    },
};
const SEED_USERS = [
    {
        phoneE164: '+919999000001',
        displayName: 'Aisha',
        city: 'Bengaluru',
        intent: 'Serious Relationship',
        energy: 'Flexible',
        aboutLine: 'Filter kaapi, indie gigs, and slow Sundays.',
        bio: 'Filter kaapi, indie gigs, and slow Sundays.\n\nBased in Bengaluru. Looking for: Serious Relationship.',
    },
    {
        phoneE164: '+919999000002',
        displayName: 'Rohan',
        city: 'Bengaluru',
        intent: 'Marriage',
        energy: 'Early Bird',
        aboutLine: 'Trail runs, dosa maps, and building things that last.',
        bio: 'Trail runs, dosa maps, and building things that last.\n\nBased in Bengaluru.',
    },
    {
        phoneE164: '+919999000003',
        displayName: 'Meera',
        city: 'Mumbai',
        intent: 'Serious Relationship',
        energy: 'Night Owl',
        aboutLine: 'Art walks, monsoon chai, and honest conversations.',
        bio: 'Art walks, monsoon chai, and honest conversations.\n\nBased in Mumbai.',
    },
    {
        phoneE164: '+919999000004',
        displayName: 'Vikram',
        city: 'Bengaluru',
        intent: 'Serious Relationship',
        energy: 'Flexible',
        aboutLine: 'Cricket stats nerd who still makes time for sunsets.',
        bio: 'Cricket stats nerd who still makes time for sunsets.\n\nBased in Bengaluru.',
    },
    {
        phoneE164: '+919999000005',
        displayName: 'Priya',
        city: 'Delhi',
        intent: 'Marriage',
        energy: 'Early Bird',
        aboutLine: 'Books, street food, and plans that turn into adventures.',
        bio: 'Books, street food, and plans that turn into adventures.\n\nBased in Delhi.',
    },
];
async function main() {
    const now = new Date();
    for (const u of SEED_USERS) {
        await prisma.user.upsert({
            where: { phoneE164: u.phoneE164 },
            create: {
                phoneE164: u.phoneE164,
                displayName: u.displayName,
                city: u.city,
                intent: u.intent,
                energy: u.energy,
                aboutLine: u.aboutLine,
                bio: u.bio,
                promptsJson: [
                    { question: 'Kids & long-term', answer: 'Open to the right path' },
                    { question: 'Love language', answer: 'Quality time' },
                    { question: 'Deal breakers', answer: 'Dishonesty' },
                ],
                questionnaireJson: SAMPLE_QUESTIONNAIRE,
                onboardedAt: now,
                isSeed: true,
            },
            update: {
                displayName: u.displayName,
                city: u.city,
                intent: u.intent,
                energy: u.energy,
                aboutLine: u.aboutLine,
                bio: u.bio,
                questionnaireJson: SAMPLE_QUESTIONNAIRE,
                onboardedAt: now,
                isSeed: true,
            },
        });
    }
    console.log(`Seeded ${SEED_USERS.length} demo profiles (isSeed=true).`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map