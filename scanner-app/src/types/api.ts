/** Contrat d’authentification ticket — requête scan → API voyageur241 */

export type TicketVerifyRequest = {
  /** Identifiant brut lu dans le QR (URL, JSON, ou code TKT-…) */
  qrPayload: string;
  /** Numéro ticket extrait côté app si possible */
  ticketNumber?: string;
  /** Agent qui scanne */
  agentId: string;
  /** Horodatage ISO du scan */
  scannedAt: string;
  /** Device / canal */
  channel: 'ios' | 'android' | 'web';
  /** Version app scanner */
  appVersion: string;
};

/**
 * Réponse attendue de POST {VITE_API_BASE_URL}{VITE_API_TICKET_VERIFY_PATH}
 * L’API compare le payload scanné aux données métier et renvoie le verdict.
 */
export type TicketVerifyResponse = {
  ok: boolean;
  /** valid | already_scanned | invalid | pending | not_found | mismatch | unknown_qr */
  status: 'valid' | 'already_scanned' | 'invalid' | 'pending' | 'not_found' | 'mismatch' | 'unknown_qr';
  message?: string;
  reason?:
    | 'not_on_manifeste'
    | 'deleted'
    | 'not_found'
    | 'unknown_qr'
    | 'mismatch'
    | 'already_scanned'
    | 'wrong_agence';
  ticket?: {
    number: string;
    passengerName: string;
    route: string;
    origin?: string;
    destination?: string;
    travelDate: string;
    boardingTime: string;
    fare: string;
  };
  /** Champs qui ne matchent pas (si status = mismatch) */
  mismatches?: Array<'number' | 'passengerName' | 'route' | 'travelDate' | 'boardingTime' | 'fare'>;
  /** Référence serveur */
  verificationId?: string;
};
