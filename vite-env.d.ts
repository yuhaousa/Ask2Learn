/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_BYTEDANCE_API_KEY: string;
  readonly VITE_BYTEDANCE_BASE_URL: string;
  readonly VITE_BYTEDANCE_MODEL_ID: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
