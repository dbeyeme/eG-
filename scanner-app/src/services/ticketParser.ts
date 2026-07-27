import type { TicketInfo, TicketStatus } from '../types/ticket';

function makeId(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function baseTicket(
  fields: Partial<Omit<TicketInfo, 'id' | 'status' | 'rawPayload' | 'scannedAt' | 'message' | 'reason'>>,
  rawPayload: string,
  status: TicketStatus,
  message?: string,
  reason?: TicketInfo['reason'],
): TicketInfo {
  return {
    id: makeId(),
    number: fields.number ?? 'INCONNU',
    passengerName: fields.passengerName ?? '—',
    route: fields.route ?? '—',
    travelDate: fields.travelDate ?? '—',
    boardingTime: fields.boardingTime ?? '—',
    fare: fields.fare ?? '—',
    status,
    message,
    reason,
    rawPayload,
    scannedAt: new Date().toISOString(),
  };
}

function extractTicketNumberFromText(text: string): string | null {
  const fromPath = text.match(/\/ticket\/([A-Za-z0-9_-]+)/i);
  if (fromPath?.[1] && /^TKT/i.test(fromPath[1])) return fromPath[1].toUpperCase();

  try {
    const url = new URL(text);
    const q =
      url.searchParams.get('ticket') ||
      url.searchParams.get('number') ||
      url.searchParams.get('tkt') ||
      url.searchParams.get('id');
    if (q && /^TKT/i.test(q)) return q.toUpperCase();
    const last = url.pathname.split('/').filter(Boolean).pop();
    if (last && /^TKT/i.test(last)) return last.toUpperCase();
  } catch {
    // not a URL
  }

  if (/^TKT[-_A-Za-z0-9]+$/i.test(text)) return text.toUpperCase();
  const embedded = text.match(/\b(TKT[-_A-Za-z0-9]+)\b/i);
  if (embedded?.[1]) return embedded[1].toUpperCase();
  return null;
}

function isVoyageurHost(text: string): boolean {
  try {
    const host = new URL(text).hostname.toLowerCase();
    return host === 'voyageur241.com' || host.endsWith('.voyageur241.com');
  } catch {
    return false;
  }
}

function parseJsonPayload(text: string): Partial<TicketInfo> | null {
  try {
    const data = JSON.parse(text) as Record<string, unknown>;
    const number = String(data.number ?? data.ticketNumber ?? data.ticket ?? '');
    if (!number) return null;
    return {
      number,
      passengerName: String(data.passengerName ?? data.nom ?? data.name ?? '') || undefined,
      route: String(data.route ?? data.trajet ?? '') || undefined,
      travelDate: String(data.travelDate ?? data.date ?? '') || undefined,
      boardingTime: String(data.boardingTime ?? data.convocation ?? '') || undefined,
      fare: String(data.fare ?? data.tarif ?? '') || undefined,
    };
  } catch {
    return null;
  }
}

function parseMultilinePayload(text: string): Partial<TicketInfo> | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  const pick = (label: RegExp) => {
    const line = lines.find((l) => label.test(l));
    if (!line) return '';
    const parts = line.split(':');
    return parts.slice(1).join(':').trim();
  };

  const number =
    pick(/numero|numéro|ticket|tkt/i) ||
    lines.find((l) => /^TKT-/i.test(l)) ||
    '';

  if (!number) return null;

  return {
    number,
    passengerName: pick(/nom|passager|passenger/i) || undefined,
    route: pick(/trajet|route|voyage/i) || undefined,
    travelDate: pick(/date/i) || undefined,
    boardingTime: pick(/convocation|boarding|heure/i) || undefined,
    fare: pick(/tarif|fare|prix/i) || undefined,
  };
}

/** Resolve QR raw text into ticket fields (without inventing demo data). */
export function parseTicketPayload(raw: string): TicketInfo {
  const text = raw.trim();

  if (!text) {
    return baseTicket(
      {},
      text,
      'invalid',
      'QR vide',
      'unknown_qr',
    );
  }

  if (/waiting/i.test(text)) {
    return baseTicket({}, text, 'pending', 'Scan en attente');
  }

  const fromJson = parseJsonPayload(text);
  if (fromJson?.number) {
    return baseTicket(fromJson, text, 'pending');
  }

  if (text.startsWith('http://') || text.startsWith('https://')) {
    const number = extractTicketNumberFromText(text);
    if (!isVoyageurHost(text) && !number) {
      return baseTicket(
        {},
        text,
        'invalid',
        'QR hors Voyageur241',
        'unknown_qr',
      );
    }
    if (!number) {
      return baseTicket(
        {},
        text,
        'invalid',
        'QR Voyageur241 sans numéro de ticket',
        'unknown_qr',
      );
    }
    return baseTicket({ number }, text, 'pending');
  }

  const fromLines = parseMultilinePayload(text);
  if (fromLines?.number) {
    return baseTicket(fromLines, text, 'pending');
  }

  if (/^TKT[-_A-Za-z0-9]+$/i.test(text)) {
    return baseTicket({ number: text.toUpperCase() }, text, 'pending');
  }

  return baseTicket(
    {},
    text,
    'invalid',
    'QR non reconnu (hors Voyageur241)',
    'unknown_qr',
  );
}
