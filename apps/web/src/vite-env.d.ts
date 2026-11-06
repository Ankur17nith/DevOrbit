/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_DEMO?: string;
  readonly VITE_DEMO_USER?: string;
  readonly VITE_DEMO_PASSWORD?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
