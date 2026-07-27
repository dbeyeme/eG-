import type { RowDataPacket } from 'mysql2';
import type { Pool } from './db.js';

export type TicketRow = {
  id: string;
  numero: string;
  nom_passager: string;
  montant: number;
  is_online: number;
  agence_id: string;
  manifeste_id: string;
  supprime_le: string;
  mnf_numero: string | null;
  heure_depart: string | null;
  heure_enregistrement: string | null;
  jour: string | null;
  nom_trajet_config: string | null;
  localite_a: string | null;
  localite_b: string | null;
  tarif_catalogue: number | null;
};

export type CanonicalTicket = {
  number: string;
  passengerName: string;
  route: string;
  origin: string;
  destination: string;
  travelDate: string;
  boardingTime: string;
  fare: string;
};

const EMPTY_DATE = '0001-01-01';

export function extractTicketNumber(qrPayload?: string, ticketNumber?: string): string | null {
  const direct = ticketNumber?.trim();
  if (direct && /^TKT[-_A-Za-z0-9]+$/i.test(direct)) {
    return direct.toUpperCase();
  }

  const raw = (qrPayload || '').trim();
  if (!raw) return direct ? direct.toUpperCase() : null;

  const fromPath = raw.match(/\/ticket\/([A-Za-z0-9_-]+)/i);
  if (fromPath?.[1]) return fromPath[1].toUpperCase();

  try {
    const url = new URL(raw);
    const q =
      url.searchParams.get('ticket') ||
      url.searchParams.get('number') ||
      url.searchParams.get('tkt') ||
      url.searchParams.get('id');
    if (q) return q.toUpperCase();
    const last = url.pathname.split('/').filter(Boolean).pop();
    if (last && /^TKT/i.test(last)) return last.toUpperCase();
  } catch {
    // not a URL
  }

  if (/^TKT[-_A-Za-z0-9]+$/i.test(raw)) return raw.toUpperCase();

  const embedded = raw.match(/\b(TKT[-_A-Za-z0-9]+)\b/i);
  if (embedded?.[1]) return embedded[1].toUpperCase();

  return direct ? direct.toUpperCase() : null;
}

function formatDateFr(isoDate: string | null): string {
  if (!isoDate || isoDate.startsWith(EMPTY_DATE)) return '—';
  const [y, m, d] = isoDate.slice(0, 10).split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

/** Format FCFA : 35000 → "35 000 F" */
export function formatFare(amount: number): string {
  const n = Math.round(Number(amount) || 0);
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} F`;
}

function cleanPlace(value: string | null | undefined): string {
  return (value || '').trim();
}

export function resolveRoute(row: TicketRow): { route: string; origin: string; destination: string } {
  const origin = cleanPlace(row.localite_a);
  const destination = cleanPlace(row.localite_b);
  if (origin && destination) {
    return { route: `${origin} - ${destination}`, origin, destination };
  }

  const fallback = cleanPlace(row.nom_trajet_config) || '—';
  const parts = fallback.split(/\s*-\s*/);
  return {
    route: fallback,
    origin: parts[0] || fallback,
    destination: parts.slice(1).join(' - ') || '—',
  };
}

export function resolveBoardingTime(row: TicketRow): string {
  const fromManifeste = cleanPlace(row.heure_depart);
  if (fromManifeste) return fromManifeste;
  const fromConfig = cleanPlace(row.heure_enregistrement);
  return fromConfig || '—';
}

export function toCanonical(row: TicketRow): CanonicalTicket {
  const { route, origin, destination } = resolveRoute(row);
  return {
    number: row.numero.trim(),
    passengerName: row.nom_passager.trim(),
    route,
    origin,
    destination,
    travelDate: formatDateFr(row.jour),
    boardingTime: resolveBoardingTime(row),
    fare: formatFare(row.montant),
  };
}

const TICKET_SELECT = `
    SELECT
      t.id,
      t.numero,
      t.nom_passager,
      t.montant,
      t.is_online,
      t.agence_id,
      t.manifeste_id,
      t.supprime_le,
      m.numero AS mnf_numero,
      NULLIF(m.heure_depart, '') AS heure_depart,
      NULLIF(vc.heure_enregistrement, '') AS heure_enregistrement,
      v.jour,
      vc.nom_trajet AS nom_trajet_config,
      la.nom AS localite_a,
      lb.nom AS localite_b,
      COALESCE(tm.tarif_agence, tt.tarif_agence) AS tarif_catalogue
    FROM ticket t
    LEFT JOIN manifeste m
      ON m.id = t.manifeste_id AND t.manifeste_id <> ''
    LEFT JOIN voyage v
      ON v.id = t.voyage_id
    LEFT JOIN voyage_config vc
      ON vc.id = v.voyage_config_id
    LEFT JOIN trajet_tarif tt
      ON tt.id = t.trajet_tarif_id
    LEFT JOIN tarif_modif tm
      ON tm.trajet_tarif_id = t.trajet_tarif_id
     AND tm.voyage_id = t.voyage_id
    LEFT JOIN app_type la
      ON la.id = tt.localite_a_id AND la.cle = 'loc'
    LEFT JOIN app_type lb
      ON lb.id = tt.localite_b_id AND lb.cle = 'loc'
`;

/** Plusieurs agences réutilisent parfois le même numéro (TKT-…) — on charge toutes les lignes. */
export async function findTicketsByNumero(pool: Pool, numero: string): Promise<TicketRow[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    ${TICKET_SELECT}
    WHERE t.numero = :numero
    ORDER BY (t.manifeste_id <> '') DESC, t.id DESC
    `,
    { numero },
  );
  return rows as TicketRow[];
}

/** Préfère billet sur manifeste, non supprimé, le plus récent. */
export function pickPreferredTicket(rows: TicketRow[]): TicketRow | null {
  if (!rows.length) return null;
  const ranked = [...rows].sort((a, b) => {
    const aOk = isOnManifeste(a) && !isDeleted(a) ? 1 : 0;
    const bOk = isOnManifeste(b) && !isDeleted(b) ? 1 : 0;
    if (aOk !== bOk) return bOk - aOk;
    const aM = isOnManifeste(a) ? 1 : 0;
    const bM = isOnManifeste(b) ? 1 : 0;
    if (aM !== bM) return bM - aM;
    return 0;
  });
  return ranked[0] ?? null;
}

/**
 * Résout le billet selon le rôle :
 * - agence → uniquement son agence_id (sinon wrong_agence)
 * - admin → meilleur candidat toutes agences
 */
export function resolveTicketForAuth(
  rows: TicketRow[],
  auth: { role: string; agenceId: string | null },
): { row: TicketRow | null; wrongAgence: boolean } {
  if (!rows.length) return { row: null, wrongAgence: false };

  if (auth.role === 'agence' && auth.agenceId) {
    const scoped = rows.filter((r) => r.agence_id === auth.agenceId);
    if (!scoped.length) {
      return { row: pickPreferredTicket(rows), wrongAgence: true };
    }
    return { row: pickPreferredTicket(scoped), wrongAgence: false };
  }

  return { row: pickPreferredTicket(rows), wrongAgence: false };
}

/** @deprecated préférer findTicketsByNumero + resolveTicketForAuth */
export async function findTicketByNumero(pool: Pool, numero: string): Promise<TicketRow | null> {
  const rows = await findTicketsByNumero(pool, numero);
  return pickPreferredTicket(rows);
}

export function isDeleted(row: TicketRow): boolean {
  return Boolean(row.supprime_le) && !row.supprime_le.startsWith(EMPTY_DATE);
}

export function isOnManifeste(row: TicketRow): boolean {
  return Boolean(row.manifeste_id && row.manifeste_id.trim());
}

export async function findExistingScan(
  pool: Pool,
  ticketId: string,
): Promise<{ id: string; scanned_at: string; agent_id: string } | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, scanned_at, agent_id FROM ticket_scan WHERE ticket_id = :ticketId LIMIT 1`,
    { ticketId },
  );
  if (!rows.length) return null;
  return rows[0] as { id: string; scanned_at: string; agent_id: string };
}

export async function recordScan(
  pool: Pool,
  input: {
    ticketId: string;
    ticketNumero: string;
    agentId: string;
    channel: string;
    scannedAt: string;
  },
): Promise<string> {
  const id = `ver_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const scannedAt = new Date(input.scannedAt);
  const scannedSql = Number.isNaN(scannedAt.getTime()) ? new Date() : scannedAt;

  await pool.execute(
    `
    INSERT INTO ticket_scan (id, ticket_id, ticket_numero, agent_id, channel, scanned_at)
    VALUES (:id, :ticketId, :ticketNumero, :agentId, :channel, :scannedAt)
    `,
    {
      id,
      ticketId: input.ticketId,
      ticketNumero: input.ticketNumero,
      agentId: input.agentId || 'agent',
      channel: input.channel || 'web',
      scannedAt: scannedSql,
    },
  );

  return id;
}
