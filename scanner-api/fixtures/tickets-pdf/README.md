# Tickets PDF de test

QR = `https://voyageur241.com/ticket/{NUMERO}` (lu par scanner-api).

| Fichier | Numéro | Attendu | Note |
|---|---|---|---|
| `TKT-2607-016.pdf` | TKT-2607-016 | `valid` | Présent en manifeste — 1er scan OK |
| `TKT-2607-015.pdf` | TKT-2607-015 | `valid` | Présent en manifeste — 1er scan OK |
| `TKT-2607-012.pdf` | TKT-2607-012 | `valid` | Présent en manifeste — 1er scan OK |
| `TKT-2501-023.pdf` | TKT-2501-023 | `valid` | Présent en manifeste (peut déjà être scanné en local) |
| `TKT-2512-032.pdf` | TKT-2512-032 | `invalid` | Hors manifeste — doit échouer |
| `TKT-2607-014.pdf` | TKT-2607-014 | `invalid` | Hors manifeste — doit échouer |

Régénérer : `npm run fixtures:tickets`
