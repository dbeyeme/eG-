import 'dotenv/config';
import { createPool } from './db.js';
import { findTicketByNumero, isOnManifeste, toCanonical } from './tickets.js';

async function main() {
  const pool = createPool();
  for (const numero of ['TKT-2501-023', 'TKT-2512-032', 'TKT-2607-016', 'TKT-2607-013']) {
    const sample = await findTicketByNumero(pool, numero);
    if (!sample) {
      console.log({ numero, missing: true });
      continue;
    }
    console.log({
      numero,
      onManifeste: isOnManifeste(sample),
      canonical: toCanonical(sample),
    });
  }
  await pool.end();
  console.log('smoke OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
