/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_PROJECT_ID?: string;
  readonly VITE_LISTING_LIFECYCLE?: string;
  readonly VITE_MOATWAVE_PREVIEWS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
