/**
 * Config runtime (Vite env).
 * Côté API voyageur241, autoriser l’origine VITE_CORS_ORIGIN dans Access-Control-Allow-Origin.
 *
 * Canaux :
 * - prod  → API https://voyageur241.com (pas de simulation) — Vercel production
 * - lab   → API Railway + JWT + fixtures — branche lab/railway-simulation uniquement
 */

export type AppChannel = 'prod' | 'lab';
export type AuthMode = 'agent' | 'jwt';

function normalizeChannel(raw: string | undefined): AppChannel {
  return raw === 'lab' ? 'lab' : 'prod';
}

function normalizeAuthMode(raw: string | undefined, channel: AppChannel): AuthMode {
  if (raw === 'jwt' || raw === 'agent') return raw;
  return channel === 'lab' ? 'jwt' : 'agent';
}

const channel = normalizeChannel(import.meta.env.VITE_APP_CHANNEL);
const authMode = normalizeAuthMode(import.meta.env.VITE_AUTH_MODE, channel);
const version = import.meta.env.VITE_APP_VERSION || (channel === 'lab' ? '0.2.0-lab' : '0.2.0-stable');

export const appConfig = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || 'https://voyageur241.com').replace(/\/$/, ''),
  ticketVerifyPath: import.meta.env.VITE_API_TICKET_VERIFY_PATH || '/api/v1/tickets/verify',
  corsOrigin: import.meta.env.VITE_CORS_ORIGIN || window.location.origin,
  version,
  channel,
  authMode,
  /** Libellé UI : PROD · v0.2.0-stable | LAB · v0.2.0-lab */
  versionLabel: `${channel === 'lab' ? 'LAB' : 'PROD'} · v${version}`,
  isProd: channel === 'prod',
  isLab: channel === 'lab',
} as const;

export function ticketVerifyUrl(): string {
  const path = appConfig.ticketVerifyPath.startsWith('/')
    ? appConfig.ticketVerifyPath
    : `/${appConfig.ticketVerifyPath}`;
  return `${appConfig.apiBaseUrl}${path}`;
}
