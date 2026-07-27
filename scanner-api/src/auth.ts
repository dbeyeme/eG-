import type { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import type { Pool } from './db.js';

export type ScannerRole = 'admin' | 'agence';

export type ScannerUser = {
  id: string;
  username: string;
  displayName: string;
  role: ScannerRole;
  agenceId: string | null;
  agenceCode: string | null;
};

type ScannerUserRow = {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  role: ScannerRole;
  agence_id: string | null;
  agence_code: string | null;
  is_active: number;
};

export async function findScannerUser(
  pool: Pool,
  username: string,
): Promise<ScannerUserRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT id, username, password_hash, display_name, role, agence_id, agence_code, is_active
    FROM scanner_user
    WHERE username = :username
    LIMIT 1
    `,
    { username: username.trim() },
  );
  if (!rows.length) return null;
  return rows[0] as ScannerUserRow;
}

export async function authenticateScannerUser(
  pool: Pool,
  username: string,
  password: string,
): Promise<ScannerUser | null> {
  const row = await findScannerUser(pool, username);
  if (!row || !row.is_active) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    agenceId: row.agence_id,
    agenceCode: row.agence_code,
  };
}

export async function upsertScannerUser(
  pool: Pool,
  input: {
    id: string;
    username: string;
    password: string;
    displayName: string;
    role: ScannerRole;
    agenceId?: string | null;
    agenceCode?: string | null;
  },
): Promise<void> {
  const passwordHash = await bcrypt.hash(input.password, 10);
  await pool.execute(
    `
    INSERT INTO scanner_user
      (id, username, password_hash, display_name, role, agence_id, agence_code, is_active)
    VALUES
      (:id, :username, :passwordHash, :displayName, :role, :agenceId, :agenceCode, 1)
    ON DUPLICATE KEY UPDATE
      password_hash = VALUES(password_hash),
      display_name = VALUES(display_name),
      role = VALUES(role),
      agence_id = VALUES(agence_id),
      agence_code = VALUES(agence_code),
      is_active = 1
    `,
    {
      id: input.id,
      username: input.username,
      passwordHash,
      displayName: input.displayName,
      role: input.role,
      agenceId: input.agenceId ?? null,
      agenceCode: input.agenceCode ?? null,
    },
  );
}
