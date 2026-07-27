import 'dotenv/config';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { authenticateScannerUser } from './auth.js';
import { runMigrations, seedScannerUsers } from './bootstrap.js';
import { createPool } from './db.js';
import { signAuthToken, verifyAuthToken, type AuthTokenPayload } from './jwt.js';
import {
  extractTicketNumber,
  findExistingScan,
  findTicketsByNumero,
  isDeleted,
  isOnManifeste,
  recordScan,
  resolveTicketForAuth,
  toCanonical,
  type CanonicalTicket,
} from './tickets.js';

type VerifyBody = {
  qrPayload?: string;
  ticketNumber?: string;
  agentId?: string;
  scannedAt?: string;
  channel?: 'ios' | 'android' | 'web';
  appVersion?: string;
  passengerName?: string;
  route?: string;
  travelDate?: string;
  boardingTime?: string;
  fare?: string;
};

type AuthedRequest = Request & { auth?: AuthTokenPayload };

type MismatchField = keyof Pick<
  CanonicalTicket,
  'number' | 'passengerName' | 'route' | 'travelDate' | 'boardingTime' | 'fare'
>;

function normalize(value: string | undefined): string {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function collectMismatches(body: VerifyBody, ticket: CanonicalTicket): MismatchField[] {
  const checks: Array<[MismatchField, string | undefined]> = [
    ['passengerName', body.passengerName],
    ['route', body.route],
    ['travelDate', body.travelDate],
    ['boardingTime', body.boardingTime],
    ['fare', body.fare],
  ];

  const mismatches: MismatchField[] = [];
  for (const [field, incoming] of checks) {
    if (!incoming || !incoming.trim() || incoming === '—' || incoming === 'INCONNU') continue;
    if (normalize(incoming) !== normalize(ticket[field])) {
      mismatches.push(field);
    }
  }
  return mismatches;
}

function parseCorsOrigins(): string | string[] {
  const raw =
    process.env.CORS_ORIGIN ||
    'http://localhost:5173,https://scanner-app-gamma.vercel.app';
  const list = raw.split(',').map((o) => o.trim()).filter(Boolean);
  return list.length === 1 ? list[0]! : list;
}

async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) {
    res.status(401).json({ ok: false, message: 'Token manquant' });
    return;
  }
  const payload = await verifyAuthToken(match[1]);
  if (!payload) {
    res.status(401).json({ ok: false, message: 'Token invalide ou expiré' });
    return;
  }
  req.auth = payload;
  next();
}

const app = express();
const pool = createPool();
const port = Number(process.env.PORT || 3001);

app.use(
  cors({
    origin: parseCorsOrigins(),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'X-Client-Origin', 'Authorization'],
  }),
);
app.use(express.json({ limit: '64kb' }));

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'scanner-api', db: true });
  } catch {
    res.status(503).json({ ok: false, service: 'scanner-api', db: false });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  const username = String(req.body?.username || req.body?.identifier || '').trim();
  const password = String(req.body?.password || '');

  if (!username || !password) {
    res.status(400).json({
      ok: false,
      message: 'Identifiant et mot de passe requis',
    });
    return;
  }

  try {
    const user = await authenticateScannerUser(pool, username, password);
    if (!user) {
      res.status(401).json({
        ok: false,
        message: 'Identifiants invalides',
      });
      return;
    }

    const token = await signAuthToken(user);

    res.json({
      ok: true,
      token,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN || '12h',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        agenceId: user.agenceId,
        agenceCode: user.agenceCode,
        agentId: user.username,
      },
    });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ ok: false, message: 'Erreur serveur auth' });
  }
});

app.post('/api/v1/tickets/verify', requireAuth, async (req: AuthedRequest, res) => {
  const body = (req.body || {}) as VerifyBody;
  const auth = req.auth!;
  const numero = extractTicketNumber(body.qrPayload, body.ticketNumber);

  if (!numero) {
    res.json({
      ok: false,
      status: 'unknown_qr',
      reason: 'unknown_qr',
      message: 'QR non reconnu — aucun numéro de ticket Voyageur241',
    });
    return;
  }

  try {
    // Les numéros TKT peuvent exister chez plusieurs agences — on scope par rôle.
    const candidates = await findTicketsByNumero(pool, numero);
    const { row, wrongAgence } = resolveTicketForAuth(candidates, {
      role: auth.role,
      agenceId: auth.agenceId,
    });

    if (!row) {
      res.json({
        ok: false,
        status: 'not_found',
        reason: 'not_found',
        message: 'Ticket introuvable dans Voyageur241',
      });
      return;
    }

    if (wrongAgence) {
      res.json({
        ok: false,
        status: 'invalid',
        reason: 'wrong_agence',
        message: 'Ticket hors périmètre de votre agence — embarquement refusé',
        ticket: {
          number: numero,
          passengerName: '—',
          route: '—',
          origin: '—',
          destination: '—',
          travelDate: '—',
          boardingTime: '—',
          fare: '—',
        },
      });
      return;
    }

    const ticket = toCanonical(row);

    if (isDeleted(row)) {
      res.json({
        ok: false,
        status: 'invalid',
        reason: 'deleted',
        message: 'Ticket annulé / supprimé — embarquement refusé',
        ticket,
      });
      return;
    }

    if (!isOnManifeste(row)) {
      res.json({
        ok: false,
        status: 'invalid',
        reason: 'not_on_manifeste',
        message:
          'Ticket connu mais non inscrit sur un manifeste — embarquement refusé',
        ticket,
      });
      return;
    }

    const existing = await findExistingScan(pool, row.id);
    if (existing) {
      res.json({
        ok: false,
        status: 'already_scanned',
        reason: 'already_scanned',
        message: 'Ticket déjà contrôlé à l’embarquement',
        ticket,
        verificationId: existing.id,
      });
      return;
    }

    const mismatches = collectMismatches(body, ticket);
    if (mismatches.length) {
      res.json({
        ok: false,
        status: 'mismatch',
        reason: 'mismatch',
        message: 'Les données scannées ne correspondent pas au billet en base',
        mismatches,
        ticket,
      });
      return;
    }

    const verificationId = await recordScan(pool, {
      ticketId: row.id,
      ticketNumero: row.numero,
      agentId: body.agentId || auth.username || 'agent',
      channel: body.channel || 'web',
      scannedAt: body.scannedAt || new Date().toISOString(),
    });

    res.json({
      ok: true,
      status: 'valid',
      message: 'Ticket authentifié (présent en manifeste)',
      verificationId,
      ticket,
    });
  } catch (err) {
    console.error('verify error', err);
    res.status(500).json({
      ok: false,
      status: 'invalid',
      message: 'Erreur serveur lors de la vérification',
    });
  }
});

async function start() {
  try {
    await runMigrations(pool);
    await seedScannerUsers(pool);
    console.log('Migrations + seed users OK (v241, Premium-transport)');
  } catch (err) {
    console.error('Bootstrap failed (DB peut être encore vide):', err);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`scanner-api listening on 0.0.0.0:${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
