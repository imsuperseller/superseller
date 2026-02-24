function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

let _env: ReturnType<typeof loadEnv> | null = null;

function loadEnv() {
  return {
    // Database
    DATABASE_URL: required("DATABASE_URL"),

    // Redis
    REDIS_URL: required("REDIS_URL"),

    // R2
    R2_ACCOUNT_ID: required("R2_ACCOUNT_ID"),
    R2_ACCESS_KEY_ID: required("R2_ACCESS_KEY_ID"),
    R2_SECRET_ACCESS_KEY: required("R2_SECRET_ACCESS_KEY"),
    R2_BUCKET_NAME: optional("R2_BUCKET_NAME", "winner-video-studio"),
    R2_PUBLIC_URL: optional("R2_PUBLIC_URL", ""),

    // kie.ai
    KIE_API_KEY: required("KIE_API_KEY"),
    KIE_BASE_URL: optional("KIE_BASE_URL", "https://api.kie.ai"),

    // WAHA
    WAHA_URL: required("WAHA_URL"),
    WAHA_API_KEY: required("WAHA_API_KEY"),
    WAHA_SESSION: optional("WAHA_SESSION", "rensto-whatsapp"),

    // Resend
    RESEND_API_KEY: required("RESEND_API_KEY"),
    RESEND_FROM: optional("RESEND_FROM", "Rensto Studio <studio@rensto.com>"),

    // App
    APP_URL: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3003"),
    CRON_SECRET: optional("CRON_SECRET", ""),
    CALLBACK_BASE_URL: optional("CALLBACK_BASE_URL", "http://localhost:3003"),
    INTERNAL_SECRET: optional("INTERNAL_SECRET", "winner-internal-2026"),
  };
}

export function getEnv() {
  if (!_env) _env = loadEnv();
  return _env;
}
