/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TICKET_VERIFY_PATH: string;
  readonly VITE_CORS_ORIGIN: string;
  readonly VITE_APP_VERSION: string;
  /** prod = voyageur241.com | lab = Railway simulation */
  readonly VITE_APP_CHANNEL: 'prod' | 'lab';
  /** agent = session locale (prod) | jwt = login Railway (lab) */
  readonly VITE_AUTH_MODE: 'agent' | 'jwt';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
