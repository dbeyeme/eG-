import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from './db.js';
import { upsertScannerUser } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PREMIUM_AGENCE_ID = '301ap9c5qnd1npjs88jg';
const PREMIUM_AGENCE_CODE = 'premium-transport-18-03-53';

export async function runMigrations(pool: Pool): Promise<void> {
  const sqlDir = path.join(__dirname, '..', 'sql');
  for (const file of ['001_ticket_scan.sql', '002_scanner_user.sql']) {
    const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
    await pool.query(sql);
  }
}

export async function seedScannerUsers(pool: Pool): Promise<void> {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin241!';
  const agencyPassword = process.env.SEED_AGENCY_PASSWORD || 'Premium241!';

  await upsertScannerUser(pool, {
    id: 'su_admin_v241',
    username: 'v241',
    password: adminPassword,
    displayName: 'Admin Voyageur241',
    role: 'admin',
    agenceId: null,
    agenceCode: 'v241',
  });

  await upsertScannerUser(pool, {
    id: 'su_agence_premium',
    username: 'Premium-transport',
    password: agencyPassword,
    displayName: 'PREMIUM TRANSPORT',
    role: 'agence',
    agenceId: PREMIUM_AGENCE_ID,
    agenceCode: PREMIUM_AGENCE_CODE,
  });
}
