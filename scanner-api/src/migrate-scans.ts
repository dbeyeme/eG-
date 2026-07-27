import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const pool = createPool();
  const sqlPath = path.join(__dirname, '..', 'sql', '001_ticket_scan.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await pool.query(sql);
  console.log('OK: table ticket_scan prête');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
