import { Capacitor } from '@capacitor/core';
import { clearAuthSession, getAuthToken } from '../context/AuthContext';
import { appConfig, ticketVerifyUrl } from '../config/env';
import type { TicketVerifyRequest, TicketVerifyResponse } from '../types/api';
import type { TicketInfo, TicketReason, TicketStatus } from '../types/ticket';
import { parseTicketPayload } from './ticketParser';
import { getPriorValidatedTicket, getScannedTickets, saveScannedTicket } from './scanHistory';

export type AuthResult = {
  ticket: TicketInfo;
  isDuplicate: boolean;
  fromApi: boolean;
};

function channel(): TicketVerifyRequest['channel'] {
  if (Capacitor.getPlatform() === 'ios') return 'ios';
  if (Capacitor.getPlatform() === 'android') return 'android';
  return 'web';
}

function mapApiStatus(status: TicketVerifyResponse['status']): TicketStatus {
  if (status === 'valid') return 'valid';
  if (status === 'already_scanned') return 'already_scanned';
  if (status === 'pending') return 'pending';
  if (status === 'not_found' || status === 'unknown_qr') return 'not_found';
  return 'invalid';
}

function emptyTripFields(): Pick<
  TicketInfo,
  'passengerName' | 'route' | 'travelDate' | 'boardingTime' | 'fare'
> {
  return {
    passengerName: '—',
    route: '—',
    travelDate: '—',
    boardingTime: '—',
    fare: '—',
  };
}

function mergeTicket(local: TicketInfo, api: TicketVerifyResponse): TicketInfo {
  const status = mapApiStatus(api.status);
  const reason = (api.reason ||
    (api.status === 'not_found'
      ? 'not_found'
      : api.status === 'unknown_qr'
        ? 'unknown_qr'
        : api.status === 'already_scanned'
          ? 'already_scanned'
          : api.status === 'mismatch'
            ? 'mismatch'
            : undefined)) as TicketReason | undefined;

  if (status === 'not_found' || reason === 'unknown_qr' || reason === 'not_found') {
    return {
      ...local,
      ...emptyTripFields(),
      number: api.ticket?.number || local.number,
      status: 'not_found',
      message: api.message || 'Ticket introuvable ou QR hors Voyageur241',
      reason: reason || 'not_found',
    };
  }

  if (reason === 'wrong_agence') {
    return {
      ...local,
      ...emptyTripFields(),
      number: api.ticket?.number || local.number,
      status: 'invalid',
      message: api.message || 'Ticket hors périmètre de votre agence',
      reason: 'wrong_agence',
    };
  }

  const t = api.ticket;
  return {
    ...local,
    number: t?.number || local.number,
    passengerName: t?.passengerName || local.passengerName,
    route: t?.route || local.route,
    origin: t?.origin || local.origin,
    destination: t?.destination || local.destination,
    travelDate: t?.travelDate || local.travelDate,
    boardingTime: t?.boardingTime || local.boardingTime,
    fare: t?.fare || local.fare,
    status,
    message: api.message,
    reason,
  };
}

async function verifyWithApi(
  rawPayload: string,
  local: TicketInfo,
  agentId: string,
): Promise<TicketVerifyResponse> {
  const token = getAuthToken();
  // Canal LAB (Railway JWT) : token obligatoire. Canal PROD (voyageur241.com) : sans JWT.
  if (appConfig.authMode === 'jwt' && !token) {
    return {
      ok: false,
      status: 'invalid',
      message: 'Session expirée — reconnectez-vous',
    };
  }

  const body: TicketVerifyRequest = {
    qrPayload: rawPayload,
    ticketNumber: local.number !== 'INCONNU' ? local.number : undefined,
    agentId,
    scannedAt: local.scannedAt,
    channel: channel(),
    appVersion: appConfig.version,
  };

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);

  try {
    // Minimal headers only — voyageur241.com Allow-Headers is narrow.
    // Never send X-Client-Origin (CORS preflight would fail).
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (appConfig.authMode === 'jwt' && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(ticketVerifyUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
      mode: 'cors',
      credentials: 'omit',
    });

    if (res.status === 401) {
      clearAuthSession();
      return {
        ok: false,
        status: 'invalid',
        message: 'Session expirée — reconnectez-vous',
      };
    }

    let data: TicketVerifyResponse | null = null;
    try {
      data = (await res.json()) as TicketVerifyResponse;
    } catch {
      data = null;
    }

    if (!res.ok) {
      return {
        ok: false,
        status: data?.status || 'invalid',
        message:
          data?.message ||
          `Contrôle API échoué (HTTP ${res.status}). Réessayez dans un instant.`,
        reason: data?.reason,
        ticket: data?.ticket,
      };
    }

    if (!data || typeof data !== 'object' || !data.status) {
      return {
        ok: false,
        status: 'invalid',
        message: 'Réponse API invalide ou vide. Réessayez.',
      };
    }

    return data;
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    const raw = err instanceof Error ? err.message : String(err ?? '');
    return {
      ok: false,
      status: 'invalid',
      message: aborted
        ? 'Délai dépassé — l’API voyageur241 ne répond pas.'
        : /Failed to fetch|NetworkError|Load failed|CORS/i.test(raw)
          ? 'Contrôle en base impossible (réseau / CORS). Vérifiez la connexion puis réessayez.'
          : `Contrôle en base impossible (${raw || 'erreur réseau'}).`,
    };
  } finally {
    window.clearTimeout(timer);
  }
}

export async function authenticateTicket(
  rawPayload: string,
  agentId = 'agent',
): Promise<AuthResult> {
  const local = parseTicketPayload(rawPayload);

  if (local.reason === 'unknown_qr') {
    await saveScannedTicket(local);
    return { ticket: local, isDuplicate: false, fromApi: false };
  }

  const prior = await getPriorValidatedTicket(local.number);
  const api = await verifyWithApi(rawPayload, local, agentId);
  let ticket = mergeTicket(local, api);

  // L’API prod ne persiste pas encore already_scanned : on refuse un 2e passage
  // si ce numéro a déjà été validé dans la session (historique local réel).
  const apiSaysDuplicate =
    api.status === 'already_scanned' || api.reason === 'already_scanned';
  const localDuplicate = Boolean(prior) && (ticket.status === 'valid' || apiSaysDuplicate);

  if (apiSaysDuplicate || localDuplicate) {
    const fiche = api.ticket || prior;
    ticket = {
      ...ticket,
      number: fiche?.number || ticket.number,
      passengerName: fiche?.passengerName || ticket.passengerName,
      route: fiche?.route || ticket.route,
      origin: fiche?.origin || ticket.origin,
      destination: fiche?.destination || ticket.destination,
      travelDate: fiche?.travelDate || ticket.travelDate,
      boardingTime: fiche?.boardingTime || ticket.boardingTime,
      fare: fiche?.fare || ticket.fare,
      status: 'already_scanned',
      reason: 'already_scanned',
      message: apiSaysDuplicate
        ? api.message || 'Ticket déjà contrôlé à l’embarquement'
        : 'Ticket déjà contrôlé à l’embarquement (session)',
    };
  }

  await saveScannedTicket(ticket);
  return {
    ticket,
    isDuplicate: ticket.status === 'already_scanned',
    fromApi: api.ok === true || Boolean(api.ticket) || apiSaysDuplicate,
  };
}

export async function getHistory(): Promise<TicketInfo[]> {
  return getScannedTickets();
}
