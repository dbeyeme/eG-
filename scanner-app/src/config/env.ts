/**
 * Config runtime (Vite env).
 * Côté API voyageur241, autoriser l’origine VITE_CORS_ORIGIN dans Access-Control-Allow-Origin.
 */
export const appConfig = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || 'https://voyageur241.com').replace(/\/$/, ''),
  ticketVerifyPath: import.meta.env.VITE_API_TICKET_VERIFY_PATH || '/api/v1/tickets/verify',
  corsOrigin: import.meta.env.VITE_CORS_ORIGIN || window.location.origin,
  version: import.meta.env.VITE_APP_VERSION || '0.2.0',
} as const;

export function ticketVerifyUrl(): string {
  const path = appConfig.ticketVerifyPath.startsWith('/')
    ? appConfig.ticketVerifyPath
    : `/${appConfig.ticketVerifyPath}`;
  return `${appConfig.apiBaseUrl}${path}`;
}
