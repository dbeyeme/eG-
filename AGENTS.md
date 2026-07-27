# Voyageur241 (eG-) — Agent Instructions

PWA mobile PHP pour contrôleurs de voyage (Gabon) : scan QR billets, manifestes, historique.

## Stack

- PHP pages plates (`*.php`) avec `header.php` / `footer.php`
- SCSS → `styles/styles.css` (sources dans `scss/`)
- JS jQuery + Bootstrap + Swiper + `html5-qrcode` (scan)
- PWA : `_manifest.json`, `_service-worker.js`, icônes `app/icons/`
- UI FR, thème accent `#58d68d`, marque **Voyageur241**

## Architecture pages

| Page | Rôle |
|------|------|
| `index.php` | Connexion contrôleur |
| `home.php` | Manifestes + onglets QR / Billets |
| `history.php` / `filter-research.php` | Historique / filtres tickets |
| `profile.php` / `setting.php` | Profil / réglages |
| `verify-otp.php`, `reset-password.php`, `new-pass.php` | Auth recovery |
| `successful.php` | Confirmation |

Inclure toujours `header.php` / `footer.php`. Scripts communs et logique scan QR vivent surtout dans `footer.php`.

## Conventions

- Préserver classes CSS existantes (`tf-container`, `tf-btn`, `tf-form`, etc.)
- Texte UI en français
- Pas de framework PHP/backend API encore — état scan en `localStorage` (`scannedTickets`)
- Audio succès / échec : `3beeps-108353.mp3`, `censor-beep-1sec-8112.mp3`
- Routes manifeste exemples : LBV-OYEM, OYEM-LBV, FCV-BITAM, FCV-LBV

## Agents Hermes

| Profil | Rôle |
|--------|------|
| `voyageur-orchestrator` | Planifie, délègue, intègre |
| `voyageur-php` | Pages PHP / includes / flux |
| `voyageur-ui` | SCSS, layout mobile, composants |
| `voyageur-scanner` | QR, localStorage, feedback audio |
| `voyageur-reviewer` | Review sécurité / UX / régression |

Délégation : orchestrateur → sous-agents via `delegate_task` ou kanban. Skills : `voyageur-php-pages`, `voyageur-qr-scanner`, `voyageur-mobile-ui`.

## Ne pas faire

- Ne pas remplacer jQuery/Bootstrap sans demande
- Ne pas casser le scan QR ni le cooldown
- Ne pas committer secrets / `.env`
- Ne pas changer la marque / couleurs sans demande
