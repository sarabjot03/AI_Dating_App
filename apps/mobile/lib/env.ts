import { z } from 'zod';

const envSchema = z
  .object({
    EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']).default('development'),
    EXPO_PUBLIC_API_URL: z.string().url(),
  })
  .superRefine((data, ctx) => {
    if (data.EXPO_PUBLIC_APP_ENV === 'production' && !data.EXPO_PUBLIC_API_URL.startsWith('https://')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'EXPO_PUBLIC_API_URL must use https in production',
        path: ['EXPO_PUBLIC_API_URL'],
      });
    }
  });

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000',
  });
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  cached = parsed.data;
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log(
      '[env] API base URL →',
      cached.EXPO_PUBLIC_API_URL,
      '(full path example:',
      `${cached.EXPO_PUBLIC_API_URL}/v1/health)`,
    );
  }
  return cached;
}
