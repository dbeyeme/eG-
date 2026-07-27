import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'fixtures', 'tickets-pdf');

type SampleTicket = {
  number: string;
  passengerName: string;
  route: string;
  travelDate: string;
  boardingTime: string;
  fare: string;
  manifeste: string | null;
  /** Expected verify status for scanner-api */
  expect: 'valid' | 'invalid';
  note: string;
};

const TICKETS: SampleTicket[] = [
  {
    number: 'TKT-2607-016',
    passengerName: 'ONGONE EUNICE',
    route: 'LIBREVILLE - FRANCEVILLE',
    travelDate: '24/07/2026',
    boardingTime: '08:40',
    fare: '25000 F',
    manifeste: 'MNF-2607-001',
    expect: 'valid',
    note: 'Présent en manifeste — 1er scan OK',
  },
  {
    number: 'TKT-2607-015',
    passengerName: 'MUZUMA SOSA MONIQUE',
    route: 'LIBREVILLE - FRANCEVILLE',
    travelDate: '24/07/2026',
    boardingTime: '08:40',
    fare: '30000 F',
    manifeste: 'MNF-2607-001',
    expect: 'valid',
    note: 'Présent en manifeste — 1er scan OK',
  },
  {
    number: 'TKT-2607-012',
    passengerName: 'BONGNI BRENDA',
    route: 'LIBREVILLE - FRANCEVILLE',
    travelDate: '24/07/2026',
    boardingTime: '08:40',
    fare: '35000 F',
    manifeste: 'MNF-2607-001',
    expect: 'valid',
    note: 'Présent en manifeste — 1er scan OK',
  },
  {
    number: 'TKT-2501-023',
    passengerName: 'EMENE MANZEING',
    route: 'LIBREVILLE - MAKOKOU',
    travelDate: '29/01/2025',
    boardingTime: '08:25',
    fare: '13500 F',
    manifeste: 'MNF-2502-008',
    expect: 'valid',
    note: 'Présent en manifeste (peut déjà être scanné en local)',
  },
  {
    number: 'TKT-2512-032',
    passengerName: 'MIDIAKA FOSTEL E',
    route: 'LIBREVILLE - FRANCEVILLE',
    travelDate: '29/12/2025',
    boardingTime: '06:00',
    fare: '35000 F',
    manifeste: null,
    expect: 'invalid',
    note: 'Hors manifeste — doit échouer',
  },
  {
    number: 'TKT-2607-014',
    passengerName: 'MONGOYI PRISCA',
    route: 'LIBREVILLE - FRANCEVILLE',
    travelDate: '25/07/2026',
    boardingTime: '06:00',
    fare: '33000 F',
    manifeste: null,
    expect: 'invalid',
    note: 'Hors manifeste — doit échouer',
  },
];

const ACCENT = '#1a7a4c';
const MUTED = '#5a6b63';
const PAGE = { width: 420, height: 595 }; // A6-ish portrait

function qrPayload(ticket: SampleTicket): string {
  return `https://voyageur241.com/ticket/${ticket.number}`;
}

async function drawTicket(ticket: SampleTicket, filePath: string) {
  const payload = qrPayload(ticket);
  const qrPng = await QRCode.toBuffer(payload, {
    type: 'png',
    width: 220,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#10231a', light: '#ffffff' },
  });

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: [PAGE.width, PAGE.height],
      margin: 28,
      info: {
        Title: `Billet ${ticket.number}`,
        Author: 'Voyageur241',
        Subject: 'Ticket test scanner QR',
      },
    });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    stream.on('finish', () => resolve());
    stream.on('error', reject);

    // Header band
    doc.rect(0, 0, PAGE.width, 72).fill(ACCENT);
    doc
      .fillColor('#ffffff')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Voyageur241', 28, 22, { width: PAGE.width - 56 });
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Billet de voyage — test scanner', 28, 46, { width: PAGE.width - 56 });

    let y = 92;
    doc.fillColor('#10231a').font('Helvetica-Bold').fontSize(13).text(ticket.number, 28, y);
    y += 22;
    doc
      .fillColor(MUTED)
      .font('Helvetica')
      .fontSize(9)
      .text(ticket.expect === 'valid' ? `Manifeste ${ticket.manifeste}` : 'Hors manifeste (échec attendu)', 28, y);
    y += 28;

    const rows: Array<[string, string]> = [
      ['Passager', ticket.passengerName],
      ['Trajet', ticket.route],
      ['Date', ticket.travelDate],
      ['Convocation', ticket.boardingTime],
      ['Tarif', ticket.fare],
    ];

    for (const [label, value] of rows) {
      doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(label.toUpperCase(), 28, y);
      doc.fillColor('#10231a').font('Helvetica-Bold').fontSize(11).text(value, 28, y + 11);
      y += 34;
    }

    // QR
    const qrX = (PAGE.width - 180) / 2;
    doc.image(qrPng, qrX, y, { width: 180, height: 180 });
    y += 192;

    doc
      .fillColor(MUTED)
      .font('Helvetica')
      .fontSize(8)
      .text(payload, 28, y, { width: PAGE.width - 56, align: 'center' });
    y += 22;
    doc
      .fillColor(ticket.expect === 'valid' ? ACCENT : '#a33')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(ticket.note, 28, y, { width: PAGE.width - 56, align: 'center' });

    // Footer
    doc
      .fillColor(MUTED)
      .font('Helvetica')
      .fontSize(7)
      .text('PDF de test — données issues de voyageur-241.sql', 28, PAGE.height - 36, {
        width: PAGE.width - 56,
        align: 'center',
      });

    doc.end();
  });
}

async function writeIndex() {
  const lines = [
    '# Tickets PDF de test',
    '',
    'QR = `https://voyageur241.com/ticket/{NUMERO}` (lu par scanner-api).',
    '',
    '| Fichier | Numéro | Attendu | Note |',
    '|---|---|---|---|',
    ...TICKETS.map(
      (t) =>
        `| \`${t.number}.pdf\` | ${t.number} | \`${t.expect}\` | ${t.note} |`,
    ),
    '',
    'Régénérer : `npm run fixtures:tickets`',
  ];
  fs.writeFileSync(path.join(outDir, 'README.md'), `${lines.join('\n')}\n`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const ticket of TICKETS) {
    const file = path.join(outDir, `${ticket.number}.pdf`);
    await drawTicket(ticket, file);
    console.log('OK', path.relative(process.cwd(), file));
  }
  await writeIndex();
  console.log(`\n${TICKETS.length} PDF dans ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
