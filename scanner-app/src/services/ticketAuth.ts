import { Capacitor } from '@capacitor/core';
import { clearAuthSession, getAuthToken } from '../context/AuthContext';
import { appConfig, ticketVerifyUrl } from '../config/env';
import type { TicketVerifyRequest, TicketVerifyResponse } from '../types/api';
import type { TicketInfo, TicketReason, TicketStatus } from '../types/ticket';
import { parseTicketPayload } from './ticketParser';
import { getScannedTickets, saveScannedTicket } from './scanHistory';

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
): Promise<TicketVerifyResponse | null> {
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
  const timer = window.setTimeout(() => controller.abort(), 12000);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Client-Origin': appConfig.corsOrigin,
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(ticketVerifyUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (res.status === 401) {
      clearAuthSession();
      return {
        ok: false,
        status: 'invalid',
        message: 'Session expirée — reconnectez-vous',
      };
    }

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as TicketVerifyResponse;
  } catch {
    return null;
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

  const api = await verifyWithApi(rawPayload, local, agentId);
  if (api) {
    const ticket = mergeTicket(local, api);
    await saveScannedTicket(ticket);
    return {
      ticket,
      isDuplicate: ticket.status === 'already_scanned',
      fromApi: true,
    };
  }

  const offline: TicketInfo = {
    ...local,
    ...emptyTripFields(),
    number: local.number,
    status: 'invalid',
    message:
      'Contrôle en base impossible (API indisponible). Aucune validation simulée.',
  };
  await saveScannedTicket(offline);
  return { ticket: offline, isDuplicate: false, fromApi: false };
}

export async function getHistory(): Promise<TicketInfo[]> {
  return getScannedTickets();
}
