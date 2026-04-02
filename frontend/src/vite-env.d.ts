/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_USE_REMOTE_API: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ANALYTICS_ENDPOINT: string;
  readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
