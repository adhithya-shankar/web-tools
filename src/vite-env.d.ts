/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_MOCK_SERVER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
